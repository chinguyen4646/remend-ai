import { useEffect } from "react";
import { View } from "react-native";
import { ActivityIndicator, Text, Button } from "react-native-paper";
import { useRouter, Redirect } from "expo-router";
import { useAuthStore } from "../src/stores/authStore";
import { useRehabProgramStore } from "../src/stores/rehabProgramStore";
import { features } from "../src/config/features";

/**
 * Home route that redirects to the appropriate home screen based on user mode
 */
export default function Home() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { activeProgram, isLoading: programLoading, loadActiveProgram } = useRehabProgramStore();
  const router = useRouter();

  // If user logs out, redirect to login
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch active program for rehab mode
  useEffect(() => {
    if (user?.mode === "rehab") {
      loadActiveProgram();
    }
  }, [user?.mode, loadActiveProgram]);

  // Navigate to rehab-home with programId once loaded
  useEffect(() => {
    if (user?.mode === "rehab" && !programLoading && activeProgram) {
      router.replace(`/rehab-home?programId=${activeProgram.id}`);
    }
  }, [user?.mode, programLoading, activeProgram, router]);

  if (authLoading || (user?.mode === "rehab" && programLoading)) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // If no mode selected, go to onboarding flow
  if (!user?.mode) {
    return <Redirect href="/(onboarding)/baseline" />;
  }

  // For rehab mode: show no active program message
  if (user.mode === "rehab" && !programLoading && !activeProgram) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Text variant="headlineMedium" className="font-bold mb-4 text-center">
          No Active Program
        </Text>
        <Text variant="bodyLarge" className="text-gray-600 mb-6 text-center">
          Create a rehab program to start tracking your recovery
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push("/(onboarding)/rehab-setup")}
          icon="plus"
        >
          <Text>Create Program</Text>
        </Button>
      </View>
    );
  }

  // Redirect to appropriate home screen based on mode
  if (user.mode === "maintenance") {
    return <Redirect href="/maintenance-home" />;
  } else if (user.mode === "general") {
    // If general mode is disabled, redirect to onboarding flow to choose rehab/maintenance
    if (!features.generalModeEnabled) {
      return <Redirect href="/(onboarding)/baseline" />;
    }
    return <Redirect href="/general-home" />;
  }

  // Fallback - should not reach here
  return <Redirect href="/(onboarding)/baseline" />;
}
