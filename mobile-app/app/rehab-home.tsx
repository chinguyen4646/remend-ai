import { useEffect, useState, useCallback } from "react";
import { View, RefreshControl, ScrollView } from "react-native";
import { Text, Button, Card, ActivityIndicator, Chip } from "react-native-paper";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useRehabLogStore } from "../src/stores/rehabLogStore";
import { rehabApi } from "../src/api/rehab";
import type { RehabProgram } from "../src/types/rehab";
import BaseLayout from "../src/components/BaseLayout";
import Sparkline from "../src/components/Sparkline";
import WeeklyTrendChart from "../src/components/WeeklyTrendChart";
import { formatCalendarDate } from "../src/utils/dates";

export default function RehabHomeScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const { logs, hasLoggedToday, loadLogs, isLoading: logsLoading } = useRehabLogStore();
  const router = useRouter();
  const [program, setProgram] = useState<RehabProgram | null>(null);
  const [latestPlan, setLatestPlan] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
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

  const fetchSummary = async () => {
    if (!programId) return;

    try {
      const summaryData = await rehabApi.getProgramSummary(Number(programId));
      setSummary(summaryData);
    } catch (err: unknown) {
      console.error("Failed to load summary:", err);
      // Don't set error - summary is optional
    }
  };

  useEffect(() => {
    fetchProgram();
    fetchSummary();
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
    await Promise.all([fetchProgram(), fetchSummary()]);
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

        {/* Adaptive Plan Progress Banner */}
        {latestPlan && latestPlan.trend && latestPlan.aiFeedbackJson && (
          <Card
            className="mb-4"
            mode="elevated"
            style={{
              backgroundColor:
                latestPlan.trend === "improving"
                  ? "#d1fae5"
                  : latestPlan.trend === "worse"
                    ? "#fee2e2"
                    : "#e0e7ff",
            }}
          >
            <Card.Content>
              <View className="flex-row items-center gap-2 mb-2">
                <Text variant="titleMedium" className="font-bold">
                  {latestPlan.trend === "improving"
                    ? "🎉 Great Progress!"
                    : latestPlan.trend === "worse"
                      ? "⚠️ Adjusted Plan"
                      : "📊 Steady Progress"}
                </Text>
              </View>
              <Text variant="bodyMedium" className="mb-3">
                {latestPlan.aiFeedbackJson.summary}
              </Text>
              {latestPlan.aiFeedbackJson.caution && (
                <View className="bg-amber-100 border border-amber-300 rounded-lg p-3 mb-3">
                  <Text variant="bodySmall" className="text-amber-900">
                    ⚠️ {latestPlan.aiFeedbackJson.caution}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

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
                    <Text>🟢 New</Text>
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

        {/* Progress Summary Section */}
        {summary && (
          <View className="mb-4">
            <Text variant="headlineSmall" className="font-bold mb-3">
              Your Progress
            </Text>

            {/* Streak Card */}
            <Card className="mb-3" mode="elevated">
              <Card.Content>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text variant="titleLarge" className="font-bold">
                      🔥 {summary.adherence.currentStreak}-day streak
                    </Text>
                    <Text variant="bodyMedium" className="text-gray-600">
                      {Math.round(summary.adherence.adherenceRate * 100)}% adherence
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text variant="bodySmall" className="text-gray-500">
                      Best: {summary.adherence.longestStreak} days
                    </Text>
                  </View>
                </View>
                {/* Progress bar */}
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${summary.adherence.adherenceRate * 100}%` }}
                  />
                </View>
              </Card.Content>
            </Card>

            {/* Weekly Trend Chart Card */}
            {summary.chartData?.days && summary.chartData.days.length > 0 && (
              <Card className="mb-3" mode="elevated">
                <Card.Content>
                  <Text variant="titleMedium" className="font-bold mb-3">
                    📈 This Week
                  </Text>
                  <WeeklyTrendChart data={summary.chartData.days} />
                  {/* Show avg changes */}
                  <View className="flex-row gap-3 mt-3">
                    <Text variant="bodySmall" className="text-gray-600">
                      Pain: {summary.chartData.avgPainChange > 0 ? "+" : ""}
                      {summary.chartData.avgPainChange.toFixed(1)}
                    </Text>
                    <Text variant="bodySmall" className="text-gray-600">
                      Stiffness: {summary.chartData.avgStiffnessChange > 0 ? "+" : ""}
                      {summary.chartData.avgStiffnessChange.toFixed(1)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )}

            {/* Weekly Summary Card (GPT feedback) */}
            {summary.weeklySummary && (
              <Card className="mb-3" mode="elevated" style={{ backgroundColor: "#f0f9ff" }}>
                <Card.Content>
                  <Text variant="titleMedium" className="font-bold mb-2">
                    {summary.weeklySummary.emoji} Weekly Insight
                  </Text>
                  <Text variant="bodyMedium" className="mb-3">
                    {summary.weeklySummary.summary}
                  </Text>
                  {summary.weeklySummary.highlights?.map((highlight: string, idx: number) => (
                    <Text key={idx} variant="bodySmall" className="mb-1 text-gray-700">
                      • {highlight}
                    </Text>
                  ))}
                  <Text variant="bodySmall" className="text-indigo-700 mt-2 italic">
                    {summary.weeklySummary.encouragement}
                  </Text>
                </Card.Content>
              </Card>
            )}

            {/* Celebration Banner (5+ day streak) */}
            {summary.adherence.currentStreak >= 5 && (
              <Card className="mb-3" mode="elevated" style={{ backgroundColor: "#d1fae5" }}>
                <Card.Content>
                  <Text variant="bodyMedium" className="text-green-800 font-semibold">
                    🔥 You&apos;re on fire! {summary.adherence.currentStreak}-day streak achieved.
                  </Text>
                </Card.Content>
              </Card>
            )}

            {/* Re-engagement Banner (2+ days since last log) */}
            {summary.adherence.lastLoggedAt &&
              (() => {
                const daysSince = Math.floor(
                  (Date.now() - new Date(summary.adherence.lastLoggedAt).getTime()) /
                    (1000 * 60 * 60 * 24),
                );
                return (
                  daysSince >= 2 && (
                    <Card className="mb-3" mode="elevated" style={{ backgroundColor: "#fef3c7" }}>
                      <Card.Content>
                        <View className="flex-row items-center gap-2 mb-2">
                          <Text variant="titleMedium">👋</Text>
                          <View className="flex-1">
                            <Text variant="bodyMedium" className="font-semibold">
                              Let&apos;s do a quick check-in today
                            </Text>
                            <Text variant="bodySmall" className="text-gray-600">
                              Keep your {summary.adherence.currentStreak}-day streak alive!
                            </Text>
                          </View>
                        </View>
                        <Button
                          mode="contained"
                          onPress={handleLogToday}
                          compact
                          style={{ backgroundColor: "#f59e0b" }}
                        >
                          <Text>Log Progress</Text>
                        </Button>
                      </Card.Content>
                    </Card>
                  )
                );
              })()}
          </View>
        )}

        {program.status === "active" && !hasLoggedToday && (
          <Card className="mb-4" mode="elevated">
            <Card.Content>
              <Text variant="titleLarge" className="font-bold mb-2">
                Log today&apos;s progress
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
