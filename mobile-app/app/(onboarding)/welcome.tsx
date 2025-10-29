import { View } from "react-native";
import { Text, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import BaseLayout from "../../src/components/BaseLayout";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/(onboarding)/area");
  };

  return (
    <BaseLayout centered>
      <View className="px-6">
        {/* Header */}
        <View className="mb-12 items-center">
          <Text variant="displaySmall" className="font-bold mb-4 text-center">
            Welcome to Remend
          </Text>
          <Text variant="titleLarge" className="text-gray-600 text-center">
            Let's build your personalized rehab plan
          </Text>
        </View>

        {/* Info Cards */}
        <View className="mb-12 gap-6">
          <View className="flex-row items-start gap-4">
            <Text variant="headlineLarge">📋</Text>
            <View className="flex-1">
              <Text variant="titleMedium" className="font-semibold mb-1">
                Guided Assessment
              </Text>
              <Text variant="bodyMedium" className="text-gray-600">
                We'll ask a few questions to understand your pain and recovery goals
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-4">
            <Text variant="headlineLarge">🎯</Text>
            <View className="flex-1">
              <Text variant="titleMedium" className="font-semibold mb-1">
                Smart Recommendations
              </Text>
              <Text variant="bodyMedium" className="text-gray-600">
                Get exercise suggestions tailored to your specific needs
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-4">
            <Text variant="headlineLarge">📈</Text>
            <View className="flex-1">
              <Text variant="titleMedium" className="font-semibold mb-1">
                Track Progress
              </Text>
              <Text variant="bodyMedium" className="text-gray-600">
                Log your recovery journey and see how you're improving
              </Text>
            </View>
          </View>
        </View>

        {/* Get Started Button */}
        <Button
          mode="contained"
          onPress={handleGetStarted}
          contentStyle={{ paddingVertical: 8 }}
          labelStyle={{ fontSize: 18 }}
        >
          <Text>Get Started</Text>
        </Button>

        {/* Disclaimer */}
        <View className="mt-8">
          <Text variant="bodySmall" className="text-gray-500 text-center">
            This app provides educational guidance only. Always consult a healthcare provider for
            medical advice.
          </Text>
        </View>
      </View>
    </BaseLayout>
  );
}
