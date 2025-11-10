import { useEffect } from "react";
import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { useRouter, Redirect } from "expo-router";
import { useAuthStore } from "../src/stores/authStore";
import { useRehabProgramStore } from "../src/stores/rehabProgramStore";
import BaseLayout from "../src/components/BaseLayout";
import { AppButton, AppCard } from "../src/ui/components";
import { theme } from "../src/ui/theme";

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

  // Navigate to profile page once loaded
  useEffect(() => {
    if (user?.mode === "rehab" && !programLoading) {
      router.replace("/profile");
    }
  }, [user?.mode, programLoading, router]);

  // Show loading while auth is loading OR while user is authenticated but user object not loaded yet
  if (authLoading || (isAuthenticated && !user) || (user?.mode === "rehab" && programLoading)) {
    return (
      <BaseLayout gradient={["#F8FAFC", "#FFFFFF"]} centered>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </BaseLayout>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // If no mode selected, go to onboarding flow
  if (!user?.mode) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  // For rehab mode: show no active program message
  if (user.mode === "rehab" && !programLoading && !activeProgram) {
    return (
      <BaseLayout gradient={["#F8FAFC", "#FFFFFF"]} centered>
        <AppCard
          shadow
          padding="lg"
          style={{ alignItems: "center", paddingVertical: theme.spacing[8] }}
        >
          <Text
            variant="headlineMedium"
            style={{
              fontWeight: "700",
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[4],
              textAlign: "center",
            }}
          >
            No Active Program
          </Text>
          <Text
            variant="bodyLarge"
            style={{
              color: theme.colors.neutral[500],
              marginBottom: theme.spacing[6],
              textAlign: "center",
            }}
          >
            Create a rehab program to start tracking your recovery
          </Text>
          <AppButton
            variant="primary"
            size="large"
            onPress={() => router.push("/(onboarding)/welcome")}
          >
            Create Program
          </AppButton>
        </AppCard>
      </BaseLayout>
    );
  }

  // Only rehab mode is supported - redirect any other modes to onboarding
  if (user.mode !== "rehab") {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  // For rehab users - show loading while useEffect redirects to profile
  if (user.mode === "rehab") {
    return (
      <BaseLayout gradient={["#F8FAFC", "#FFFFFF"]} centered>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </BaseLayout>
    );
  }

  // Fallback - should not reach here for valid rehab users
  return <Redirect href="/(onboarding)/welcome" />;
}
