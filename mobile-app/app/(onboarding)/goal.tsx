import { useState } from "react";
import { View } from "react-native";
import { Text, Button, Card, Chip } from "react-native-paper";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "../../src/stores/onboardingStore";
import BaseLayout from "../../src/components/BaseLayout";
import type { Goal } from "../../src/types/onboarding";

const GOALS: { value: Goal; icon: string; label: string; description: string }[] = [
  {
    value: "return_to_sport",
    icon: "🏃",
    label: "Return to Sport",
    description: "Get back to your athletic activities",
  },
  {
    value: "walk_pain_free",
    icon: "🚶",
    label: "Walk Pain-Free",
    description: "Move comfortably in daily life",
  },
  {
    value: "reduce_stiffness",
    icon: "🧘",
    label: "Reduce Stiffness",
    description: "Improve flexibility and range of motion",
  },
  {
    value: "maintain_mobility",
    icon: "💪",
    label: "Maintain Mobility",
    description: "Keep moving well long-term",
  },
];

export default function GoalScreen() {
  const router = useRouter();
  const { setGoal } = useOnboardingStore();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const handleContinue = () => {
    if (!selectedGoal) return;

    setGoal(selectedGoal);
    router.push("/(onboarding)/safety");
  };

  return (
    <BaseLayout>
      <View className="mb-6">
        <Text variant="headlineMedium" className="font-bold mb-2">
          What success looks like
        </Text>
        <Text variant="bodyLarge" className="text-gray-600">
          Choose your primary goal
        </Text>
      </View>

      <View className="gap-3 mb-6">
        {GOALS.map((goal) => (
          <Card
            key={goal.value}
            mode={selectedGoal === goal.value ? "elevated" : "outlined"}
            onPress={() => setSelectedGoal(goal.value)}
            className={selectedGoal === goal.value ? "bg-indigo-50" : ""}
          >
            <Card.Content className="py-4">
              <Text variant="titleLarge" className="mb-2">
                {goal.icon} {goal.label}
              </Text>
              <Text variant="bodyMedium" className="text-gray-600">
                {goal.description}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Button mode="contained" onPress={handleContinue} disabled={!selectedGoal}>
        <Text>Continue</Text>
      </Button>

      <Text variant="bodySmall" className="text-center text-gray-500 mt-4">
        <Text>You're making great progress</Text>
      </Text>
    </BaseLayout>
  );
}
