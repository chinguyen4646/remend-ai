import { useState, useRef, useEffect } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text, Button, TextInput, Checkbox, List } from "react-native-paper";
import { useRouter } from "expo-router";
import BaseLayout from "../../src/components/BaseLayout";
import { useOnboardingStore } from "../../src/stores/onboardingStore";
import { useVoiceProvider } from "../../src/hooks/useVoiceProvider";
import type { RedFlag } from "../../src/types/onboarding";

// Rotating placeholder examples
const PLACEHOLDER_EXAMPLES = [
  "My right knee hurts when going downstairs. It's been sore for weeks.",
  "Sharp pain in my left shoulder when I reach overhead, started after playing tennis.",
  "Lower back stiffness in the morning, gets better with movement.",
];

const RED_FLAGS: { value: RedFlag; label: string; description: string }[] = [
  {
    value: "night_pain",
    label: "Night pain",
    description: "Pain that wakes you up at night or prevents sleep",
  },
  {
    value: "numbness",
    label: "Numbness/tingling",
    description: "Loss of sensation or pins and needles",
  },
  {
    value: "trauma",
    label: "Recent trauma",
    description: "Significant fall, accident, or injury",
  },
  { value: "fever", label: "Fever", description: "Unexplained fever or feeling unwell" },
  {
    value: "locking",
    label: "Joint locking",
    description: "Joint gets stuck and won't move",
  },
];

