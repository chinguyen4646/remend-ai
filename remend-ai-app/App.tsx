import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "./src/stores/authStore";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";

export default function App() {
  const [screen, setScreen] = useState<"login" | "register">("login");
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar style="auto" />
        {isAuthenticated ? (
          <HomeScreen />
        ) : screen === "login" ? (
          <LoginScreen onNavigateToRegister={() => setScreen("register")} />
        ) : (
          <RegisterScreen onNavigateToLogin={() => setScreen("login")} />
        )}
      </PaperProvider>
    </SafeAreaProvider>
  );
}
