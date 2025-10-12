import { useEffect, useState } from "react";
import { View, RefreshControl, ScrollView } from "react-native";
import { Text, Card, Button, ActivityIndicator } from "react-native-paper";
import { authApi } from "../api/auth";
import type { User } from "../types/auth";
import BaseLayout from "../components/BaseLayout";

interface Props {
  onBack: () => void;
  onLogout: () => void;
}

export default function ProfileScreen({ onBack, onLogout }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setError(null);
      const response = await authApi.me();
      setUser(response.user);
    } catch (err: any) {
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
        <Button mode="text" onPress={onBack} className="self-start mb-4">
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
        <Button mode="text" onPress={onBack} className="self-start mb-4">
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
          </Card.Content>
        </Card>

        <Button mode="outlined" onPress={onLogout} className="mt-4" textColor="#dc2626">
          <Text>Sign Out</Text>
        </Button>
      </ScrollView>
    </BaseLayout>
  );
}
