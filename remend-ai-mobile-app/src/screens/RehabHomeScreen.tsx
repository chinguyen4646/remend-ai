import { useEffect } from "react";
import { View } from "react-native";
import { Text, Button, Card, ActivityIndicator, Banner } from "react-native-paper";
import { useAuthStore } from "../stores/authStore";
import { useRehabProgramStore } from "../stores/rehabProgramStore";
import BaseLayout from "../components/BaseLayout";

interface Props {
  onSetupProgram: () => void;
  onNavigateToProfile: () => void;
  onLogout: () => void;
}

export default function RehabHomeScreen({ onSetupProgram, onNavigateToProfile, onLogout }: Props) {
  const { user } = useAuthStore();
  const { activeProgram, isLoading, loadActiveProgram } = useRehabProgramStore();

  useEffect(() => {
    loadActiveProgram();
  }, [loadActiveProgram]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <BaseLayout>
      <View className="mb-6 flex-row justify-between items-start">
        <View className="flex-1">
          <Text variant="headlineMedium" className="font-bold mb-2">
            Recovery Mode 🦵
          </Text>
          <Text variant="bodyLarge" className="text-gray-600">
            Welcome back, {user?.fullName || "there"}
          </Text>
        </View>
        <Button mode="text" onPress={onNavigateToProfile} compact>
          <Text>Me</Text>
        </Button>
      </View>

      {!activeProgram && (
        <Banner
          visible
          icon="alert-circle"
          actions={[
            {
              label: "Create Program",
              onPress: onSetupProgram,
            },
          ]}
        >
          <Text>Create your rehab program to start logging.</Text>
        </Banner>
      )}

      {activeProgram && (
        <Card className="mb-4">
          <Card.Content>
            <Text variant="titleLarge" className="font-bold mb-4">
              Active Program
            </Text>
            <View className="gap-2">
              <Text variant="bodyLarge">Area: {activeProgram.area.replace("_", " ")}</Text>
              <Text variant="bodyLarge">
                Side:{" "}
                {activeProgram.side === "both"
                  ? "Both"
                  : activeProgram.side === "na"
                    ? "Not applicable"
                    : activeProgram.side.charAt(0).toUpperCase() + activeProgram.side.slice(1)}
              </Text>
              <Text variant="bodyLarge">Started: {activeProgram.startDate}</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card className="mb-4">
        <Card.Content>
          <Text variant="titleMedium" className="font-bold mb-2">
            Coming Soon
          </Text>
          <Text variant="bodyMedium" className="text-gray-600">
            • Daily logging
            {"\n"}• Progress tracking
            {"\n"}• AI insights
          </Text>
        </Card.Content>
      </Card>

      <Button mode="outlined" onPress={onLogout} className="mt-4" textColor="#dc2626">
        <Text>Sign Out</Text>
      </Button>
    </BaseLayout>
  );
}
