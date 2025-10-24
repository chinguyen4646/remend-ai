import { useState } from "react";
import { View } from "react-native";
import { Text, Button, Card, ActivityIndicator } from "react-native-paper";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "../../src/stores/onboardingStore";
import { useAuthStore } from "../../src/stores/authStore";
import BaseLayout from "../../src/components/BaseLayout";

export default function RecommendationScreen() {
  const router = useRouter();
  const { submitOnboarding, profile, isLoading, error, clearError } = useOnboardingStore();
  const { refreshUser } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      clearError();

      // Submit to backend with rehab mode
      const result = await submitOnboarding("rehab");

      // Refresh user to get updated mode
      await refreshUser();

      // Navigate to rehab setup
      router.replace("/(onboarding)/rehab-setup");
      // Don't clear data yet - rehab-setup needs it
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
            🦵 Rehab Mode
          </Text>
          <Text variant="bodyLarge" className="mb-4">
            Get structured recovery tracking with daily logs and progress monitoring to support your
            recovery journey.
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

      {/* Confirm Button */}
      <View className="mb-4">
        <Button
          mode="contained"
          onPress={handleConfirm}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          <Text>Continue with Rehab</Text>
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
