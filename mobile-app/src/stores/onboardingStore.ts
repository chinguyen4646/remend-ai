import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api/client";
import type {
  OnboardingData,
  OnboardingProfile,
  OnboardingSubmission,
  Area,
  Onset,
  RedFlag,
} from "../types/onboarding";

interface OnboardingStore {
  // Onboarding data (V2)
  data: Partial<OnboardingData>;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Result from submission
  profile: OnboardingProfile | null;

  // V2 Actions
  setArea: (area: Area, areaOtherLabel?: string) => void;
  setDescription: (userDescription: string, redFlags: RedFlag[]) => void;
  setDurationIntensity: (
    onset: Onset,
    painRest: number,
    painActivity: number,
    stiffness: number,
  ) => void;
  setAggravatorsEasers: (aggravators: string[], easers: string[]) => void;
  submitOnboarding: () => Promise<OnboardingProfile>;
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

      // V2 Actions
      setArea: (area, areaOtherLabel) =>
        set((state) => ({
          data: { ...state.data, area, areaOtherLabel },
        })),

      setDescription: (userDescription, redFlags) =>
        set((state) => ({
          data: { ...state.data, userDescription, redFlags },
        })),

      setDurationIntensity: (onset, painRest, painActivity, stiffness) =>
        set((state) => ({
          data: { ...state.data, onset, painRest, painActivity, stiffness },
        })),

      setAggravatorsEasers: (aggravators, easers) =>
        set((state) => ({
          data: { ...state.data, aggravators, easers },
        })),

      submitOnboarding: async () => {
        set({ isLoading: true, error: null });

        try {
          const onboardingData = get().data as OnboardingData;

          // Validate we have all required V2 fields
          if (
            !onboardingData.area ||
            !onboardingData.userDescription ||
            onboardingData.userDescription.trim().length < 10 ||
            !onboardingData.onset ||
            onboardingData.painRest === undefined ||
            onboardingData.painActivity === undefined ||
            onboardingData.stiffness === undefined ||
            !onboardingData.aggravators ||
            !onboardingData.easers ||
            !onboardingData.redFlags
          ) {
            throw new Error("Please complete all onboarding steps");
          }

          // Hardcode mode to rehab (maintenance disabled)
          const submission: OnboardingSubmission = {
            ...onboardingData,
            modeSelected: "rehab",
          };

          const response = await api.post<{ profile: OnboardingProfile }>(
            "/api/onboarding/submit",
            submission,
          );

          const profile = response.data.profile;

          set({ profile, isLoading: false });

          // Don't clear data yet - ai-insight screen needs it
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
