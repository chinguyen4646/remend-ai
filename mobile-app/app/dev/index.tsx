/**
 * Dev Menu
 * Quick access to development/testing screens
 */

import { View } from "react-native";
import { Text, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import BaseLayout from "../../src/components/BaseLayout";

export default function DevMenuScreen() {
  const router = useRouter();

  return (
    <BaseLayout>
      <View className="gap-4">
        <Text variant="headlineMedium" className="font-bold mb-4">
          🛠️ Developer Menu
        </Text>

        <Button mode="contained" onPress={() => router.push("/dev/design-system")} icon="palette">
          <Text>Design System Preview</Text>
        </Button>

        <Button mode="outlined" onPress={() => router.back()}>
          <Text>Back</Text>
        </Button>
      </View>
    </BaseLayout>
  );
}
