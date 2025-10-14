import { useEffect, useState } from "react";
import { View, RefreshControl, ScrollView } from "react-native";
import { Text, Card, Button, ActivityIndicator } from "react-native-paper";
import { useRouter } from "expo-router";
import { authApi } from "../src/api/auth";
import type { User } from "../src/types/auth";
import { useAuthStore } from "../src/stores/authStore";
import BaseLayout from "../src/components/BaseLayout";
import ModeSwitchModal from "../src/components/ModeSwitchModal";

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModeSwitchModal, setShowModeSwitchModal] = useState(false);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      setError(null);
      const response = await authApi.me();
      setUser(response.user);
    } catch (err: unknown) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
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
      router.push("/rehab-home");
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

        <Card className="mb-4">
          <Card.Content>
            <Text variant="titleLarge" className="font-bold mb-4">
              Mode Settings
            </Text>

            <View className="gap-3">
              <View>
                <Text variant="labelMedium" className="text-gray-600 mb-1">
                  Current Mode
                </Text>
                <Text variant="bodyLarge">
                  {user?.mode ? user.mode.charAt(0).toUpperCase() + user.mode.slice(1) : "Not set"}
                </Text>
              </View>

              {user?.mode === "rehab" && user?.injuryType && (
                <View>
                  <Text variant="labelMedium" className="text-gray-600 mb-1">
                    Injury Type
                  </Text>
                  <Text variant="bodyLarge">{user.injuryType}</Text>
                </View>
              )}

              {user?.modeStartedAt && (
                <View>
                  <Text variant="labelMedium" className="text-gray-600 mb-1">
                    Mode Started
                  </Text>
                  <Text variant="bodyLarge">
                    {new Date(user.modeStartedAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            {user?.mode && (
              <View className="gap-2 mt-4">
                <Button mode="contained" onPress={handleGoToHome} icon="home">
                  <Text>Go to {user.mode.charAt(0).toUpperCase() + user.mode.slice(1)} Home</Text>
                </Button>
                <Button mode="outlined" onPress={() => setShowModeSwitchModal(true)}>
                  <Text>Change Mode</Text>
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        <Button mode="outlined" onPress={handleLogout} className="mt-4" textColor="#dc2626">
          <Text>Sign Out</Text>
        </Button>
      </ScrollView>

      <ModeSwitchModal
        visible={showModeSwitchModal}
        onDismiss={() => {
          setShowModeSwitchModal(false);
          // Refresh user data after modal closes
          fetchUser();
        }}
        currentMode={user?.mode || null}
      />
    </BaseLayout>
  );
}
