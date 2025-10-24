import { useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Button, Chip, TextInput } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "../../src/stores/onboardingStore";
import BaseLayout from "../../src/components/BaseLayout";
import type { Area, Onset, Timing, ActivityLevel } from "../../src/types/onboarding";

export default function BaselineScreen() {
  const router = useRouter();
  const { setBaselineData } = useOnboardingStore();

  // Form state
  const [area, setArea] = useState<Area | null>(null);
  const [areaOtherLabel, setAreaOtherLabel] = useState("");
  const [onset, setOnset] = useState<Onset | null>(null);
  const [painRest, setPainRest] = useState(0);
  const [painActivity, setPainActivity] = useState(0);
  const [stiffness, setStiffness] = useState(0);
  const [timing, setTiming] = useState<Timing[]>([]);
  const [aggravators, setAggravators] = useState("");
  const [easers, setEasers] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);

  const handleContinue = () => {
    // Validate required fields
    if (!area || !onset || !activityLevel) {
      return;
    }

    // Save to store
    setBaselineData({
      area,
      areaOtherLabel: area === "other" ? areaOtherLabel : undefined,
      onset,
      painRest,
      painActivity,
      stiffness,
      timing,
      aggravators: aggravators
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      easers: easers
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      activityLevel,
    });

    // Navigate to goal screen
    router.push("/(onboarding)/goal");
  };

  const toggleTiming = (value: Timing) => {
    setTiming((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value],
    );
  };

  const canContinue = area && onset && activityLevel;

  return (
    <BaseLayout scrollable keyboardAvoiding>
      <View className="mb-6">
        <Text variant="headlineMedium" className="font-bold">
          Tell us about your body
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Area */}
        <View className="mb-6">
          <Text variant="titleMedium" className="mb-2">
            What area needs attention?
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {(
              ["knee", "shoulder", "back", "hip", "ankle", "wrist", "elbow", "other"] as Area[]
            ).map((value) => (
              <Chip
                key={value}
                selected={area === value}
                onPress={() => setArea(value)}
                mode={area === value ? "flat" : "outlined"}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Chip>
            ))}
          </View>
          {area === "other" && (
            <TextInput
              value={areaOtherLabel}
              onChangeText={setAreaOtherLabel}
              mode="outlined"
              placeholder="Specify area"
              className="mt-2"
            />
          )}
        </View>

        {/* Onset */}
        <View className="mb-6">
          <Text variant="titleMedium" className="mb-2">
            When did this start?
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Chip
              selected={onset === "recent"}
              onPress={() => setOnset("recent")}
              mode={onset === "recent" ? "flat" : "outlined"}
            >
              <Text>Recent (&gt;4 weeks)</Text>
            </Chip>
            <Chip
              selected={onset === "ongoing"}
              onPress={() => setOnset("ongoing")}
              mode={onset === "ongoing" ? "flat" : "outlined"}
            >
              <Text>Ongoing (1-6 months)</Text>
            </Chip>
            <Chip
              selected={onset === "chronic"}
              onPress={() => setOnset("chronic")}
              mode={onset === "chronic" ? "flat" : "outlined"}
            >
              <Text>Chronic (&gt;6 months)</Text>
            </Chip>
          </View>
        </View>

        {/* Pain at Rest */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-1">
              <Text variant="titleMedium">Pain at rest</Text>
              <Text variant="bodySmall" className="text-gray-600">
                Right now, when you&apos;re not moving
              </Text>
            </View>
            <Text variant="titleLarge" className="font-bold text-indigo-600">
              {painRest}/10
            </Text>
          </View>
          <Slider
            value={painRest}
            onValueChange={setPainRest}
            minimumValue={0}
            maximumValue={10}
            step={1}
            minimumTrackTintColor="#6366f1"
            maximumTrackTintColor="#e5e7eb"
            thumbTintColor="#6366f1"
          />
          <View className="flex-row justify-between">
            <Text variant="bodySmall" className="text-gray-500">
              No pain
            </Text>
            <Text variant="bodySmall" className="text-gray-500">
              Worst pain
            </Text>
          </View>
        </View>

        {/* Pain During Activity */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-1">
              <Text variant="titleMedium">Pain during activity</Text>
              <Text variant="bodySmall" className="text-gray-600">
                When you&apos;re moving or active
              </Text>
            </View>
            <Text variant="titleLarge" className="font-bold text-indigo-600">
              {painActivity}/10
            </Text>
          </View>
          <Slider
            value={painActivity}
            onValueChange={setPainActivity}
            minimumValue={0}
            maximumValue={10}
            step={1}
            minimumTrackTintColor="#6366f1"
            maximumTrackTintColor="#e5e7eb"
            thumbTintColor="#6366f1"
          />
          <View className="flex-row justify-between">
            <Text variant="bodySmall" className="text-gray-500">
              No pain
            </Text>
            <Text variant="bodySmall" className="text-gray-500">
              Worst pain
            </Text>
          </View>
        </View>

        {/* Stiffness */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-1">
              <Text variant="titleMedium">Stiffness</Text>
              <Text variant="bodySmall" className="text-gray-600">
                How stiff or tight does it feel?
              </Text>
            </View>
            <Text variant="titleLarge" className="font-bold text-indigo-600">
              {stiffness}/10
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
          />
          <View className="flex-row justify-between">
            <Text variant="bodySmall" className="text-gray-500">
              Not stiff
            </Text>
            <Text variant="bodySmall" className="text-gray-500">
              Very stiff
            </Text>
          </View>
        </View>

        {/* Timing */}
        <View className="mb-6">
          <Text variant="titleMedium" className="mb-2">
            When does it bother you?
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {(["before", "during", "after"] as Timing[]).map((value) => (
              <Chip
                key={value}
                selected={timing.includes(value)}
                onPress={() => toggleTiming(value)}
                mode={timing.includes(value) ? "flat" : "outlined"}
              >
                <Text>{value.charAt(0).toUpperCase() + value.slice(1)} activity</Text>
              </Chip>
            ))}
          </View>
        </View>

        {/* Activity Level */}
        <View className="mb-6">
          <Text variant="titleMedium" className="mb-2">
            Your typical activity level
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {(["low", "moderate", "high"] as ActivityLevel[]).map((value) => (
              <Chip
                key={value}
                selected={activityLevel === value}
                onPress={() => setActivityLevel(value)}
                mode={activityLevel === value ? "flat" : "outlined"}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Chip>
            ))}
          </View>
        </View>

        {/* Aggravators */}
        <View className="mb-6">
          <Text variant="titleMedium" className="mb-2">
            What makes it worse? (comma-separated)
          </Text>
          <TextInput
            value={aggravators}
            onChangeText={setAggravators}
            mode="outlined"
            placeholder="e.g., stairs, sitting, bending"
            multiline
          />
        </View>

        {/* Easers */}
        <View className="mb-6">
          <Text variant="titleMedium" className="mb-2">
            What helps? (comma-separated)
          </Text>
          <TextInput
            value={easers}
            onChangeText={setEasers}
            mode="outlined"
            placeholder="e.g., rest, heat, stretching"
            multiline
          />
        </View>

        {/* Continue Button */}
        <Button mode="contained" onPress={handleContinue} disabled={!canContinue} className="mb-4">
          <Text>Continue</Text>
        </Button>

        <Text variant="bodySmall" className="text-center text-gray-500 mb-4">
          This information helps us personalize your experience
        </Text>
      </ScrollView>
    </BaseLayout>
  );
}
