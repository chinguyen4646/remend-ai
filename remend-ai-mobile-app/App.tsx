import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "./src/stores/authStore";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ModePickerScreen from "./src/screens/ModePickerScreen";
import RehabSetupScreen from "./src/screens/RehabSetupScreen";
import RehabHomeScreen from "./src/screens/RehabHomeScreen";
import MaintenanceHomeScreen from "./src/screens/MaintenanceHomeScreen";
import GeneralHomeScreen from "./src/screens/GeneralHomeScreen";

type AppScreen =
  | "login"
  | "register"
  | "modePicker"
  | "rehabSetup"
  | "rehabHome"
  | "maintenanceHome"
  | "generalHome";

export default function App() {
  const [authScreen, setAuthScreen] = useState<"login" | "register">("login");
  const [showRehabSetup, setShowRehabSetup] = useState(false);
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Derive screen directly from state
  const screen: AppScreen = !isAuthenticated
    ? authScreen
    : !user?.mode
      ? "modePicker"
      : showRehabSetup && user.mode === "rehab"
        ? "rehabSetup"
        : user.mode === "rehab"
          ? "rehabHome"
          : user.mode === "maintenance"
            ? "maintenanceHome"
            : "generalHome";

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  const handleLogout = async () => {
    setAuthScreen("login");
    await useAuthStore.getState().logout();
  };

  const renderScreen = () => {
    switch (screen) {
      case "login":
        return <LoginScreen onNavigateToRegister={() => setAuthScreen("register")} />;

      case "register":
        return <RegisterScreen onNavigateToLogin={() => setAuthScreen("login")} />;

      case "modePicker":
        return <ModePickerScreen onComplete={() => loadUser()} />;

      case "rehabSetup":
        return (
          <RehabSetupScreen
            onComplete={() => setShowRehabSetup(false)}
            onSkip={() => setShowRehabSetup(false)}
          />
        );

      case "rehabHome":
        return (
          <RehabHomeScreen onSetupProgram={() => setShowRehabSetup(true)} onLogout={handleLogout} />
        );

      case "maintenanceHome":
        return <MaintenanceHomeScreen onLogout={handleLogout} />;

      case "generalHome":
        return <GeneralHomeScreen onLogout={handleLogout} />;

      default:
        return (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" />
          </View>
        );
    }
  };

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar style="auto" />
        {renderScreen()}
      </PaperProvider>
    </SafeAreaProvider>
  );
}
