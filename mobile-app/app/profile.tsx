import { useEffect, useState } from "react";
import { View, RefreshControl, ScrollView } from "react-native";
import { Text, Card, Button, ActivityIndicator, Chip } from "react-native-paper";
import { useRouter } from "expo-router";
import { authApi } from "../src/api/auth";
import type { User } from "../src/types/auth";
import { useAuthStore } from "../src/stores/authStore";
import BaseLayout from "../src/components/BaseLayout";
import { rehabApi } from "../src/api/rehab";
import type { RehabProgram } from "../src/types/rehab";

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [programs, setPrograms] = useState<RehabProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      setError(null);
      const response = await authApi.me();
      setUser(response.user);
      // Fetch programs if user is in rehab mode
      if (response.user.mode === "rehab") {
        fetchPrograms();
      }
    } catch (err: unknown) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      setProgramsLoading(true);
      const response = await rehabApi.getPrograms();
      setPrograms(response.programs);
    } catch (err: unknown) {
      // Silently fail - programs are optional
      console.error("Failed to fetch programs:", err);
    } finally {
      setProgramsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUser();
  };

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
    router.replace("/(auth)/login");
  };

  const handleGoToHome = () => {
    if (user?.mode === "rehab") {
      router.push("/home");
    } else if (user?.mode === "maintenance") {
      router.push("/maintenance-home");
    } else if (user?.mode === "general") {
      router.push("/general-home");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white p-6">
        <Button mode="text" onPress={handleBack} className="self-start mb-4">
          <Text>← Back</Text>
        </Button>
        <View className="flex-1 justify-center items-center">
          <Text variant="bodyLarge" className="text-red-600 mb-4">
            {error}
          </Text>
          <Button mode="contained" onPress={fetchUser}>
            <Text>Retry</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <BaseLayout scrollable={false}>
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <Button mode="text" onPress={handleBack} className="self-start mb-4">
          <Text>← Back</Text>
        </Button>

        <Text variant="headlineMedium" className="font-bold mb-6">
          Profile
        </Text>

        <Card className="mb-4">
          <Card.Content>
            <Text variant="titleLarge" className="font-bold mb-4">
              Account Information
            </Text>

            <View className="gap-3">
              <View>
                <Text variant="labelMedium" className="text-gray-600 mb-1">
                  Full Name
                </Text>
                <Text variant="bodyLarge">{user?.fullName || "Not provided"}</Text>
              </View>

              <View>
                <Text variant="labelMedium" className="text-gray-600 mb-1">
                  Email
                </Text>
                <Text variant="bodyLarge">{user?.email}</Text>
              </View>

              <View>
                <Text variant="labelMedium" className="text-gray-600 mb-1">
                  User ID
                </Text>
                <Text variant="bodyLarge">#{user?.id}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {user?.mode === "rehab" && (
          <Card className="mb-4">
            <Card.Content>
              <Text variant="titleLarge" className="font-bold mb-4">
                My Rehab Programs
              </Text>

              {programsLoading && (
                <View className="py-4">
                  <ActivityIndicator size="small" />
                </View>
              )}

              {!programsLoading && programs.length === 0 && (
                <Text variant="bodyMedium" className="text-gray-600">
                  No rehab programs yet. Create one to start tracking your recovery.
                </Text>
              )}

              {!programsLoading && programs.length > 0 && (
                <View className="gap-3">
                  {programs.map((program) => {
                    const formatArea = () => {
                      const side =
                        program.side === "both"
                          ? "Both"
                          : program.side === "na"
                            ? ""
                            : program.side.charAt(0).toUpperCase() + program.side.slice(1);
                      const area =
                        program.area === "other"
                          ? program.areaOtherLabel || "Other"
                          : program.area.replace("_", " ");
                      return `${side} ${area}`.trim();
                    };

                    const getStatusColor = () => {
                      if (program.status === "active") return "#10b981"; // green
                      if (program.status === "paused") return "#f59e0b"; // yellow
                      return "#6b7280"; // gray
                    };

                    return (
                      <Button
                        key={program.id}
                        mode="outlined"
                        onPress={() => router.push(`/rehab-home?programId=${program.id}`)}
                        className="justify-start"
                        contentStyle={{ justifyContent: "flex-start" }}
                      >
                        <View className="flex-row items-center justify-between w-full">
                          <View className="flex-1">
                            <Text variant="bodyLarge" className="font-medium mb-1">
                              {formatArea()}
                            </Text>
                            <Text variant="bodySmall" className="text-gray-600">
                              Started {new Date(program.startDate).toLocaleDateString()}
                            </Text>
                          </View>
                          <Chip
                            style={{ backgroundColor: getStatusColor() }}
                            textStyle={{ color: "white", fontSize: 12 }}
                            compact
                          >
                            {program.status}
                          </Chip>
                        </View>
                      </Button>
                    );
                  })}
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        <Button mode="outlined" onPress={handleLogout} className="mt-4" textColor="#dc2626">
          <Text>Sign Out</Text>
        </Button>
      </ScrollView>
    </BaseLayout>
  );
}
