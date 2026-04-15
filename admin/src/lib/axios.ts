import axios from "axios";
// export const secret =import.meta.env.VITE_REVERB_APP_KEY
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem("access_token"),
  setAccessToken: (token: string) => localStorage.setItem("access_token", token),
  getRefreshToken: () => localStorage.getItem("refresh_token"),
  setRefreshToken: (token: string) => localStorage.setItem("refresh_token", token),
  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

export const API = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});


API.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      tokenStorage.getRefreshToken()
    ) {
      originalRequest._retry = true;

      try {
        const res = await API.post("/token/refresh", {
          refresh_token: tokenStorage.getRefreshToken(),
        });

        const newAccessToken = res.data.access_token;
        tokenStorage.setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (err) {
        tokenStorage.clear();
        window.location.href = "/";
        console.error("Refresh token failed:", err);
      }
    }

    return Promise.reject(error);
  }
);
