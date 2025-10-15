import { useEffect } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useRouter, Redirect } from "expo-router";
import { useAuthStore } from "../src/stores/authStore";
import { features } from "../src/config/features";

/**
 * Home route that redirects to the appropriate home screen based on user mode
 */
export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  // If user logs out, redirect to login
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // If no mode selected, go to mode picker
  if (!user?.mode) {
    return <Redirect href="/(onboarding)/mode-picker" />;
  }

  // Redirect to appropriate home screen based on mode
  if (user.mode === "rehab") {
    return <Redirect href="/rehab-home" />;
  } else if (user.mode === "maintenance") {
    return <Redirect href="/maintenance-home" />;
  } else if (user.mode === "general") {
    // If general mode is disabled, redirect to mode picker to choose rehab/maintenance
    if (!features.generalModeEnabled) {
      return <Redirect href="/(onboarding)/mode-picker" />;
    }
    return <Redirect href="/general-home" />;
  }

  // Fallback - should not reach here
  return <Redirect href="/(onboarding)/mode-picker" />;
}
