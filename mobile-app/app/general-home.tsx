import { useEffect, useState } from "react";
import { View, RefreshControl, ScrollView } from "react-native";
import { Text, Button, Card, ActivityIndicator } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useWellnessLogStore } from "../src/stores/wellnessLogStore";
import BaseLayout from "../src/components/BaseLayout";
import { formatCalendarDate } from "../src/utils/dates";

export default function GeneralHomeScreen() {
  const { logs, hasLoggedToday, loadLogs, isLoading } = useWellnessLogStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLogs("general");
  }, [loadLogs]);

  // Reload logs when screen comes into focus (e.g., after creating a check-in)
  useFocusEffect(
    useCallback(() => {
      loadLogs("general");
    }, [loadLogs]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs("general");
    setRefreshing(false);
  };

  const handleCheckIn = () => {
    router.push("/(wellness)/check-in-form?mode=general");
  };

  if (isLoading && logs.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
              General Mode 😊
            </Text>
          </View>
        </View>

        {/* Check-in CTA */}
        {!hasLoggedToday && (
          <Card className="mb-4" mode="elevated">
            <Card.Content>
              <Text variant="titleLarge" className="font-bold mb-2">
                Daily Check-In
              </Text>
              <Text variant="bodyMedium" className="text-gray-600 mb-4">
                How are you feeling today? Keep track of your wellness journey.
              </Text>
              <Button mode="contained" onPress={handleCheckIn} icon="plus">
                <Text>Check In</Text>
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Already checked in today */}
        {hasLoggedToday && (
          <Card className="mb-4" mode="outlined">
            <Card.Content>
              <Text variant="titleMedium" className="font-bold mb-2 text-green-600">
                ✓ Checked in today
              </Text>
              <Text variant="bodyMedium" className="text-gray-600">
                Great job! Come back tomorrow to check in again.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Last 7 Days */}
        {logs.length > 0 && (
          <Card className="mb-4">
            <Card.Content>
              <Text variant="titleLarge" className="font-bold mb-4">
                Last 7 Days
              </Text>

              {/* Logs List */}
              <View className="gap-3">
                {logs.map((log) => (
                  <View key={log.id} className="border-l-4 border-indigo-500 pl-3 py-2">
                    <Text variant="labelLarge" className="font-bold mb-1">
                      {formatCalendarDate(log.date)}
                    </Text>
                    <View className="flex-row gap-4 flex-wrap">
                      {log.pain !== null && <Text variant="bodyMedium">Pain: {log.pain}</Text>}
                      {log.stiffness !== null && (
                        <Text variant="bodyMedium">Stiffness: {log.stiffness}</Text>
                      )}
                      {log.tension !== null && (
                        <Text variant="bodyMedium">Tension: {log.tension}</Text>
                      )}
                      {log.energy !== null && (
                        <Text variant="bodyMedium">Energy: {log.energy}</Text>
                      )}
                    </View>
                    {log.areaTag && (
                      <Text variant="bodySmall" className="text-gray-600 mt-1">
                        Area: {log.areaTag}
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

        {/* Empty state */}
        {logs.length === 0 && !isLoading && (
          <Card className="mb-4">
            <Card.Content>
              <Text variant="titleMedium" className="font-bold mb-2">
                Start Tracking
              </Text>
              <Text variant="bodyMedium" className="text-gray-600">
                Your check-in history will appear here after your first entry.
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </BaseLayout>
  );
}
