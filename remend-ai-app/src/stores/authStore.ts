import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../api/auth";
import type { User, LoginCredentials, RegisterCredentials } from "../types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.login(credentials);

      await AsyncStorage.setItem("auth_token", response.token.value);
      await AsyncStorage.setItem("user", JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.token.value,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.register(credentials);

      await AsyncStorage.setItem("auth_token", response.token.value);
      await AsyncStorage.setItem("user", JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.token.value,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.errors?.[0]?.message || "Registration failed",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("user");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });
      const token = await AsyncStorage.getItem("auth_token");
      const userJson = await AsyncStorage.getItem("user");

      if (token && userJson) {
        const user = JSON.parse(userJson);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        // Verify token is still valid
        try {
          const response = await authApi.me();
          set({ user: response.user });
        } catch (error) {
          // Token invalid, clear auth
          await AsyncStorage.removeItem("auth_token");
          await AsyncStorage.removeItem("user");
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
