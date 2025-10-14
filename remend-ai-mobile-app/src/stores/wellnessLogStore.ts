import { create } from "zustand";
import { wellnessLogsApi } from "../api/wellnessLogs";
import type { WellnessLog, CreateWellnessLogData } from "../types/wellnessLog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { todayLocal } from "../utils/dates";

interface WellnessLogState {
  logs: WellnessLog[];
  isLoading: boolean;
  error: string | null;
  hasLoggedToday: boolean;

  // Actions
  loadLogs: (mode: "maintenance" | "general") => Promise<void>;
  createLog: (data: CreateWellnessLogData) => Promise<void>;
  clearError: () => void;
}

export const useWellnessLogStore = create<WellnessLogState>((set, get) => ({
  logs: [],
  isLoading: false,
  error: null,
  hasLoggedToday: false,

  loadLogs: async (mode: "maintenance" | "general") => {
    set({ isLoading: true, error: null });
    try {
      const logs = await wellnessLogsApi.getLogs({
        mode,
        range: "last_7",
      });

      // Check if today's date exists in logs
      const today = todayLocal();
      const hasLoggedToday = logs.some((log) => log.date === today);

      set({ logs, hasLoggedToday, isLoading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.errors?.[0]?.message || "Failed to load logs";
      set({ error: errorMessage, isLoading: false });

      // Handle 401 - clear session
      if (err.response?.status === 401) {
        await AsyncStorage.removeItem("auth_token");
        await AsyncStorage.removeItem("user");
      }
    }
  },

  createLog: async (data: CreateWellnessLogData) => {
    set({ isLoading: true, error: null });
    try {
      await wellnessLogsApi.createLog(data);

      // Optimistically refresh logs after successful creation
      await get().loadLogs(data.mode);

      set({ isLoading: false });
    } catch (err: any) {
      const status = err.response?.status;
      let errorMessage = "Failed to create check-in";

      // Friendly error messages
      if (status === 409) {
        errorMessage = "You've already checked in today. Try again tomorrow.";
      } else if (status === 422) {
        errorMessage = "Please check your input values";
      } else if (status === 401) {
        errorMessage = "Session expired. Please log in again.";
        await AsyncStorage.removeItem("auth_token");
        await AsyncStorage.removeItem("user");
      } else if (err.response?.data?.errors?.[0]?.message) {
        errorMessage = err.response.data.errors[0].message;
      }

      set({ error: errorMessage, isLoading: false });
      throw err; // Re-throw so UI can handle it
    }
  },

  clearError: () => set({ error: null }),
}));
