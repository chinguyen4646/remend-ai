import { useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Button, TextInput, Snackbar } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useRehabProgramStore } from "../../src/stores/rehabProgramStore";
import { useRehabLogStore } from "../../src/stores/rehabLogStore";
import BaseLayout from "../../src/components/BaseLayout";

export default function LogFormScreen() {
  const router = useRouter();
  const { activeProgram } = useRehabProgramStore();
  const { createLog, isLoading, error, clearError } = useRehabLogStore();

  // Form state
  const [pain, setPain] = useState(0);
  const [stiffness, setStiffness] = useState(0);
  const [swelling, setSwelling] = useState(0);
  const [activityLevel, setActivityLevel] = useState<
    "rest" | "light" | "moderate" | "heavy" | null
  >(null);
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!activeProgram) return;

    try {
      await createLog({
        programId: activeProgram.id,
        pain,
        stiffness,
        swelling,
        activityLevel: activityLevel || undefined,
        notes: notes.trim() || undefined,
      });
      // Success! Go back to home
      router.back();
    } catch (err) {
      // Error is handled by store and shown in Snackbar
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!activeProgram) {
    return (
      <BaseLayout centered>
        <Text>No active program found</Text>
      </BaseLayout>
    );
  }

  const formatSide = (side: string) => {
    if (side === "both") return "Both";
    if (side === "na") return "";
    return side.charAt(0).toUpperCase() + side.slice(1);
  };

  const title =
    `Log today for your ${formatSide(activeProgram.side)} ${activeProgram.area.replace("_", " ")}`.trim();

  return (
    <BaseLayout scrollable keyboardAvoiding>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text variant="headlineMedium" className="font-bold mb-2">
            {title}
          </Text>
          <Text variant="bodyLarge" className="text-gray-600">
            How are you feeling today?
          </Text>
        </View>

        {/* Pain Slider */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text variant="titleMedium">Pain</Text>
            <Text variant="titleLarge" className="font-bold text-indigo-600">
              {pain}
            </Text>
          </View>
          <Slider
            value={pain}
            onValueChange={setPain}
            minimumValue={0}
            maximumValue={10}
            step={1}
            minimumTrackTintColor="#6366f1"
            maximumTrackTintColor="#e5e7eb"
            thumbTintColor="#6366f1"
            disabled={isLoading}
          />
          <View className="flex-row justify-between">
            <Text variant="bodySmall" className="text-gray-500">
              No pain
            </Text>
            <Text variant="bodySmall" className="text-gray-500">
              Severe
            </Text>
          </View>
        </View>

        {/* Stiffness Slider */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text variant="titleMedium">Stiffness</Text>
            <Text variant="titleLarge" className="font-bold text-indigo-600">
              {stiffness}
            </Text>
          </View>
          <Slider
            value={stiffness}
            onValueChange={setStiffness}
            minimumValue={0}
            maximumValue={10}
            step={1}
            minimumTrackTintColor="#6366f1"
            maximumTrackTintColor="#e5e7eb"
            thumbTintColor="#6366f1"
            disabled={isLoading}
          />
          <View className="flex-row justify-between">
            <Text variant="bodySmall" className="text-gray-500">
              No stiffness
            </Text>
            <Text variant="bodySmall" className="text-gray-500">
              Very stiff
            </Text>
          </View>
        </View>

        {/* Swelling Slider */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text variant="titleMedium">Swelling</Text>
            <Text variant="titleLarge" className="font-bold text-indigo-600">
              {swelling}
            </Text>
          </View>
          <Slider
            value={swelling}
            onValueChange={setSwelling}
            minimumValue={0}
            maximumValue={10}
            step={1}
            minimumTrackTintColor="#6366f1"
            maximumTrackTintColor="#e5e7eb"
            thumbTintColor="#6366f1"
            disabled={isLoading}
          />
          <View className="flex-row justify-between">
            <Text variant="bodySmall" className="text-gray-500">
              No swelling
            </Text>
            <Text variant="bodySmall" className="text-gray-500">
              Severe
            </Text>
          </View>
        </View>

        {/* Activity Level */}
        <View className="mb-6">
          <Text variant="titleMedium" className="mb-3">
            Activity Level (Optional)
          </Text>
          <View className="flex-row gap-2 flex-wrap">
            <Button
              mode={activityLevel === "rest" ? "contained" : "outlined"}
              onPress={() => setActivityLevel("rest")}
              disabled={isLoading}
              compact
            >
              <Text>Rest</Text>
            </Button>
            <Button
              mode={activityLevel === "light" ? "contained" : "outlined"}
              onPress={() => setActivityLevel("light")}
              disabled={isLoading}
              compact
            >
              <Text>Light</Text>
            </Button>
            <Button
              mode={activityLevel === "moderate" ? "contained" : "outlined"}
              onPress={() => setActivityLevel("moderate")}
              disabled={isLoading}
              compact
            >
              <Text>Moderate</Text>
            </Button>
            <Button
              mode={activityLevel === "heavy" ? "contained" : "outlined"}
              onPress={() => setActivityLevel("heavy")}
              disabled={isLoading}
              compact
            >
              <Text>Heavy</Text>
            </Button>
          </View>
        </View>

        {/* Notes */}
        <View className="mb-6">
          <Text variant="titleMedium" className="mb-2">
            Notes (Optional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={4}
            placeholder="Any additional observations..."
            disabled={isLoading}
          />
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mb-4">
          <Button mode="contained" onPress={handleSave} loading={isLoading} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Today's Log"}
          </Button>

          <Button mode="outlined" onPress={handleCancel} disabled={isLoading}>
            <Text>Cancel</Text>
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={clearError}
        duration={4000}
        action={{
          label: "Dismiss",
          onPress: clearError,
        }}
      >
        {error}
      </Snackbar>
    </BaseLayout>
  );
}
