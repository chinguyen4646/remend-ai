import { useEffect, useState } from "react";
import { View, RefreshControl, ScrollView } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Feather } from "@expo/vector-icons";
import { useWellnessLogStore } from "../src/stores/wellnessLogStore";
import BaseLayout from "../src/components/BaseLayout";
import { formatCalendarDate } from "../src/utils/dates";
import { AppButton, AppCard } from "../src/ui/components";
import { theme } from "../src/ui/theme";

export default function MaintenanceHomeScreen() {
  const { logs, hasLoggedToday, loadLogs, isLoading } = useWellnessLogStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLogs("maintenance");
  }, [loadLogs]);

  // Reload logs when screen comes into focus (e.g., after creating a check-in)
  useFocusEffect(
    useCallback(() => {
      loadLogs("maintenance");
    }, [loadLogs]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs("maintenance");
    setRefreshing(false);
  };

  const handleCheckIn = () => {
    router.push("/(wellness)/check-in-form?mode=maintenance");
  };

  if (isLoading && logs.length === 0) {
    return (
      <BaseLayout gradient={["#F8FAFC", "#FFFFFF"]} centered>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </BaseLayout>
    );
  }

  return (
    <BaseLayout gradient={["#F8FAFC", "#FFFFFF"]} scrollable={false}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={{ marginBottom: theme.spacing[6] }}>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing[2] }}
          >
            <Feather
              name="activity"
              size={28}
              color={theme.colors.primary[600]}
              style={{ marginRight: theme.spacing[2] }}
            />
            <Text
              variant="headlineLarge"
              style={{
                fontWeight: "700",
                color: theme.colors.text.primary,
              }}
            >
              Maintenance Mode
            </Text>
          </View>
          <Text variant="bodyMedium" style={{ color: theme.colors.neutral[500] }}>
            Stay on top of your health and maintain your wellness journey
          </Text>
        </View>

        {/* Check-in CTA */}
        {!hasLoggedToday && (
          <AppCard shadow padding="md" style={{ marginBottom: theme.spacing[4] }}>
            <Text
              variant="titleLarge"
              style={{
                fontWeight: "600",
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[2],
              }}
            >
              Daily Check-In
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.neutral[500],
                marginBottom: theme.spacing[4],
              }}
            >
              How are you feeling today? Track your wellness to stay on top of your health.
            </Text>
            <AppButton variant="primary" size="large" onPress={handleCheckIn}>
              Check In
            </AppButton>
          </AppCard>
        )}

        {/* Already checked in today */}
        {hasLoggedToday && (
          <AppCard
            leftAccentColor="#10B981"
            shadow
            padding="md"
            style={{ backgroundColor: "#DCFCE7", marginBottom: theme.spacing[4] }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing[1] }}
            >
              <Feather
                name="check-circle"
                size={20}
                color="#15803D"
                style={{ marginRight: theme.spacing[2] }}
              />
              <Text variant="titleMedium" style={{ fontWeight: "600", color: "#15803D" }}>
                Checked in today
              </Text>
            </View>
            <Text variant="bodyMedium" style={{ color: "#15803D" }}>
              Great job! Come back tomorrow to check in again.
            </Text>
          </AppCard>
        )}

        {/* Last 7 Days */}
        {logs.length > 0 && (
          <AppCard shadow padding="md" style={{ marginBottom: theme.spacing[4] }}>
            <Text
              variant="titleLarge"
              style={{
                fontWeight: "600",
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[4],
              }}
            >
              Last 7 Days
            </Text>

            {/* Logs List */}
            <View>
              {logs.map((log, index) => (
                <View
                  key={log.id}
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: theme.colors.primary[500],
                    paddingLeft: theme.spacing[3],
                    paddingVertical: theme.spacing[2],
                    marginBottom: index < logs.length - 1 ? theme.spacing[3] : 0,
                  }}
                >
                  <Text
                    variant="labelLarge"
                    style={{
                      fontWeight: "700",
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing[1],
                    }}
                  >
                    {formatCalendarDate(log.date)}
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing[4] }}>
                    {log.pain !== null && (
                      <Text variant="bodyMedium" style={{ color: theme.colors.text.primary }}>
                        Pain: {log.pain}
                      </Text>
                    )}
                    {log.stiffness !== null && (
                      <Text variant="bodyMedium" style={{ color: theme.colors.text.primary }}>
                        Stiffness: {log.stiffness}
                      </Text>
                    )}
                    {log.tension !== null && (
                      <Text variant="bodyMedium" style={{ color: theme.colors.text.primary }}>
                        Tension: {log.tension}
                      </Text>
                    )}
                    {log.energy !== null && (
                      <Text variant="bodyMedium" style={{ color: theme.colors.text.primary }}>
                        Energy: {log.energy}
                      </Text>
                    )}
                  </View>
                  {log.areaTag && (
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.neutral[500], marginTop: 4 }}
                    >
                      Area: {log.areaTag}
                    </Text>
                  )}
                  {log.notes && (
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.neutral[500], marginTop: 4 }}
                      numberOfLines={2}
                    >
                      {log.notes}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </AppCard>
        )}

        {/* Empty state */}
        {logs.length === 0 && !isLoading && (
          <AppCard shadow padding="md" style={{ marginBottom: theme.spacing[4] }}>
            <Text
              variant="titleMedium"
              style={{
                fontWeight: "600",
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[2],
              }}
            >
              Start Tracking
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.neutral[500] }}>
              Your check-in history will appear here after your first entry.
            </Text>
          </AppCard>
        )}
      </ScrollView>
    </BaseLayout>
  );
}
