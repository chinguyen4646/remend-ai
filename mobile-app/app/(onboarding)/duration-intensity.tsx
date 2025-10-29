import { useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Button, Chip } from "react-native-paper";
import { useRouter } from "expo-router";
import Slider from "@react-native-community/slider";
import BaseLayout from "../../src/components/BaseLayout";
import { useOnboardingStore } from "../../src/stores/onboardingStore";
import type { Onset } from "../../src/types/onboarding";

const ONSET_OPTIONS: { value: Onset; label: string; description: string }[] = [
  {
    value: "recent",
    label: "Just recently",
    description: "≤4 weeks",
  },
  {
    value: "1-3months",
    label: "1–3 months",
    description: "A few months",
  },
  {
    value: "3plus",
    label: "3+ months",
    description: "Longer term",
  },
  {
    value: "incident",
    label: "After an incident",
    description: "Specific event",
  },
];

export default function DurationIntensityScreen() {
  const router = useRouter();
  const { setDurationIntensity } = useOnboardingStore();

  const [selectedOnset, setSelectedOnset] = useState<Onset | null>(null);
  const [painRest, setPainRest] = useState(0);
  const [painActivity, setPainActivity] = useState(0);
  const [stiffness, setStiffness] = useState(0);

  const handleNext = () => {
    if (!selectedOnset) return;

    // Save to store
    setDurationIntensity(selectedOnset, painRest, painActivity, stiffness);

    // Navigate to aggravators-easers screen
    router.push("/(onboarding)/aggravators-easers");
  };

  const isNextDisabled = !selectedOnset;

  return (
    <BaseLayout scrollable keyboardAvoiding>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-8">
          <Text variant="headlineMedium" className="font-bold mb-2">
            How long has this been going on?
          </Text>
          <Text variant="bodyLarge" className="text-gray-600">
            Understanding the timeline helps us tailor your recovery plan
          </Text>
        </View>

        {/* Onset Chips */}
        <View className="mb-8">
          <Text variant="titleMedium" className="font-semibold mb-3">
            When did it start?
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {ONSET_OPTIONS.map((option) => (
              <View key={option.value} className="w-[48%]">
                <Chip
                  selected={selectedOnset === option.value}
                  onPress={() => setSelectedOnset(option.value)}
                  mode="outlined"
                  showSelectedCheck={false}
                  style={{
                    backgroundColor: selectedOnset === option.value ? "#6366f1" : "transparent",
                    minHeight: 60,
                  }}
                  textStyle={{
                    color: selectedOnset === option.value ? "#fff" : "#000",
                  }}
                >
                  <View>
                    <Text
                      variant="bodyMedium"
                      className="font-semibold"
                      style={{ color: selectedOnset === option.value ? "#fff" : "#000" }}
                    >
                      {option.label}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={{ color: selectedOnset === option.value ? "#e0e7ff" : "#6b7280" }}
                    >
                      {option.description}
                    </Text>
                  </View>
                </Chip>
              </View>
            ))}
          </View>
        </View>

        {/* Pain at Rest Slider */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text variant="titleMedium" className="font-semibold">
              Pain at rest
            </Text>
            <View className="bg-indigo-100 px-3 py-1 rounded-full">
              <Text variant="bodyLarge" className="font-bold text-indigo-700">
                {painRest}
              </Text>
            </View>
          </View>
          <Text variant="bodySmall" className="text-gray-600 mb-3">
            When you're sitting or lying down
          </Text>
          <Slider
            value={painRest}
            onValueChange={setPainRest}
            minimumValue={0}
            maximumValue={10}
            step={1}
            minimumTrackTintColor="#6366f1"
            maximumTrackTintColor="#d1d5db"
            thumbTintColor="#6366f1"
          />
          <View className="flex-row justify-between">
            <Text variant="bodySmall" className="text-gray-500">
              0 - No pain
            </Text>
            <Text variant="bodySmall" className="text-gray-500">
              10 - Worst
            </Text>
          </View>
        </View>

        {/* Pain During Activity Slider */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text variant="titleMedium" className="font-semibold">
              Pain during activity
            </Text>
            <View className="bg-indigo-100 px-3 py-1 rounded-full">
              <Text variant="bodyLarge" className="font-bold text-indigo-700">
                {painActivity}
              </Text>
            </View>
          </View>
          <Text variant="bodySmall" className="text-gray-600 mb-3">
            When you're moving or exercising
          </Text>
          <Slider
            value={painActivity}
            onValueChange={setPainActivity}
            minimumValue={0}
            maximumValue={10}
            step={1}
            minimumTrackTintColor="#6366f1"
            maximumTrackTintColor="#d1d5db"
            thumbTintColor="#6366f1"
          />
          <View className="flex-row justify-between">
            <Text variant="bodySmall" className="text-gray-500">
              0 - No pain
            </Text>
            <Text variant="bodySmall" className="text-gray-500">
              10 - Worst
            </Text>
          </View>
        </View>

        {/* Stiffness Slider */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-2">
            <Text variant="titleMedium" className="font-semibold">
              Stiffness level
            </Text>
            <View className="bg-indigo-100 px-3 py-1 rounded-full">
              <Text variant="bodyLarge" className="font-bold text-indigo-700">
                {stiffness}
              </Text>
            </View>
          </View>
          <Text variant="bodySmall" className="text-gray-600 mb-3">
            How much does the area feel tight or restricted?
          </Text>
          <Slider
            value={stiffness}
            onValueChange={setStiffness}
            minimumValue={0}
            maximumValue={10}
            step={1}
            minimumTrackTintColor="#6366f1"
            maximumTrackTintColor="#d1d5db"
            thumbTintColor="#6366f1"
          />
          <View className="flex-row justify-between">
            <Text variant="bodySmall" className="text-gray-500">
              0 - No stiffness
            </Text>
            <Text variant="bodySmall" className="text-gray-500">
              10 - Very stiff
            </Text>
          </View>
        </View>

        {/* Next Button */}
        <Button
          mode="contained"
          onPress={handleNext}
          disabled={isNextDisabled}
          contentStyle={{ paddingVertical: 8 }}
        >
          <Text>Next</Text>
        </Button>

        {isNextDisabled && (
          <Text variant="bodySmall" className="text-red-600 mt-2 text-center">
            Please select when it started
          </Text>
        )}
      </ScrollView>
    </BaseLayout>
  );
}
