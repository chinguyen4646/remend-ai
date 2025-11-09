/**
 * AppDivider Component
 *
 * Wrapper around React Native Paper's Divider with optional label
 *
 * Features:
 * - Simple horizontal divider
 * - Optional centered label (custom feature not in Paper)
 */

import React from "react";
import { View, ViewStyle } from "react-native";
import { Divider, Text } from "react-native-paper";
import { theme } from "../theme";

interface AppDividerProps {
  label?: string;
  style?: ViewStyle;
}

export default function AppDivider({ label, style }: AppDividerProps) {
  if (label) {
    // Custom labeled divider (Paper doesn't support this natively)
    return (
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            marginVertical: theme.spacing[4],
          },
          style,
        ]}
      >
        <View style={{ flex: 1 }}>
          <Divider />
        </View>
        <Text
          variant="labelMedium"
          style={{
            color: theme.colors.text.tertiary,
            marginHorizontal: theme.spacing[3],
          }}
        >
          {label}
        </Text>
        <View style={{ flex: 1 }}>
          <Divider />
        </View>
      </View>
    );
  }

  // Simple divider
  return (
    <Divider
      style={[
        {
          marginVertical: theme.spacing[4],
        },
        style,
      ]}
    />
  );
}
