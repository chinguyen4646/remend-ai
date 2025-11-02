import { useEffect, useState, useCallback } from "react";
import { View, RefreshControl, ScrollView } from "react-native";
import { Text, Button, Card, ActivityIndicator, Chip } from "react-native-paper";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useRehabLogStore } from "../src/stores/rehabLogStore";
import { rehabApi } from "../src/api/rehab";
import type { RehabProgram } from "../src/types/rehab";
import BaseLayout from "../src/components/BaseLayout";
import Sparkline from "../src/components/Sparkline";
import { formatCalendarDate } from "../src/utils/dates";

export default function RehabHomeScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const { logs, hasLoggedToday, loadLogs, isLoading: logsLoading } = useRehabLogStore();
  const router = useRouter();
  const [program, setProgram] = useState<RehabProgram | null>(null);
  const [latestPlan, setLatestPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProgram = async () => {
    if (!programId) {
      setError("No program ID provided");
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await rehabApi.getProgram(Number(programId), { include: "latestPlan" });
      setProgram(response.program);
      setLatestPlan(response.latestPlan || null);
      // Load logs for this program
      await loadLogs(Number(programId));
    } catch (err: unknown) {
      setError(err.response?.data?.errors?.[0]?.message || "Failed to load program");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProgram();
  }, [programId]);

  // Reload logs when screen comes into focus (e.g., after creating a log)
  useFocusEffect(
    useCallback(() => {
      if (program) {
        loadLogs(program.id);
      }
    }, [program, loadLogs]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProgram();
  };

  const handleLogToday = () => {
    router.push("/(rehab)/log-form");
  };

  const getStatusColor = (status: string) => {
    if (status === "active") return "#10b981"; // green
    if (status === "paused") return "#f59e0b"; // yellow
    return "#6b7280"; // gray
  };

  const formatArea = (program: RehabProgram) => {
    const side =
      program.side === "both"
        ? "Both"
        : program.side === "na"
          ? ""
          : program.side.charAt(0).toUpperCase() + program.side.slice(1);
    const area =
      program.area === "other" ? program.areaOtherLabel || "Other" : program.area.replace("_", " ");
    return `${side} ${area}`.trim();
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !program) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Text variant="bodyLarge" className="text-red-600 mb-4">
          {error || "Program not found"}
        </Text>
        <Button mode="contained" onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

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
            <View className="flex-row items-center gap-2 mb-2">
              <Text variant="headlineMedium" className="font-bold">
                {formatArea(program)}
              </Text>
              <Chip
                style={{ backgroundColor: getStatusColor(program.status) }}
                textStyle={{ color: "white" }}
                compact
              >
                {program.status}
              </Chip>
            </View>
          </View>
        </View>

        {/* Today's Plan Card */}
        {latestPlan && (
          <Card className="mb-4" mode="elevated">
            <Card.Content>
              <View className="flex-row justify-between items-start mb-3">
                <Text variant="titleLarge" className="font-bold">
                  {latestPlan.isInitial ? "Your Starting Plan" : "Today's Plan"}
                </Text>
                {latestPlan.isInitial && (
                  <Chip
                    mode="flat"
                    textStyle={{ color: "#10b981", fontSize: 12 }}
                    style={{ backgroundColor: "#d1fae5" }}
                    compact
                  >
                    🟢 New
                  </Chip>
                )}
              </View>

              {/* Exercise List */}
              <View className="mb-4">
                {latestPlan.shortlistJson?.exercises
                  ?.slice(0, 4)
                  .map((exercise: any, idx: number) => (
                    <View key={idx} className="mb-2">
                      <Text variant="bodyMedium" className="font-semibold">
                        {idx + 1}. {exercise.name}
                      </Text>
                      <Text variant="bodySmall" className="text-indigo-600">
                        {exercise.dosage_text}
                      </Text>
                    </View>
                  ))}
              </View>

              <Button
                mode="outlined"
                onPress={() =>
                  router.push(
                    `/(rehab)/plan-created?planId=${latestPlan.id}&programId=${program.id}`,
                  )
                }
                compact
              >
                <Text>View Todays Plan →</Text>
              </Button>
            </Card.Content>
          </Card>
        )}

        {program.status === "active" && !hasLoggedToday && (
          <Card className="mb-4" mode="elevated">
            <Card.Content>
              <Text variant="titleLarge" className="font-bold mb-2">
                Log today's progress
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
        {program.status === "active" && hasLoggedToday && (
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
        {program && logs.length > 0 && (
          <>
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
                      <View className="flex-row justify-between items-start mb-1">
                        <Text variant="labelLarge" className="font-bold">
                          {formatCalendarDate(log.date)}
                        </Text>
                        {log.plan && (
                          <Button
                            mode="contained"
                            onPress={() =>
                              router.push(
                                `/(rehab)/plan-created?planId=${log.plan?.id}&programId=${program.id}`,
                              )
                            }
                            compact
                            labelStyle={{ fontSize: 12 }}
                          >
                            <Text>View Plan →</Text>
                          </Button>
                        )}
                      </View>
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
          </>
        )}
        {program && logs.length === 0 && !logsLoading && (
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
      </ScrollView>
    </BaseLayout>
  );
}
