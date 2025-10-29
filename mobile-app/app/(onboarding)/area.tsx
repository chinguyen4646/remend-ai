import { useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Button, Chip, TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import BaseLayout from "../../src/components/BaseLayout";
import { useOnboardingStore } from "../../src/stores/onboardingStore";
import type { Area } from "../../src/types/onboarding";

const AREAS: { value: Area; label: string }[] = [
  { value: "knee", label: "Knee" },
  { value: "shoulder", label: "Shoulder" },
  { value: "lower_back", label: "Lower Back" },
  { value: "upper_back", label: "Upper Back" },
  { value: "ankle", label: "Ankle" },
  { value: "hip", label: "Hip" },
  { value: "wrist", label: "Wrist" },
  { value: "elbow", label: "Elbow" },
  { value: "other", label: "Other" },
];

export default function AreaScreen() {
  const router = useRouter();
  const { setArea } = useOnboardingStore();

  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [otherLabel, setOtherLabel] = useState("");

  const handleNext = () => {
    if (!selectedArea) return;

    // Save to store
    setArea(selectedArea, selectedArea === "other" ? otherLabel : undefined);

    // Navigate to describe screen
    router.push("/(onboarding)/describe");
  };

  const isNextDisabled =
    !selectedArea || (selectedArea === "other" && otherLabel.trim().length === 0);

  return (
    <BaseLayout scrollable keyboardAvoiding>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-8">
          <Text variant="headlineMedium" className="font-bold mb-2">
            Where's it bothering you most?
          </Text>
          <Text variant="bodyLarge" className="text-gray-600">
            Select the area that needs attention
          </Text>
        </View>

        {/* Area Chips */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {AREAS.map((area) => (
            <Chip
              key={area.value}
              selected={selectedArea === area.value}
              onPress={() => setSelectedArea(area.value)}
              mode="outlined"
              showSelectedCheck={false}
              style={{
                backgroundColor: selectedArea === area.value ? "#6366f1" : "transparent",
              }}
              textStyle={{
                color: selectedArea === area.value ? "#fff" : "#000",
              }}
            >
              {area.label}
            </Chip>
          ))}
        </View>

        {/* Other Label Input */}
        {selectedArea === "other" && (
          <View className="mb-6">
            <TextInput
              label="Specify area"
              value={otherLabel}
              onChangeText={setOtherLabel}
              mode="outlined"
              placeholder="e.g., ankle, foot, neck..."
              maxLength={50}
            />
          </View>
        )}

        {/* Next Button */}
        <Button
          mode="contained"
          onPress={handleNext}
          disabled={isNextDisabled}
          contentStyle={{ paddingVertical: 8 }}
        >
          <Text>Next</Text>
        </Button>
      </ScrollView>
    </BaseLayout>
  );
}
