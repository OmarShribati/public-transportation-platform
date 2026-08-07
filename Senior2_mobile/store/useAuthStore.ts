import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

interface AuthState {
  token: string | null;
  account_type: string | null;
  id: number | null;
  email: string | null;
  is_admin: boolean | null;
  isLoading: boolean;

  setAuth: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  account_type: null,
  id: null,
  email: null,
  is_admin: null,
  isLoading: true,

  setAuth: async (data) => {
    
    await SecureStore.setItemAsync("user_token", data.token);

    await SecureStore.setItemAsync("user_data", JSON.stringify(data));

    set({
      token: data.token,
      account_type: data.account_type,
      id: data.id,
      email: data.email,
      is_admin: data.is_admin,
      isLoading: false,
    });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("user_token");
    await SecureStore.deleteItemAsync("user_data");

    set({
      token: null,
      account_type: null,
      id: null,
      email: null,
      is_admin: null,
      isLoading: false,
    });
  },

  checkAuth: async () => {
    const token = await SecureStore.getItemAsync("user_token");
    const user = await SecureStore.getItemAsync("user_data");

    if (token && user) {
      const parsed = JSON.parse(user);

      set({
        token,
        account_type: parsed.account_type,
        id: parsed.id,
        email: parsed.email,
        is_admin: parsed.is_admin,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },
}));