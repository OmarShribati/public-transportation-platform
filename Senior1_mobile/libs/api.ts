import axios from "axios";
import * as SecureStore from "expo-secure-store";
// const getBaseURL = () => {
//   if (Platform.OS === "ios") {
//     // return "http://web-production-d9b56.up.railway.app/api";
//     return "https://primary-tassel-dwindle.ngrok-free.dev/api";
//   } else {
//     return "https://web-production-d9b56.up.railway.app/api";
//   }
// };
export const tokenStorage = {
  getAccessToken: async () => {
    return await SecureStore.getItemAsync("user_token");
  },
  setAccessToken: async (token: string) => {
    await SecureStore.setItemAsync("user_token", token);
  },
  clear: async () => {
    await SecureStore.deleteItemAsync("user_token");
    await SecureStore.deleteItemAsync("refresh_token");
  },
};
export const API = axios.create({
  baseURL: "https://deduct-same-praising.ngrok-free.dev/api",
  timeout: 10000,
});

API.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});
