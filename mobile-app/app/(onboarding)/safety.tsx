import { useState } from "react";
import { View } from "react-native";
import { Text, Button, Card, Chip } from "react-native-paper";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "../../src/stores/onboardingStore";
import BaseLayout from "../../src/components/BaseLayout";
import type { RedFlag } from "../../src/types/onboarding";

const RED_FLAGS: { value: RedFlag; label: string; description: string }[] = [
  {
    value: "night_pain",
    label: "Night Pain",
    description: "Pain that wakes you at night",
  },
  {
    value: "numbness",
    label: "Numbness/Tingling",
    description: "Loss of sensation or pins & needles",
  },
  {
    value: "trauma",
    label: "Recent Trauma",
    description: "Recent fall, accident, or injury",
  },
  {
    value: "fever",
    label: "Fever/Swelling",
    description: "Unexplained fever or severe swelling",
  },
  {
    value: "locking",
    label: "Joint Locking",
    description: "Joint gets stuck or catches",
  },
];

export default function SafetyScreen() {
  const router = useRouter();
  const { setRedFlags } = useOnboardingStore();
  const [selectedFlags, setSelectedFlags] = useState<RedFlag[]>([]);

  const toggleFlag = (flag: RedFlag) => {
    setSelectedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag],
    );
  };

  const handleContinue = () => {
    setRedFlags(selectedFlags);
    router.push("/(onboarding)/recommendation");
  };

  const hasRedFlags = selectedFlags.length > 0;

  return (
    <BaseLayout>
      <View className="mb-6">
        <Text variant="headlineMedium" className="font-bold mb-2">
          Safety check
        </Text>
        <Text variant="bodyLarge" className="text-gray-600">
          Do any of these apply to you?
        </Text>
      </View>

      <View className="gap-3 mb-4">
        {RED_FLAGS.map((flag) => {
          const isSelected = selectedFlags.includes(flag.value);
          return (
            <Card
              key={flag.value}
              mode={isSelected ? "elevated" : "outlined"}
              onPress={() => toggleFlag(flag.value)}
              className={isSelected ? "bg-amber-50" : ""}
            >
              <Card.Content className="py-3">
                <Text variant="titleMedium" className="font-bold mb-1">
                  {flag.label}
                </Text>
                <Text variant="bodyMedium" className="text-gray-600">
                  {flag.description}
                </Text>
              </Card.Content>
            </Card>
          );
        })}
      </View>

      {hasRedFlags && (
        <View className="bg-amber-50 p-4 rounded-lg mb-4">
          <Text variant="titleMedium" className="font-bold mb-2 text-amber-900">
            Important
          </Text>
          <Text variant="bodyMedium" className="text-amber-900 mb-3">
            These symptoms can indicate issues that need professional assessment. We'll tailor your
            experience accordingly, but please consider consulting a healthcare provider.
          </Text>
          <Button
            mode="outlined"
            onPress={() => {
              // TODO: Link to clinician finder or external resource
              console.log("Find a clinician");
            }}
            textColor="#92400e"
            className="border-amber-700"
          >
            <Text>Find a clinician</Text>
          </Button>
        </View>
      )}

      <Button mode="contained" onPress={handleContinue}>
        {hasRedFlags ? "Continue with caution" : "Continue"}
      </Button>

      <Text variant="bodySmall" className="text-center text-gray-500 mt-4">
        Almost there — one more step
      </Text>
    </BaseLayout>
  );
}
