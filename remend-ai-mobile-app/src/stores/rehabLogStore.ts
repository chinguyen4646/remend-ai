import { create } from "zustand";
import { rehabLogsApi } from "../api/rehabLogs";
import type { RehabLog, CreateRehabLogData } from "../types/rehabLog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { todayLocal } from "../utils/dates";

interface RehabLogState {
  logs: RehabLog[];
  isLoading: boolean;
  error: string | null;
  hasLoggedToday: boolean;

  // Actions
  loadLogs: (programId?: string | number) => Promise<void>;
  createLog: (data: CreateRehabLogData) => Promise<void>;
  clearError: () => void;
}

export const useRehabLogStore = create<RehabLogState>((set, get) => ({
  logs: [],
  isLoading: false,
  error: null,
  hasLoggedToday: false,

  loadLogs: async (programId = "active") => {
    set({ isLoading: true, error: null });
    try {
      const { logs } = await rehabLogsApi.getLogs({
        programId,
        range: "last_14",
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

  createLog: async (data: CreateRehabLogData) => {
    set({ isLoading: true, error: null });
    try {
      await rehabLogsApi.createLog(data);

      // Optimistically refresh logs after successful creation
      await get().loadLogs(data.programId);

      set({ isLoading: false });
    } catch (err: any) {
      const status = err.response?.status;
      let errorMessage = "Failed to create log";

      // Friendly error messages
      if (status === 409) {
        errorMessage = "You've already logged today. Edit your entry tomorrow.";
      } else if (status === 422) {
        errorMessage = "Scores must be between 0-10";
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
