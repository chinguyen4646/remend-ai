import { create } from "zustand";
import { rehabApi } from "../api/rehab";
import type { RehabProgram, CreateProgramData } from "../types/rehab";

interface RehabProgramState {
  activeProgram: RehabProgram | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadActiveProgram: () => Promise<void>;
  createProgram: (data: CreateProgramData) => Promise<void>;
  clearError: () => void;
}

export const useRehabProgramStore = create<RehabProgramState>((set) => ({
  activeProgram: null,
  isLoading: false,
  error: null,

  loadActiveProgram: async () => {
    try {
      set({ isLoading: true, error: null });
      const program = await rehabApi.getActiveProgram();
      set({ activeProgram: program, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.errors?.[0]?.message || "Failed to load program",
        isLoading: false,
      });
    }
  },

  createProgram: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await rehabApi.createProgram(data);
      set({
        activeProgram: response.program,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.message || "Failed to create program";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
