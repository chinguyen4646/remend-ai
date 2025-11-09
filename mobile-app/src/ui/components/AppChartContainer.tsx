/**
 * AppChartContainer Component
 *
 * Specialized wrapper for charts with consistent styling
 * Built on top of AppCard for consistency
 */

import React from "react";
import { View, ViewStyle } from "react-native";
import { Card, Text } from "react-native-paper";
import { theme } from "../theme";

interface AppChartContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: ViewStyle;
}

export default function AppChartContainer({
  children,
  title,
  subtitle,
  style,
}: AppChartContainerProps) {
  return (
    <View style={style}>
      {/* Header */}
      {(title || subtitle) && (
        <View style={{ marginBottom: theme.spacing[3] }}>
          {title && (
            <Text variant="titleMedium" style={{ color: theme.colors.text.primary }}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.text.secondary,
                marginTop: theme.spacing[1],
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      )}

      {/* Chart Content */}
      {children}
    </View>
  );
}
