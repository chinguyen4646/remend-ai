import { View } from "react-native";
import { IconButton } from "react-native-paper";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../stores/authStore";

/**
 * BottomTabBar component - Simple bottom navigation with profile avatar
 *
 * Features:
 * - Shows avatar icon button that navigates to /profile
 * - Auto-hides on profile, auth, and onboarding screens
 * - Safe area support for notched devices
 */
export default function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { logout } = useAuthStore();

  // Hide entire bar on auth and onboarding routes
  const authRoutes = ["/login", "/register"];
  const onboardingRoutes = [
    "/welcome",
    "/area",
    "/describe",
    "/duration-intensity",
    "/aggravators-easers",
    "/ai-insight",
  ];
  const shouldHideBar = authRoutes.includes(pathname) || onboardingRoutes.includes(pathname);

  if (shouldHideBar) {
    return null;
  }

  const handleNavigateToProfile = () => {
    router.push("/profile");
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: insets.bottom,
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderColor: "black",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 8,
        zIndex: 9999,
      }}
    >
      <View
        style={{
          height: 56,
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          paddingHorizontal: 48,
        }}
      >
        <IconButton
          icon="account-circle"
          size={28}
          onPress={handleNavigateToProfile}
          mode="contained"
          containerColor="#e0e7ff"
          iconColor="#6366f1"
        />
        <IconButton
          icon="logout"
          size={28}
          onPress={handleLogout}
          mode="contained"
          containerColor="#fee2e2"
          iconColor="#dc2626"
        />
      </View>
    </View>
  );
}
