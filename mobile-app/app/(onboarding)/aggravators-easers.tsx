import { useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Button, Chip, TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import BaseLayout from "../../src/components/BaseLayout";
import { useOnboardingStore } from "../../src/stores/onboardingStore";

const COLORS = {
  aggravatorSelected: "#6366f1",
  easerSelected: "#10b981",
  transparent: "transparent",
  white: "#fff",
  black: "#000",
};

const COMMON_AGGRAVATORS = [
  "Walking",
  "Running",
  "Sitting",
  "Standing",
  "Stairs",
  "Bending",
  "Lifting",
  "Twisting",
  "First thing in morning",
];

const COMMON_EASERS = [
  "Rest",
  "Ice",
  "Heat",
  "Movement",
  "Stretching",
  "Massage",
  "Support/brace",
  "Medication",
];

export default function AggravatorsEasersScreen() {
  const router = useRouter();
  const { setAggravatorsEasers } = useOnboardingStore();

  const [selectedAggravators, setSelectedAggravators] = useState<string[]>([]);
  const [selectedEasers, setSelectedEasers] = useState<string[]>([]);
  const [customAggravator, setCustomAggravator] = useState("");
  const [customEaser, setCustomEaser] = useState("");

  const toggleAggravator = (item: string) => {
    setSelectedAggravators((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const toggleEaser = (item: string) => {
    setSelectedEasers((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const addCustomAggravator = () => {
    const trimmed = customAggravator.trim();
    if (trimmed && !selectedAggravators.includes(trimmed)) {
      setSelectedAggravators((prev) => [...prev, trimmed]);
      setCustomAggravator("");
    }
  };

  const addCustomEaser = () => {
    const trimmed = customEaser.trim();
    if (trimmed && !selectedEasers.includes(trimmed)) {
      setSelectedEasers((prev) => [...prev, trimmed]);
      setCustomEaser("");
    }
  };

  const removeCustomAggravator = (item: string) => {
    if (!COMMON_AGGRAVATORS.includes(item)) {
      setSelectedAggravators((prev) => prev.filter((i) => i !== item));
    }
  };

  const removeCustomEaser = (item: string) => {
    if (!COMMON_EASERS.includes(item)) {
      setSelectedEasers((prev) => prev.filter((i) => i !== item));
    }
  };

  const handleNext = () => {
    // Save to store
    setAggravatorsEasers(selectedAggravators, selectedEasers);

    // Navigate to ai-insight screen
    router.push("/(onboarding)/ai-insight");
  };

  return (
    <BaseLayout scrollable keyboardAvoiding>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-8">
          <Text variant="headlineMedium" className="font-bold mb-2">
            What helps or hurts?
          </Text>
          <Text variant="bodyLarge" className="text-gray-600">
            Understanding triggers helps us personalize your exercises
          </Text>
        </View>

        {/* Aggravators Section */}
        <View className="mb-8">
          <Text variant="titleMedium" className="font-semibold mb-3">
            What makes it worse?
          </Text>
          <Text variant="bodySmall" className="text-gray-600 mb-3">
            Select all that apply
          </Text>

          {/* Common Aggravators */}
          <View className="flex-row flex-wrap gap-2 mb-3">
            {COMMON_AGGRAVATORS.map((item) => (
              <Chip
                key={item}
                selected={selectedAggravators.includes(item)}
                onPress={() => toggleAggravator(item)}
                mode="outlined"
                showSelectedCheck={false}
                style={{
                  backgroundColor: selectedAggravators.includes(item)
                    ? COLORS.aggravatorSelected
                    : COLORS.transparent,
                }}
                textStyle={{
                  color: selectedAggravators.includes(item) ? COLORS.white : COLORS.black,
                }}
              >
                {item}
              </Chip>
            ))}
          </View>

          {/* Custom Aggravators */}
          {selectedAggravators.filter((item) => !COMMON_AGGRAVATORS.includes(item)).length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-3">
              {selectedAggravators
                .filter((item) => !COMMON_AGGRAVATORS.includes(item))
                .map((item) => (
                  <Chip
                    key={item}
                    selected
                    onClose={() => removeCustomAggravator(item)}
                    mode="outlined"
                    style={{ backgroundColor: COLORS.aggravatorSelected }}
                    textStyle={{ color: COLORS.white }}
                  >
                    {item}
                  </Chip>
                ))}
            </View>
          )}

          {/* Add Custom Aggravator */}
          <View className="flex-row gap-2">
            <TextInput
              value={customAggravator}
              onChangeText={setCustomAggravator}
              mode="outlined"
              placeholder="Add your own..."
              maxLength={100}
              onSubmitEditing={addCustomAggravator}
              style={{ flex: 1 }}
              dense
            />
            <Button
              mode="contained"
              onPress={addCustomAggravator}
              disabled={!customAggravator.trim()}
              contentStyle={{ height: 40 }}
            >
              <Text>Add</Text>
            </Button>
          </View>
        </View>

        {/* Easers Section */}
        <View className="mb-8">
          <Text variant="titleMedium" className="font-semibold mb-3">
            What helps?
          </Text>
          <Text variant="bodySmall" className="text-gray-600 mb-3">
            Select all that apply
          </Text>

          {/* Common Easers */}
          <View className="flex-row flex-wrap gap-2 mb-3">
            {COMMON_EASERS.map((item) => (
              <Chip
                key={item}
                selected={selectedEasers.includes(item)}
                onPress={() => toggleEaser(item)}
                mode="outlined"
                showSelectedCheck={false}
                style={{
                  backgroundColor: selectedEasers.includes(item)
                    ? COLORS.easerSelected
                    : COLORS.transparent,
                }}
                textStyle={{
                  color: selectedEasers.includes(item) ? COLORS.white : COLORS.black,
                }}
              >
                {item}
              </Chip>
            ))}
          </View>

          {/* Custom Easers */}
          {selectedEasers.filter((item) => !COMMON_EASERS.includes(item)).length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-3">
              {selectedEasers
                .filter((item) => !COMMON_EASERS.includes(item))
                .map((item) => (
                  <Chip
                    key={item}
                    selected
                    onClose={() => removeCustomEaser(item)}
                    mode="outlined"
                    style={{ backgroundColor: COLORS.easerSelected }}
                    textStyle={{ color: COLORS.white }}
                  >
                    {item}
                  </Chip>
                ))}
            </View>
          )}

          {/* Add Custom Easer */}
          <View className="flex-row gap-2">
            <TextInput
              value={customEaser}
              onChangeText={setCustomEaser}
              mode="outlined"
              placeholder="Add your own..."
              maxLength={100}
              onSubmitEditing={addCustomEaser}
              style={{ flex: 1 }}
              dense
            />
            <Button
              mode="contained"
              onPress={addCustomEaser}
              disabled={!customEaser.trim()}
              contentStyle={{ height: 40 }}
            >
              <Text>Add</Text>
            </Button>
          </View>
        </View>

        {/* Next Button */}
        <Button mode="contained" onPress={handleNext} contentStyle={{ paddingVertical: 8 }}>
          <Text>Next</Text>
        </Button>

        {/* Help Text */}
        <Text variant="bodySmall" className="text-gray-500 mt-3 text-center">
          It&apos;s okay to skip if you&apos;re unsure — we can always adjust later
        </Text>
      </ScrollView>
    </BaseLayout>
  );
}
