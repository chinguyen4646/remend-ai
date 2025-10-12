import { View } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import { useAuthStore } from "../stores/authStore";
import BaseLayout from "../components/BaseLayout";

interface Props {
  onNavigateToProfile: () => void;
  onLogout: () => void;
}

export default function MaintenanceHomeScreen({ onNavigateToProfile, onLogout }: Props) {
  const { user } = useAuthStore();

  return (
    <BaseLayout>
      <View className="mb-6 flex-row justify-between items-start">
        <View className="flex-1">
          <Text variant="headlineMedium" className="font-bold mb-2">
            Maintenance Mode 💪
          </Text>
          <Text variant="bodyLarge" className="text-gray-600">
            Keep up the great work, {user?.fullName || "there"}
          </Text>
        </View>
        <Button mode="text" onPress={onNavigateToProfile} compact>
          <Text>Me</Text>
        </Button>
      </View>

      <Card className="mb-4">
        <Card.Content>
          <Text variant="titleMedium" className="font-bold mb-2">
            Coming Soon
          </Text>
          <Text variant="bodyMedium" className="text-gray-600">
            • Daily wellness logging
            {"\n"}• Strength tracking
            {"\n"}• Prevention insights
          </Text>
        </Card.Content>
      </Card>

      <Button mode="outlined" onPress={onLogout} className="mt-4" textColor="#dc2626">
        <Text>Sign Out</Text>
      </Button>
    </BaseLayout>
  );
}
