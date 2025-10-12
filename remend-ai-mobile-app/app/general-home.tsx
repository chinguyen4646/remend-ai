import { View } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuthStore } from "../src/stores/authStore";
import BaseLayout from "../src/components/BaseLayout";

export default function GeneralHomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();

  const handleNavigateToProfile = () => {
    router.push("/profile");
  };

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
    router.replace("/(auth)/login");
  };

  return (
    <BaseLayout>
      <View className="mb-6 flex-row justify-between items-start">
        <View className="flex-1">
          <Text variant="headlineMedium" className="font-bold mb-2">
            General Mode 😊
          </Text>
          <Text variant="bodyLarge" className="text-gray-600">
            How are you feeling today, {user?.fullName || "there"}?
          </Text>
        </View>
        <Button mode="text" onPress={handleNavigateToProfile} compact>
          <Text>Me</Text>
        </Button>
      </View>

      <Card className="mb-4">
        <Card.Content>
          <Text variant="titleMedium" className="font-bold mb-2">
            Coming Soon
          </Text>
          <Text variant="bodyMedium" className="text-gray-600">
            • Daily check-ins
            {"\n"}• Wellness tracking
            {"\n"}• Personalized tips
          </Text>
        </Card.Content>
      </Card>

      <Button mode="outlined" onPress={handleLogout} className="mt-4" textColor="#dc2626">
        <Text>Sign Out</Text>
      </Button>
    </BaseLayout>
  );
}