export default function DescribeScreen() {
  const router = useRouter();
  const { setDescription } = useOnboardingStore();

  // Voice provider
  const {
    startRecording: startVoiceRecording,
    stopRecording: stopVoiceRecording,
    isRecording,
    isInitializing: voiceInitializing,
    error: voiceError,
    liveTranscript,
  } = useVoiceProvider();

  // State
  const [description, setDescriptionText] = useState("");
  const [selectedRedFlags, setSelectedRedFlags] = useState<RedFlag[]>([]);
  const [isStartingRecording, setIsStartingRecording] = useState(false);
  const [redFlagsExpanded, setRedFlagsExpanded] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Ref to save description before recording
  const descriptionBeforeRecordingRef = useRef("");

  // Rotate placeholder every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const startRecording = async () => {
    try {
      setIsStartingRecording(true);
      descriptionBeforeRecordingRef.current = description;
      await startVoiceRecording();
    } catch (error) {
      console.error("Start recording error:", error);
    } finally {
      setIsStartingRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      const transcription = await stopVoiceRecording();

      // Combine with description that existed before recording
      const combinedText = descriptionBeforeRecordingRef.current
        ? `${descriptionBeforeRecordingRef.current} ${transcription}`
        : transcription;

      setDescriptionText(combinedText);
    } catch (error) {
      console.error("Stop recording error:", error);
    }
  };

  const toggleRedFlag = (flag: RedFlag) => {
    setSelectedRedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag],
    );
  };

  const handleNext = () => {
    if (description.trim().length < 10) return;

    // Save to store
    setDescription(description.trim(), selectedRedFlags);

    // Navigate to duration-intensity screen
    router.push("/(onboarding)/duration-intensity");
  };

  const isNextDisabled = description.trim().length < 10;
  const charCount = description.length;
  const charCountColor = charCount > 2000 ? "#dc2626" : charCount > 1600 ? "#f59e0b" : "#9ca3af";

  return (
    <BaseLayout scrollable keyboardAvoiding>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text variant="headlineMedium" className="font-bold mb-2">
            Tell us what's going on
          </Text>
          <Text variant="bodyLarge" className="text-gray-600">
            You can talk or type — just describe what you're feeling
          </Text>
        </View>

        {/* Voice Recording Button */}
        <View className="mb-4 flex-row justify-between items-center">
          <Text variant="bodySmall" className="text-gray-600">
            Be specific about location, timing, and what makes it better or worse
          </Text>
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            disabled={voiceInitializing || isStartingRecording}
            className={`flex-row items-center px-3 py-2 rounded-full ${
              isRecording
                ? "bg-red-500"
                : voiceInitializing || isStartingRecording
                  ? "bg-gray-400"
                  : "bg-indigo-600"
            }`}
            style={{ opacity: voiceInitializing || isStartingRecording ? 0.6 : 1 }}
          >
            <Text className="text-white text-sm">
              {voiceInitializing
                ? "Setting up..."
                : isStartingRecording
                  ? "Starting..."
                  : isRecording
                    ? "⏹ Stop"
                    : "🎤 Record"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recording Indicator */}
        {isRecording && (
          <View className="mb-3 bg-red-50 px-3 py-2 rounded">
            <Text variant="bodySmall" className="text-red-600">
              🔴 Listening... Speak now
            </Text>
          </View>
        )}

        {/* Voice Initialization */}
        {voiceInitializing && (
          <View className="mb-3 bg-blue-50 px-3 py-2 rounded">
            <Text variant="bodySmall" className="text-blue-700">
              Preparing speech recognition...
            </Text>
          </View>
        )}

        {/* Voice Error */}
        {voiceError && (
          <View className="mb-3 bg-yellow-50 px-3 py-2 rounded">
            <Text variant="bodySmall" className="text-yellow-700">
              {voiceError}
            </Text>
          </View>
        )}

        {/* Text Input */}
        <View className="relative mb-4">
          <TextInput
            value={isRecording ? liveTranscript : description}
            onChangeText={(text) => {
              if (!isRecording) {
                setDescriptionText(text);
              }
            }}
            mode="outlined"
            multiline
            numberOfLines={8}
            placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
            disabled={isRecording}
            style={{ minHeight: 150 }}
          />
          {/* Character Counter */}
          <View className="absolute top-2 right-2 bg-white px-2 py-1 rounded">
            <Text variant="bodySmall" style={{ color: charCountColor }}>
              {charCount}/2000
            </Text>
          </View>
        </View>

        {/* Privacy Notice */}
        <Text variant="bodySmall" className="text-gray-500 mb-6">
          Voice is transcribed on your device; audio isn't uploaded or stored.
        </Text>

        {/* Red Flags Accordion */}
        <List.Accordion
          title="Safety Check (Optional)"
          description={
            selectedRedFlags.length > 0
              ? `${selectedRedFlags.length} flag${selectedRedFlags.length === 1 ? "" : "s"} selected`
              : "Help us ensure safe exercise recommendations"
          }
          expanded={redFlagsExpanded}
          onPress={() => setRedFlagsExpanded(!redFlagsExpanded)}
          className="bg-gray-50 rounded-lg mb-6"
          titleStyle={{ fontSize: 16, fontWeight: "600" }}
        >
          <View className="px-4 pb-2">
            <Text variant="bodySmall" className="text-gray-600 mb-3">
              Select any that apply:
            </Text>
            {RED_FLAGS.map((flag) => (
              <View key={flag.value} className="mb-2">
                <View className="flex-row items-center">
                  <Checkbox
                    status={selectedRedFlags.includes(flag.value) ? "checked" : "unchecked"}
                    onPress={() => toggleRedFlag(flag.value)}
                  />
                  <View className="flex-1">
                    <Text variant="bodyMedium" className="font-semibold">
                      {flag.label}
                    </Text>
                    <Text variant="bodySmall" className="text-gray-600">
                      {flag.description}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </List.Accordion>

        {/* Next Button */}
        <Button
          mode="contained"
          onPress={handleNext}
          disabled={isNextDisabled}
          contentStyle={{ paddingVertical: 8 }}
        >
          <Text>Next</Text>
        </Button>

        {isNextDisabled && description.length > 0 && description.length < 10 && (
          <Text variant="bodySmall" className="text-red-600 mt-2 text-center">
            Please add at least 10 characters
          </Text>
        )}
      </ScrollView>
    </BaseLayout>
  );
}
