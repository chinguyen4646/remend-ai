/**
 * AppProgressBar Component
 *
 * Wrapper around React Native Paper's ProgressBar with optional label
 *
 * Features:
 * - Progress value (0-100)
 * - Optional label above the bar
 * - Custom colors
 */

import React from "react";
import { View, ViewStyle } from "react-native";
import { ProgressBar, Text } from "react-native-paper";
import { theme } from "../theme";

interface AppProgressBarProps {
  /** Progress value (0-100) */
  value: number;
  /** Optional label above the bar */
  label?: string;
  /** Progress bar color */
  color?: string;
  /** Background color (not supported by Paper's ProgressBar, but kept for API compatibility) */
  backgroundColor?: string;
  /** Bar height (not directly supported, but kept for API compatibility) */
  height?: number;
  style?: ViewStyle;
}

export default function AppProgressBar({
  value,
  label,
  color = theme.colors.primary[600],
  style,
}: AppProgressBarProps) {
  // Convert 0-100 to 0-1 for Paper's ProgressBar
  const progress = Math.max(0, Math.min(100, value)) / 100;

  return (
    <View style={style}>
      {label && (
        <Text
          variant="bodySmall"
          style={{
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing[1.5],
          }}
        >
          {label}
        </Text>
      )}
      <ProgressBar progress={progress} color={color} style={{ borderRadius: theme.radius.full }} />
    </View>
  );
}
