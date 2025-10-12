import { useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Card } from "react-native-paper";
import { useAuthStore } from "../stores/authStore";

interface Props {
  onComplete: () => void;
}

export default function ModePickerScreen({ onComplete }: Props) {
  const { updateMode, isLoading, error, clearError } = useAuthStore();
  const [selectedMode, setSelectedMode] = useState<"rehab" | "maintenance" | "general" | null>(
    null,
  );

  const handleModeSelect = async (mode: "rehab" | "maintenance" | "general") => {
    try {
      clearError();
      setSelectedMode(mode);
      await updateMode(mode);
      onComplete();
    } catch (err) {
      setSelectedMode(null);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <View className="mb-8 mt-4">
          <Text variant="headlineLarge" className="font-bold mb-2">
            What brings you here?
          </Text>
          <Text variant="bodyLarge" className="text-gray-600">
            Choose the mode that fits your current goal
          </Text>
        </View>

        <View className="gap-4">
          <Card
            mode="outlined"
            className="border-2"
            onPress={() => !isLoading && handleModeSelect("rehab")}
          >
            <Card.Content className="py-4">
              <Text variant="headlineSmall" className="mb-2">
                🦵 Rehab an injury
              </Text>
              <Text variant="bodyMedium" className="text-gray-600">
                Structured recovery tracking with daily logs and progress monitoring
              </Text>
            </Card.Content>
          </Card>

          <Card
            mode="outlined"
            className="border-2"
            onPress={() => !isLoading && handleModeSelect("maintenance")}
          >
            <Card.Content className="py-4">
              <Text variant="headlineSmall" className="mb-2">
                💪 Stay strong
              </Text>
              <Text variant="bodyMedium" className="text-gray-600">
                Post-recovery wellness tracking to maintain your progress
              </Text>
            </Card.Content>
          </Card>

          <Card
            mode="outlined"
            className="border-2"
            onPress={() => !isLoading && handleModeSelect("general")}
          >
            <Card.Content className="py-4">
              <Text variant="headlineSmall" className="mb-2">
                😊 Just check in
              </Text>
              <Text variant="bodyMedium" className="text-gray-600">
                General fitness and wellness tracking
              </Text>
            </Card.Content>
          </Card>
        </View>

        {isLoading && selectedMode && (
          <View className="mt-6">
            <Text variant="bodyMedium" className="text-center text-gray-600">
              Setting up {selectedMode} mode...
            </Text>
          </View>
        )}

        {error && (
          <View className="mt-6 p-4 bg-red-50 rounded-lg">
            <Text variant="bodyMedium" className="text-red-800">
              {error}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
