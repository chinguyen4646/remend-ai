import { useState, useEffect } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { Text, Button, Chip, Divider } from "react-native-paper";
import { useRouter } from "expo-router";
import BaseLayout from "../../src/components/BaseLayout";
import { useOnboardingStore } from "../../src/stores/onboardingStore";
import { useRehabProgramStore } from "../../src/stores/rehabProgramStore";
import type { BodySide } from "../../src/types/onboarding";

const SIDE_OPTIONS: { value: BodySide; label: string; icon: string }[] = [
  { value: "left", label: "Left", icon: "⬅️" },
  { value: "right", label: "Right", icon: "➡️" },
  { value: "both", label: "Both sides", icon: "↔️" },
  { value: "na", label: "Not applicable", icon: "—" },
];

export default function AIInsightScreen() {
  const router = useRouter();
  const {
    submitOnboarding,
    profile,
    isLoading,
    error,
    data: onboardingData,
  } = useOnboardingStore();
  const { createProgram } = useRehabProgramStore();

  const [selectedSide, setSelectedSide] = useState<BodySide | null>(null);
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);

  // Submit onboarding on mount
  useEffect(() => {
    const submit = async () => {
      try {
        const result = await submitOnboarding();

        // Set smart default for side if AI suggested one
        if (result.aiPatternJson?.data?.suggested_side) {
          setSelectedSide(result.aiPatternJson.data.suggested_side);
        }
      } catch (err) {
        console.error("Onboarding submission error:", err);
      }
    };

    submit();
  }, []);

  const handleCreateProgram = async () => {
    if (!selectedSide || !onboardingData.area) return;

    try {
      setIsCreatingProgram(true);

      // Create the rehab program with the onboarding data
      // This updates the rehabProgramStore with the new active program
      await createProgram({
        area: onboardingData.area,
        areaOtherLabel: onboardingData.areaOtherLabel || undefined,
        side: selectedSide,
        // startDate defaults to today on the backend
      });

      // Navigate to profile (rehab home)
      router.replace("/profile");
    } catch (err) {
      console.error("Program creation error:", err);
      setIsCreatingProgram(false);
    }
  };

  const aiInsight = profile?.aiPatternJson?.data;
  const hasAIInsight = !!aiInsight;

  // Loading state
  if (isLoading) {
    return (
      <BaseLayout centered>
        <View className="items-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text variant="titleLarge" className="mt-4">
            Analyzing your information...
          </Text>
          <Text variant="bodyMedium" className="text-gray-600 mt-2 text-center">
            This may take a few seconds
          </Text>
        </View>
      </BaseLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <BaseLayout centered>
        <View className="px-6">
          <Text variant="headlineMedium" className="font-bold mb-4 text-center text-red-600">
            Something went wrong
          </Text>
          <Text variant="bodyLarge" className="text-gray-600 mb-6 text-center">
            {error}
          </Text>
          <Button mode="contained" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout scrollable>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text variant="headlineMedium" className="font-bold mb-2">
            Here's what we're seeing
          </Text>
          <Text variant="bodyLarge" className="text-gray-600">
            Based on your description, here's our assessment
          </Text>
        </View>

        {/* Disclaimer Banner */}
        <View className="bg-amber-50 p-4 rounded-lg mb-6 border border-amber-200">
          <Text variant="bodyMedium" className="text-amber-900 font-semibold mb-1">
            ⚠️ Important Reminder
          </Text>
          <Text variant="bodySmall" className="text-amber-800">
            This is educational guidance only, not a medical diagnosis. Always consult a healthcare
            provider for medical advice.
          </Text>
        </View>

        {/* AI Insight or Fallback */}
        {hasAIInsight ? (
          <>
            {/* Suspected Pattern */}
            <View className="bg-indigo-50 p-4 rounded-lg mb-4">
              <Text variant="titleMedium" className="font-semibold mb-2 text-indigo-900">
                Suspected Pattern
              </Text>
              <Text variant="bodyLarge" className="text-indigo-800">
                {aiInsight.suspected_pattern}
              </Text>
              <View className="mt-2">
                <Chip
                  mode="outlined"
                  textStyle={{
                    color:
                      aiInsight.confidence === "high"
                        ? "#10b981"
                        : aiInsight.confidence === "medium"
                          ? "#f59e0b"
                          : "#6b7280",
                  }}
                  style={{
                    borderColor:
                      aiInsight.confidence === "high"
                        ? "#10b981"
                        : aiInsight.confidence === "medium"
                          ? "#f59e0b"
                          : "#6b7280",
                    alignSelf: "flex-start",
                  }}
                >
                  {aiInsight.confidence} confidence
                </Chip>
              </View>
            </View>

            {/* Reasoning */}
            {aiInsight.reasoning && aiInsight.reasoning.length > 0 && (
              <View className="mb-4">
                <Text variant="titleSmall" className="font-semibold mb-2">
                  Why we think this:
                </Text>
                {aiInsight.reasoning.map((reason, index) => (
                  <View key={index} className="flex-row mb-1">
                    <Text variant="bodyMedium" className="text-gray-700">
                      • {reason}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <Divider className="my-4" />

            {/* Recommended Focus */}
            {aiInsight.recommended_focus && aiInsight.recommended_focus.length > 0 && (
              <View className="mb-4">
                <Text variant="titleSmall" className="font-semibold mb-2">
                  Recommended focus areas:
                </Text>
                {aiInsight.recommended_focus.map((focus, index) => (
                  <View key={index} className="flex-row mb-1">
                    <Text variant="bodyMedium" className="text-gray-700">
                      • {focus}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Reassurance */}
            {aiInsight.reassurance && (
              <View className="bg-green-50 p-4 rounded-lg mb-4">
                <Text variant="titleSmall" className="font-semibold mb-2 text-green-900">
                  💚 Good news
                </Text>
                <Text variant="bodyMedium" className="text-green-800">
                  {aiInsight.reassurance}
                </Text>
              </View>
            )}

            {/* Caution */}
            {aiInsight.caution && (
              <View className="bg-red-50 p-4 rounded-lg mb-4">
                <Text variant="titleSmall" className="font-semibold mb-2 text-red-900">
                  ⚠️ Caution
                </Text>
                <Text variant="bodyMedium" className="text-red-800">
                  {aiInsight.caution}
                </Text>
              </View>
            )}
          </>
        ) : (
          /* Fallback Message */
          <View className="bg-gray-50 p-4 rounded-lg mb-4">
            <Text variant="titleMedium" className="font-semibold mb-2">
              Ready to build your program
            </Text>
            <Text variant="bodyMedium" className="text-gray-700">
              We've collected your information and are ready to create a personalized rehab plan
              tailored to your needs.
            </Text>
          </View>
        )}

        <Divider className="my-4" />

        {/* Side Selection */}
        <View className="mb-6">
          <Text variant="titleMedium" className="font-semibold mb-2">
            Which side needs attention?
          </Text>
          <Text variant="bodySmall" className="text-gray-600 mb-3">
            Select the side that's bothering you
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {SIDE_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                selected={selectedSide === option.value}
                onPress={() => setSelectedSide(option.value)}
                mode="outlined"
                showSelectedCheck={false}
                style={{
                  backgroundColor: selectedSide === option.value ? "#6366f1" : "transparent",
                  minWidth: 100,
                }}
                textStyle={{
                  color: selectedSide === option.value ? "#fff" : "#000",
                }}
              >
                {option.icon} {option.label}
              </Chip>
            ))}
          </View>
        </View>

        {/* Create Program Button */}
        <Button
          mode="contained"
          onPress={handleCreateProgram}
          disabled={!selectedSide || isCreatingProgram}
          loading={isCreatingProgram}
          contentStyle={{ paddingVertical: 8 }}
        >
          {isCreatingProgram ? "Creating your program..." : "Create My Program"}
        </Button>

        {!selectedSide && (
          <Text variant="bodySmall" className="text-red-600 mt-2 text-center">
            Please select which side needs attention
          </Text>
        )}

        {/* Educational Footer */}
        <View className="mt-6 bg-blue-50 p-4 rounded-lg">
          <Text variant="bodySmall" className="text-blue-900">
            <Text className="font-semibold">What&apos;s next? </Text>
            We&apos;ll build a progressive exercise program designed to help you recover safely and
            effectively. You&apos;ll be able to track your progress and adjust exercises as you
            improve.
          </Text>
        </View>
      </ScrollView>
    </BaseLayout>
  );
}
