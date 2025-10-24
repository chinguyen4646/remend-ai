import { useEffect } from "react";
import { Slot } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../src/stores/authStore";
import BottomTabBar from "../src/components/BottomTabBar";

/**
 * Root layout - provides global context and initializes auth
 * No navigation logic here - that's handled by individual routes
 */
export default function RootLayout() {
  const { loadUser } = useAuthStore();

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar style="auto" />
        <Slot />
        <BottomTabBar />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
