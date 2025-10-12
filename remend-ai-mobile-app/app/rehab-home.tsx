import { useEffect, useState } from "react";
import { View, RefreshControl, ScrollView } from "react-native";
import { Text, Button, Card, ActivityIndicator, Banner } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuthStore } from "../src/stores/authStore";
import { useRehabProgramStore } from "../src/stores/rehabProgramStore";
import { useRehabLogStore } from "../src/stores/rehabLogStore";
import BaseLayout from "../src/components/BaseLayout";
import Sparkline from "../src/components/Sparkline";

export default function RehabHomeScreen() {
  const { user } = useAuthStore();
  const { activeProgram, isLoading, loadActiveProgram } = useRehabProgramStore();
  const { logs, hasLoggedToday, loadLogs, isLoading: logsLoading } = useRehabLogStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActiveProgram();
  }, [loadActiveProgram]);

  useEffect(() => {
    if (activeProgram) {
      loadLogs(activeProgram.id);
    }
  }, [activeProgram, loadLogs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActiveProgram();
    if (activeProgram) {
      await loadLogs(activeProgram.id);
    }
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleSetupProgram = () => {
    router.push("/(onboarding)/rehab-setup");
  };

  const handleNavigateToProfile = () => {
    router.push("/profile");
  };

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
    router.replace("/(auth)/login");
  };

  const handleLogToday = () => {
    router.push("/(rehab)/log-form");
  };

  const formatSide = (side: string) => {
    if (side === "both") return "Both";
    if (side === "na") return "";
    return side.charAt(0).toUpperCase() + side.slice(1);
  };

  // Get pain scores for sparkline (last 14 days, most recent on right)
  const painScores = [...logs].reverse().map((log) => log.pain);

  return (
    <BaseLayout scrollable={false}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="mb-6 flex-row justify-between items-start">
          <View className="flex-1">
            <Text variant="headlineMedium" className="font-bold mb-2">
              Recovery Mode 🦵
            </Text>
            <Text variant="bodyLarge" className="text-gray-600">
              Welcome back, {user?.fullName || "there"}
            </Text>
          </View>
          <Button mode="text" onPress={handleNavigateToProfile} compact>
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
                onPress: handleSetupProgram,
              },
            ]}
          >
            <Text>Create your rehab program to start logging.</Text>
          </Banner>
        )}
        {activeProgram && !hasLoggedToday && (
          <Card className="mb-4" mode="elevated">
            <Card.Content>
              <Text variant="titleLarge" className="font-bold mb-2">
                Log today for your {formatSide(activeProgram.side)}{" "}
                {activeProgram.area.replace("_", " ")}
              </Text>
              <Text variant="bodyMedium" className="text-gray-600 mb-4">
                Track your progress to stay on top of your recovery
              </Text>
              <Button mode="contained" onPress={handleLogToday} icon="plus">
                <Text>Log Progress</Text>
              </Button>
            </Card.Content>
          </Card>
        )}
        {activeProgram && hasLoggedToday && (
          <Card className="mb-4" mode="outlined">
            <Card.Content>
              <Text variant="titleMedium" className="font-bold mb-2 text-green-600">
                ✓ Logged today
              </Text>
              <Text variant="bodyMedium" className="text-gray-600">
                Great job! Come back tomorrow to log again.
              </Text>
            </Card.Content>
          </Card>
        )}
        {activeProgram && logs.length > 0 && (
          <Card className="mb-4">
            <Card.Content>
              <Text variant="titleLarge" className="font-bold mb-4">
                Last 14 Days
              </Text>

              {/* Sparkline */}
              <View className="mb-4 items-center">
                <Text variant="labelMedium" className="text-gray-600 mb-2">
                  Pain Trend
                </Text>
                <Sparkline data={painScores} width={280} height={60} />
              </View>

              {/* Logs List */}
              <View className="gap-3">
                {logs.map((log) => (
                  <View key={log.id} className="border-l-4 border-indigo-500 pl-3 py-2">
                    <Text variant="labelLarge" className="font-bold mb-1">
                      {log.date}
                    </Text>
                    <View className="flex-row gap-4">
                      <Text variant="bodyMedium">Pain: {log.pain}</Text>
                      <Text variant="bodyMedium">Stiffness: {log.stiffness}</Text>
                      <Text variant="bodyMedium">Swelling: {log.swelling}</Text>
                    </View>
                    {log.activityLevel && (
                      <Text variant="bodySmall" className="text-gray-600 mt-1">
                        Activity: {log.activityLevel}
                      </Text>
                    )}
                    {log.notes && (
                      <Text variant="bodySmall" className="text-gray-600 mt-1" numberOfLines={2}>
                        {log.notes}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}
        {activeProgram && logs.length === 0 && !logsLoading && (
          <Card className="mb-4">
            <Card.Content>
              <Text variant="titleMedium" className="font-bold mb-2">
                Start Tracking
              </Text>
              <Text variant="bodyMedium" className="text-gray-600">
                Your first 14-day view will appear after a few entries.
              </Text>
            </Card.Content>
          </Card>
        )}
        <Button mode="outlined" onPress={handleLogout} className="mt-4 mb-4" textColor="#dc2626">
          <Text>Sign Out</Text>
        </Button>
      </ScrollView>
    </BaseLayout>
  );
}
