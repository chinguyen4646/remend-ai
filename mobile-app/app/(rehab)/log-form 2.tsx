import { useState, useRef } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text, Button, TextInput, Snackbar } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useRehabProgramStore } from "../../src/stores/rehabProgramStore";
import { useRehabLogStore } from "../../src/stores/rehabLogStore";
import BaseLayout from "../../src/components/BaseLayout";
import { useVoiceProvider } from "../../src/hooks/useVoiceProvider";

export default function LogFormScreen() {
  const router = useRouter();
  const { activeProgram } = useRehabProgramStore();
  const { createLog, isLoading, error, clearError } = useRehabLogStore();

  // Voice provider with automatic fallback
  const {
    startRecording: startVoiceRecording,
    stopRecording: stopVoiceRecording,
    isRecording,
    isInitializing: voiceInitializing,
    error: voiceError,
  } = useVoiceProvider();

  // Form state
  const [pain, setPain] = useState(0);
  const [stiffness, setStiffness] = useState(0);
  const [swelling, setSwelling] = useState(0);
  const [activityLevel, setActivityLevel] = useState<
    "rest" | "light" | "moderate" | "heavy" | null
  >(null);
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState<string | null>(null);
  const [aggravators, setAggravators] = useState<string[]>([]);

  // Use ref to save notes before recording
  const notesBeforeRecordingRef = useRef("");

  const startRecording = async () => {
    try {
      // Save current notes before starting
      notesBeforeRecordingRef.current = notes;
      await startVoiceRecording();
    } catch (error) {
      console.error("Start recording error:", error);
    }
  };

  const stopRecording = async () => {
    try {
      console.log("[log-form] Calling stopVoiceRecording...");
      const transcription = await stopVoiceRecording();
      console.log("[log-form] Transcription received:", {
        length: transcription.length,
        content: transcription,
      });

      // Combine with notes that existed before recording
      const combinedText = notesBeforeRecordingRef.current
        ? `${notesBeforeRecordingRef.current} ${transcription}`
        : transcription;

      console.log("[log-form] Combined text:", {
        previousNotes: notesBeforeRecordingRef.current,
        transcription,
        combined: combinedText,
      });

      setNotes(combinedText);
      console.log("[log-form] setNotes called with:", combinedText);

      if (notesError) setNotesError(null);
    } catch (error) {
      console.error("[log-form] Stop recording error:", error);
    }
  };

  // Validation helpers
  const trimmedNotesLength = notes.trim().length;
  const isNotesValid = trimmedNotesLength >= 10 && trimmedNotesLength <= 1000;

  // Character counter color
  const getCounterColor = () => {
    if (notes.length > 1000) return "#dc2626"; // red
    if (notes.length > 800) return "#f59e0b"; // orange
    return "#9ca3af"; // gray
  };

  const validateNotes = () => {
    if (trimmedNotesLength < 10) {
      setNotesError("Please add at least 10 characters.");
      return false;
    }
    if (trimmedNotesLength > 1000) {
      setNotesError("Notes cannot exceed 1000 characters.");
      return false;
    }
    setNotesError(null);
    return true;
  };

  const handleSave = async () => {
    if (!activeProgram) return;

    // Validate notes before saving
    if (!validateNotes()) return;

    try {
      const plan = await createLog({
        programId: activeProgram.id,
        pain,
        stiffness,
        swelling,
        activityLevel: activityLevel || undefined,
        notes: notes.trim(),
        aggravators: aggravators.length > 0 ? aggravators : undefined,
      });

      // Navigate to plan-created screen if plan was generated
      if (plan && activeProgram) {
        router.replace(`/(rehab)/plan-created?planId=${plan.id}&programId=${activeProgram.id}`);
      } else {
        // Fallback: go back to home
        router.back();
      }
    } catch (err) {
      // Error is handled by store and shown in Snackbar
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const toggleAggravator = (aggravator: string) => {
    setAggravators((prev) =>
      prev.includes(aggravator) ? prev.filter((a) => a !== aggravator) : [...prev, aggravator],
    );
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
          <View className="flex-row items-center justify-between mb-2">
            <Text variant="titleMedium">Notes</Text>
            {/* Mic Button */}
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isLoading || voiceInitializing}
              className={`flex-row items-center px-3 py-2 rounded-full ${
                isRecording ? "bg-red-500" : voiceInitializing ? "bg-gray-400" : "bg-indigo-600"
              }`}
              style={{ opacity: voiceInitializing ? 0.6 : 1 }}
            >
              <Text className="text-white text-sm mr-1">
                {voiceInitializing ? "Setting up..." : isRecording ? "⏹ Stop" : "🎤 Record"}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Recording Indicator */}
          {isRecording && (
            <View className="mb-2 bg-red-50 px-3 py-2 rounded">
              <Text variant="bodySmall" className="text-red-600">
                🔴 Listening... Speak now
              </Text>
            </View>
          )}
          {/* Voice Initialization/Download Progress */}
          {voiceInitializing && (
            <View className="mb-2 bg-blue-50 px-3 py-2 rounded">
              <Text variant="bodySmall" className="text-blue-700">
                Setting up speech recognition...
              </Text>
            </View>
          )}
          {voiceInitializing && (
            <View className="mb-2 bg-blue-50 px-3 py-2 rounded">
              <Text variant="bodySmall" className="text-blue-700">
                Preparing speech recognition...
              </Text>
            </View>
          )}
          {/* Voice Error */}
          {voiceError && (
            <View className="mb-2 bg-yellow-50 px-3 py-2 rounded">
              <Text variant="bodySmall" className="text-yellow-700">
                {voiceError}
              </Text>
            </View>
          )}
          {/* Helper Text */}
          <Text variant="bodySmall" className="text-gray-600 mb-2">
            Tell us what happened today (e.g., activity, sensations, limits).
          </Text>
          <View className="relative">
            <TextInput
              value={notes}
              onChangeText={(text) => {
                setNotes(text);
                // Clear error when user starts typing
                if (notesError) setNotesError(null);
              }}
              onBlur={validateNotes}
              mode="outlined"
              multiline
              numberOfLines={6}
              placeholder="Tap here to type or use your keyboard mic..."
              disabled={isLoading}
              error={!!notesError}
            />
            {/* Character Counter Overlay */}
            <View className="absolute top-2 right-2 bg-white px-2 py-1 rounded">
              <Text variant="bodySmall" style={{ color: getCounterColor() }}>
                {notes.length}/1000
              </Text>
            </View>
          </View>
          {/* Privacy Notice */}
          <Text variant="bodySmall" className="text-gray-500 mt-1">
            Voice is transcribed on your device; audio is not uploaded or stored.
          </Text>
          {/* Error Message */}
          {notesError && (
            <Text variant="bodySmall" className="text-red-600 mt-1">
              {notesError}
            </Text>
          )}
        </View>

        {/* Aggravators */}
        <View className="mb-6">
          <Text variant="titleMedium" className="mb-2">
            What makes it worse? (Optional)
          </Text>
          <Text variant="bodySmall" className="text-gray-600 mb-3">
            Tap activities that aggravate your symptoms
          </Text>
          <View className="flex-row gap-2 flex-wrap">
            {["Stairs", "Squatting", "Running", "Jumping", "Kneeling", "Standing", "Walking"].map(
              (item) => (
                <Button
                  key={item}
                  mode={aggravators.includes(item.toLowerCase()) ? "contained" : "outlined"}
                  onPress={() => toggleAggravator(item.toLowerCase())}
                  disabled={isLoading}
                  compact
                >
                  <Text>{item}</Text>
                </Button>
              ),
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mb-4">
          <Button
            mode="contained"
            onPress={handleSave}
            loading={isLoading}
            disabled={isLoading || !isNotesValid}
          >
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
