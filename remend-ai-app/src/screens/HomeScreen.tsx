import React, { useEffect, useState } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { Text, Button, Card, ActivityIndicator } from "react-native-paper";
import { useAuthStore } from "../stores/authStore";
import { authApi } from "../api/auth";

export default function HomeScreen() {
  const { user, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [fetchedUser, setFetchedUser] = useState(user);

  const fetchUserData = async () => {
    try {
      setRefreshing(true);
      const response = await authApi.me();
      setFetchedUser(response.user);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  if (!fetchedUser) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUserData} />}
    >
      <View className="p-6">
        <View className="mb-6">
          <Text variant="headlineMedium" className="font-bold mb-2">
            Welcome back! 👋
          </Text>
          <Text variant="bodyLarge" className="text-gray-600">
            Your rehab journey continues
          </Text>
        </View>

        <Card className="mb-4">
          <Card.Content>
            <Text variant="titleLarge" className="font-bold mb-4">
              Profile Information
            </Text>

            <View className="gap-3">
              <View>
                <Text variant="labelMedium" className="text-gray-600 mb-1">
                  Full Name
                </Text>
                <Text variant="bodyLarge">{fetchedUser.fullName || "Not provided"}</Text>
              </View>

              <View>
                <Text variant="labelMedium" className="text-gray-600 mb-1">
                  Email Address
                </Text>
                <Text variant="bodyLarge">{fetchedUser.email}</Text>
              </View>

              <View>
                <Text variant="labelMedium" className="text-gray-600 mb-1">
                  User ID
                </Text>
                <Text variant="bodyLarge">#{fetchedUser.id}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text variant="titleLarge" className="font-bold mb-2">
              Quick Stats
            </Text>
            <Text variant="bodyMedium" className="text-gray-600">
              Your rehabilitation metrics will appear here
            </Text>
          </Card.Content>
        </Card>

        <Button mode="outlined" onPress={handleLogout} className="mt-4" textColor="#dc2626">
          <Text>Sign Out</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
