import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api/client";
import type {
  OnboardingData,
  OnboardingProfile,
  OnboardingSubmission,
  // Area,
  // Onset,
  // Timing,
  // ActivityLevel,
  Goal,
  RedFlag,
  ModeSuggestion,
} from "../types/onboarding";

interface OnboardingStore {
  // Onboarding data
  data: Partial<OnboardingData>;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Result from submission
  profile: OnboardingProfile | null;

  // Actions
  setBaselineData: (data: Partial<OnboardingData>) => void;
  setGoal: (goal: Goal) => void;
  setRedFlags: (flags: RedFlag[]) => void;
  submitOnboarding: (modeSelected: ModeSuggestion) => Promise<OnboardingProfile>;
  clearError: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      // Initial state
      data: {},
      isLoading: false,
      error: null,
      profile: null,

      // Actions
      setBaselineData: (baselineData) =>
        set((state) => ({
          data: { ...state.data, ...baselineData },
        })),

      setGoal: (goal) =>
        set((state) => ({
          data: { ...state.data, goal },
        })),

      setRedFlags: (redFlags) =>
        set((state) => ({
          data: { ...state.data, redFlags },
        })),

      submitOnboarding: async (modeSelected) => {
        set({ isLoading: true, error: null });

        try {
          const onboardingData = get().data as OnboardingData;

          // Validate we have all required fields
          if (
            !onboardingData.area ||
            !onboardingData.onset ||
            onboardingData.painRest === undefined ||
            onboardingData.painActivity === undefined ||
            onboardingData.stiffness === undefined ||
            !onboardingData.timing ||
            !onboardingData.aggravators ||
            !onboardingData.easers ||
            !onboardingData.activityLevel ||
            !onboardingData.goal ||
            !onboardingData.redFlags
          ) {
            throw new Error("Please complete all onboarding steps");
          }

          const submission: OnboardingSubmission = {
            ...onboardingData,
            modeSelected,
          };

          const response = await api.post<{ profile: OnboardingProfile }>(
            "/api/onboarding/submit",
            submission,
          );

          const profile = response.data.profile;

          set({ profile, isLoading: false });

          // Don't clear data yet - rehab-setup needs it for area
          // Data will be cleared when user reaches home screen or manually

          return profile;
        } catch (err: any) {
          const errorMessage =
            err.response?.data?.errors?.[0]?.message || "Failed to submit onboarding";
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      clearError: () => set({ error: null }),

      reset: () =>
        set({
          data: {},
          isLoading: false,
          error: null,
          profile: null,
        }),
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the data field, not loading/error states
      partialize: (state) => ({ data: state.data }),
    },
  ),
);
