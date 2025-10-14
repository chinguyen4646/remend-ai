import { View, Text } from "react-native";
import { Card, ActivityIndicator } from "react-native-paper";

/**
 * Loading skeleton for AI Advice card
 * Shows a placeholder while advice is being fetched
 */
export default function AIAdviceLoadingSkeleton() {
  return (
    <Card className="mb-4 bg-blue-50">
      <Card.Content>
        <View className="flex-row items-center justify-center py-8">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-base text-blue-700 ml-3">Generating AI insights...</Text>
        </View>
      </Card.Content>
    </Card>
  );
}
