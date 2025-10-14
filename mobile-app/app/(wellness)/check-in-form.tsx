import { useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Button, TextInput, Snackbar } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useWellnessLogStore } from "../../src/stores/wellnessLogStore";
import BaseLayout from "../../src/components/BaseLayout";

export default function CheckInFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode: "maintenance" | "general" }>();
  const mode = params.mode;

  const { createLog, isLoading, error, clearError } = useWellnessLogStore();

  // Form state - all fields optional except mode
  const [pain, setPain] = useState<number | null>(null);
  const [stiffness, setStiffness] = useState<number | null>(null);
  const [tension, setTension] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [areaTag, setAreaTag] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!mode) return;

    try {
      await createLog({
        mode,
        pain: pain ?? undefined,
        stiffness: stiffness ?? undefined,
        tension: tension ?? undefined,
        energy: energy ?? undefined,
        areaTag: areaTag.trim() || undefined,
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

  if (!mode) {
    return (
      <BaseLayout centered>
        <Text>Invalid mode</Text>
      </BaseLayout>
    );
  }

  const modeLabel = mode === "maintenance" ? "Maintenance" : "General";

  return (
    <BaseLayout scrollable keyboardAvoiding>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text variant="headlineMedium" className="font-bold mb-2">
            {modeLabel} Check-In
          </Text>
          <Text variant="bodyLarge" className="text-gray-600">
            How are you feeling today? All fields are optional.
          </Text>
        </View>

        {/* Pain Slider */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text variant="titleMedium">Pain (Optional)</Text>
            <Text variant="titleLarge" className="font-bold text-indigo-600">
              {pain !== null ? pain : "-"}
            </Text>
          </View>
          <Slider
            value={pain ?? 0}
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
            <Text variant="titleMedium">Stiffness (Optional)</Text>
            <Text variant="titleLarge" className="font-bold text-indigo-600">
              {stiffness !== null ? stiffness : "-"}
            </Text>
          </View>
          <Slider
            value={stiffness ?? 0}
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

        {/* Tension Slider */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text variant="titleMedium">Tension (Optional)</Text>
            <Text variant="titleLarge" className="font-bold text-indigo-600">
              {tension !== null ? tension : "-"}
            </Text>
          </View>
          <Slider
            value={tension ?? 0}
            onValueChange={setTension}
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
              No tension
            </Text>
            <Text variant="bodySmall" className="text-gray-500">
              Very tense
            </Text>
          </View>
        </View>

        {/* Energy Slider */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text variant="titleMedium">Energy (Optional)</Text>
            <Text variant="titleLarge" className="font-bold text-indigo-600">
              {energy !== null ? energy : "-"}
            </Text>
          </View>
          <Slider
            value={energy ?? 0}
            onValueChange={setEnergy}
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
              Very low
            </Text>
            <Text variant="bodySmall" className="text-gray-500">
              Very high
            </Text>
          </View>
        </View>

        {/* Area Tag */}
        <View className="mb-6">
          <Text variant="titleMedium" className="mb-2">
            Area Tag (Optional)
          </Text>
          <TextInput
            value={areaTag}
            onChangeText={setAreaTag}
            mode="outlined"
            placeholder="e.g., Lower Back, Shoulders, Knees"
            disabled={isLoading}
          />
          <Text variant="bodySmall" className="text-gray-500 mt-1">
            Track specific body areas that need attention
          </Text>
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
            {isLoading ? "Saving..." : "Save Check-In"}
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
