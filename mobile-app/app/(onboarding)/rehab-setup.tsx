import { useState } from "react";
import { View } from "react-native";
import { Text, Button, TextInput, Snackbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { useRehabProgramStore } from "../../src/stores/rehabProgramStore";
import { useOnboardingStore } from "../../src/stores/onboardingStore";
import BaseLayout from "../../src/components/BaseLayout";
import { todayLocal } from "../../src/utils/dates";
import type { Area } from "../../src/types/onboarding";

/**
 * Maps onboarding area to rehab program area
 * Onboarding uses simplified areas, programs use specific areas
 */
function mapOnboardingAreaToProgram(onboardingArea: Area): string {
  const mapping: Record<Area, string> = {
    knee: "knee",
    shoulder: "shoulder",
    back: "lower_back", // Default to lower back (most common)
    hip: "hip",
    ankle: "ankle",
    wrist: "wrist",
    elbow: "elbow",
    other: "other",
  };
  return mapping[onboardingArea];
}

export default function RehabSetupScreen() {
  const { createProgram, isLoading, error, clearError } = useRehabProgramStore();
  const { data, reset } = useOnboardingStore();
  const [side, setSide] = useState<"left" | "right" | "both" | "na" | null>(null);
  const [startDate] = useState(todayLocal());
  const router = useRouter();

  // Get area and areaOtherLabel from onboarding data
  const programArea = data.area ? mapOnboardingAreaToProgram(data.area) : "";
  const areaOtherLabel = data.areaOtherLabel ? data.areaOtherLabel : null;

  const handleCreate = async () => {
    if (!programArea) {
      console.error("Missing area from onboarding data:", { data });
      // Navigate back to onboarding if data is missing
      router.replace("/(onboarding)/baseline");
      return;
    }

    if (!side) {
      return;
    }

    try {
      await createProgram({
        area: programArea,
        areaOtherLabel,
        side,
        startDate,
      });
      // Clear onboarding data after successful program creation
      reset();
      router.replace("/home");
    } catch (error) {
      // Error handled by store, but log for debugging
      console.error("Failed to create program:", error);
    }
  };

  const handleSkip = () => {
    router.replace("/home");
  };

  return (
    <BaseLayout keyboardAvoiding className="bg-white">
      <View className="mb-6 mt-4">
        <Text variant="headlineMedium" className="font-bold mb-2">
          Just one more thing
        </Text>
        <Text variant="bodyLarge" className="text-gray-600">
          Your {data.area || "injury"} - which side?
        </Text>
      </View>

      <View className="gap-4">
        {/* Side Selection */}
        <View>
          <Text variant="labelLarge" className="mb-2">
            Which side?
          </Text>
          <View className="flex-row gap-2">
            <Button
              mode={side === "left" ? "contained" : "outlined"}
              onPress={() => setSide("left")}
              disabled={isLoading}
              className="flex-1"
            >
              <Text>Left</Text>
            </Button>
            <Button
              mode={side === "right" ? "contained" : "outlined"}
              onPress={() => setSide("right")}
              disabled={isLoading}
              className="flex-1"
            >
              <Text>Right</Text>
            </Button>
            <Button
              mode={side === "both" ? "contained" : "outlined"}
              onPress={() => setSide("both")}
              disabled={isLoading}
              className="flex-1"
            >
              <Text>Both</Text>
            </Button>
          </View>
          <Button
            mode={side === "na" ? "contained" : "outlined"}
            onPress={() => setSide("na")}
            disabled={isLoading}
            className="mt-2"
          >
            <Text>Not applicable</Text>
          </Button>
        </View>

        {/* Start Date (shown but not editable for now) */}
        <View>
          <Text variant="labelLarge" className="mb-2">
            Start date
          </Text>
          <TextInput value={startDate} mode="outlined" disabled placeholder="YYYY-MM-DD" />
          <Text variant="bodySmall" className="text-gray-600 mt-1">
            Defaulting to today
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="gap-3 mt-8">
        <Button
          mode="contained"
          onPress={handleCreate}
          loading={isLoading}
          disabled={isLoading || !side}
        >
          <Text>Start Rehab</Text>
        </Button>

        <Button mode="text" onPress={handleSkip} disabled={isLoading}>
          <Text>Skip for now</Text>
        </Button>
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={clearError}
        duration={4000}
        action={{
          label: "Dismiss",
          onPress: clearError,
        }}
      >
        {error}
      </Snackbar>
    </BaseLayout>
  );
}
