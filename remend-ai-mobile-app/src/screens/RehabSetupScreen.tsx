import { useState } from "react";
import { View } from "react-native";
import { Text, Button, TextInput, Snackbar } from "react-native-paper";
import { useRehabProgramStore } from "../stores/rehabProgramStore";
import BaseLayout from "../components/BaseLayout";

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

const BODY_AREAS = [
  { value: "knee", label: "Knee" },
  { value: "shoulder", label: "Shoulder" },
  { value: "ankle", label: "Ankle" },
  { value: "hip", label: "Hip" },
  { value: "back_lower", label: "Lower Back" },
  { value: "back_upper", label: "Upper Back" },
  { value: "neck", label: "Neck" },
  { value: "elbow", label: "Elbow" },
  { value: "wrist", label: "Wrist" },
  { value: "hand", label: "Hand" },
  { value: "foot", label: "Foot" },
  { value: "achilles", label: "Achilles" },
  { value: "hamstring", label: "Hamstring" },
  { value: "quad", label: "Quad" },
  { value: "calf", label: "Calf" },
  { value: "groin", label: "Groin" },
  { value: "rotator_cuff", label: "Rotator Cuff" },
  { value: "acl", label: "ACL" },
  { value: "meniscus", label: "Meniscus" },
];

export default function RehabSetupScreen({ onComplete, onSkip }: Props) {
  const { createProgram, isLoading, error, clearError } = useRehabProgramStore();
  const [area, setArea] = useState("");
  const [side, setSide] = useState<"left" | "right" | "both" | "na" | null>(null);
  const [startDate] = useState(new Date().toISOString().split("T")[0]); // Today
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  const handleCreate = async () => {
    if (!area || !side) {
      return;
    }

    try {
      await createProgram({
        area,
        side,
        startDate,
      });
      onComplete();
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <BaseLayout keyboardAvoiding style={{ backgroundColor: "white" }}>
      <View className="mb-6 mt-4">
        <Text variant="headlineMedium" className="font-bold mb-2">
          Set your rehab focus
        </Text>
        <Text variant="bodyLarge" className="text-gray-600">
          Takes 20 seconds · You can change this later
        </Text>
      </View>

      <View className="gap-4">
        {/* Area Selection */}
        <View>
          <Text variant="labelLarge" className="mb-2">
            What area are you recovering?
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {BODY_AREAS.slice(0, 6).map((item) => (
              <Button
                key={item.value}
                mode={area === item.value ? "contained" : "outlined"}
                onPress={() => setArea(item.value)}
                disabled={isLoading}
                compact
              >
                {item.label}
              </Button>
            ))}
            <Button
              mode={showAreaDropdown ? "contained" : "outlined"}
              onPress={() => setShowAreaDropdown(!showAreaDropdown)}
              disabled={isLoading}
              compact
            >
              <Text>More...</Text>
            </Button>
          </View>
          {showAreaDropdown && (
            <View className="flex-row flex-wrap gap-2 mt-2">
              {BODY_AREAS.slice(6).map((item) => (
                <Button
                  key={item.value}
                  mode={area === item.value ? "contained" : "outlined"}
                  onPress={() => {
                    setArea(item.value);
                    setShowAreaDropdown(false);
                  }}
                  disabled={isLoading}
                  compact
                >
                  {item.label}
                </Button>
              ))}
            </View>
          )}
        </View>

        {/* Side Selection */}
        <View>
          <Text variant="labelLarge" className="mb-2">
            Which side?
          </Text>
          <View className="flex-row gap-2">
            <Button
              mode={side === "left" ? "contained" : "outlined"}
              onPress={() => setSide("left")}
              disabled={isLoading}
              className="flex-1"
            >
              <Text>Left</Text>
            </Button>
            <Button
              mode={side === "right" ? "contained" : "outlined"}
              onPress={() => setSide("right")}
              disabled={isLoading}
              className="flex-1"
            >
              <Text>Right</Text>
            </Button>
            <Button
              mode={side === "both" ? "contained" : "outlined"}
              onPress={() => setSide("both")}
              disabled={isLoading}
              className="flex-1"
            >
              <Text>Both</Text>
            </Button>
          </View>
          <Button
            mode={side === "na" ? "contained" : "outlined"}
            onPress={() => setSide("na")}
            disabled={isLoading}
            className="mt-2"
          >
            <Text>Not applicable</Text>
          </Button>
        </View>

        {/* Start Date (shown but not editable for now) */}
        <View>
          <Text variant="labelLarge" className="mb-2">
            Start date
          </Text>
          <TextInput value={startDate} mode="outlined" disabled placeholder="YYYY-MM-DD" />
          <Text variant="bodySmall" className="text-gray-600 mt-1">
            Defaulting to today
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="gap-3 mt-8">
        <Button
          mode="contained"
          onPress={handleCreate}
          loading={isLoading}
          disabled={isLoading || !area || !side}
        >
          <Text>Start Rehab</Text>
        </Button>

        <Button mode="text" onPress={onSkip} disabled={isLoading}>
          <Text>Skip for now</Text>
        </Button>
      </View>

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
