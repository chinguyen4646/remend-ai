import { useState } from "react";
import { View, ScrollView } from "react-native";
import { Modal, Portal, Text, Card, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { features } from "../config/features";
import { useAuthStore } from "../stores/authStore";

interface ModeSwitchModalProps {
  visible: boolean;
  onDismiss: () => void;
  currentMode: "rehab" | "maintenance" | "general" | null;
}

const MODES = [
  {
    value: "rehab" as const,
    icon: "🦵",
    title: "Rehab Mode",
    description: "Structured recovery tracking with daily logs and progress monitoring",
  },
  {
    value: "maintenance" as const,
    icon: "💪",
    title: "Maintenance Mode",
    description: "Post-recovery wellness tracking to maintain your progress",
  },
  {
    value: "general" as const,
    icon: "😊",
    title: "General Mode",
    description: "General fitness and wellness tracking",
  },
];

export default function ModeSwitchModal({ visible, onDismiss, currentMode }: ModeSwitchModalProps) {
  const { updateMode, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const router = useRouter();

  const handleModeSelect = async (mode: "rehab" | "maintenance" | "general") => {
    if (mode === currentMode) {
      return; // Already in this mode
    }

    try {
      setError(null);
      setSelectedMode(mode);
      await updateMode(mode);

      // Close modal
      onDismiss();

      // Navigate to appropriate screen
      if (mode === "rehab") {
        router.push("/(onboarding)/rehab-setup");
      } else if (mode === "maintenance") {
        router.replace("/maintenance-home");
      } else {
        router.replace("/general-home");
      }
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.message || "Failed to switch mode");
      setSelectedMode(null);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor: "white",
          margin: 20,
          borderRadius: 12,
          maxHeight: "80%",
        }}
      >
        <ScrollView>
          <View className="p-6">
            {/* Header */}
            <View className="mb-6">
              <Text variant="headlineMedium" className="font-bold mb-2">
                Switch Recovery Mode
              </Text>
              <Text variant="bodyMedium" className="text-gray-600">
                Choose what fits your current goal
              </Text>
            </View>

            {/* Mode Cards */}
            <View className="gap-3 mb-4">
              {MODES.filter(
                (mode) =>
                  (features.maintenanceModeEnabled || mode.value !== "maintenance") &&
                  (features.generalModeEnabled || mode.value !== "general"),
              ).map((mode) => {
                const isCurrent = mode.value === currentMode;
                const isSelected = mode.value === selectedMode;

                return (
                  <Card
                    key={mode.value}
                    mode={isCurrent ? "elevated" : "outlined"}
                    className={isCurrent ? "bg-indigo-50" : ""}
                    onPress={() => !isLoading && handleModeSelect(mode.value)}
                  >
                    <Card.Content className="py-4">
                      <Text variant="titleLarge" className="mb-2">
                        {mode.icon} {mode.title}
                        {isCurrent && " (Current)"}
                      </Text>
                      <Text variant="bodyMedium" className="text-gray-600 mb-3">
                        {mode.description}
                      </Text>

                      {isCurrent ? (
                        <Button mode="outlined" disabled>
                          <Text>Current Mode</Text>
                        </Button>
                      ) : (
                        <Button
                          mode="contained"
                          onPress={() => handleModeSelect(mode.value)}
                          loading={isLoading && isSelected}
                          disabled={isLoading}
                        >
                          <Text>Switch to {mode.title.replace(" Mode", "")}</Text>
                        </Button>
                      )}
                    </Card.Content>
                  </Card>
                );
              })}
            </View>

            {/* Warning Banner */}
            {currentMode === "rehab" && (
              <View className="bg-amber-50 p-3 rounded-lg mb-4">
                <Text variant="bodySmall" className="text-amber-900">
                  ⚠️ Your rehab logs will be preserved, but your active program will be archived.
                </Text>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View className="bg-red-50 p-3 rounded-lg mb-4">
                <Text variant="bodySmall" className="text-red-900">
                  {error}
                </Text>
              </View>
            )}

            {/* Cancel Button */}
            <Button mode="text" onPress={onDismiss} disabled={isLoading}>
              <Text>Cancel</Text>
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
}
