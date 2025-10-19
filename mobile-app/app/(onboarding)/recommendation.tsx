import { useEffect, useState } from "react";
import { View } from "react-native";
import { Text, Button, Card, ActivityIndicator } from "react-native-paper";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "../../src/stores/onboardingStore";
import { useAuthStore } from "../../src/stores/authStore";
import BaseLayout from "../../src/components/BaseLayout";
import type { ModeSuggestion } from "../../src/types/onboarding";

export default function RecommendationScreen() {
  const router = useRouter();
  const { data, submitOnboarding, profile, isLoading, error, clearError, reset } =
    useOnboardingStore();
  const { refreshUser } = useAuthStore();

  const [modeToConfirm, setModeToConfirm] = useState<ModeSuggestion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-compute suggestion based on data (client-side preview)
  // The actual computation happens on the backend
  const suggestedMode: ModeSuggestion =
    data.redFlags && data.redFlags.length > 0
      ? "rehab"
      : data.painRest && data.painRest >= 4
        ? "rehab"
        : data.onset === "recent" || data.onset === "ongoing"
          ? "rehab"
          : "maintenance";

  const handleConfirm = async (mode: ModeSuggestion) => {
    try {
      setIsSubmitting(true);
      clearError();

      // Submit to backend
      const result = await submitOnboarding(mode);

      // Refresh user to get updated mode
      await refreshUser();

      // Navigate based on selected mode
      if (mode === "rehab") {
        router.replace("/(onboarding)/rehab-setup");
        // Don't clear data yet - rehab-setup needs it
      } else {
        // Clear onboarding data for maintenance mode (no rehab-setup needed)
        reset();
        router.replace("/maintenance-home");
      }
    } catch (err) {
      // Error handled by store
      setIsSubmitting(false);
    }
  };

  if (isLoading || isSubmitting) {
    return (
      <BaseLayout centered>
        <ActivityIndicator size="large" />
        <Text variant="titleMedium" className="mt-4">
          Analyzing your profile...
        </Text>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <View className="mb-6">
        <Text variant="headlineMedium" className="font-bold mb-2">
          Your personalized recommendation
        </Text>
        <Text variant="bodyLarge" className="text-gray-600">
          Based on what you've shared
        </Text>
      </View>

      {/* Recommendation Card */}
      <Card mode="elevated" className="mb-6 bg-indigo-50">
        <Card.Content className="py-6">
          <Text variant="headlineSmall" className="font-bold mb-3">
            {suggestedMode === "rehab" ? "🦵 Rehab Mode" : "💪 Maintenance Mode"}
          </Text>
          <Text variant="bodyLarge" className="mb-4">
            {suggestedMode === "rehab"
              ? "We recommend Rehab Mode for structured recovery tracking with daily logs and progress monitoring."
              : "We recommend Maintenance Mode for post-recovery wellness tracking to maintain your progress."}
          </Text>

          {/* Show reason if available from backend */}
          {profile?.reasoning && (
            <View className="bg-white p-3 rounded-lg">
              <Text variant="bodyMedium" className="text-gray-700">
                {profile.reasoning}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Confirm or Override */}
      <View className="gap-3 mb-4">
        <Button
          mode="contained"
          onPress={() => handleConfirm(suggestedMode)}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          <Text>Continue with {suggestedMode === "rehab" ? "Rehab" : "Maintenance"}</Text>
        </Button>

        <Button
          mode="outlined"
          onPress={() => handleConfirm(suggestedMode === "rehab" ? "maintenance" : "rehab")}
          disabled={isSubmitting}
        >
          <Text>Switch to {suggestedMode === "rehab" ? "Maintenance" : "Rehab"} instead</Text>
        </Button>
      </View>

      {error && (
        <View className="bg-red-50 p-3 rounded-lg mb-4">
          <Text variant="bodyMedium" className="text-red-900">
            {error}
          </Text>
        </View>
      )}

      <View className="bg-gray-50 p-3 rounded-lg">
        <Text variant="bodySmall" className="text-gray-600 text-center">
          This is general guidance only, not a diagnosis. You can always switch modes later.
        </Text>
      </View>
    </BaseLayout>
  );
}
