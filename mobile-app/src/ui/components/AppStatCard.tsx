/**
 * AppStatCard Component
 *
 * Display statistics/metrics with icon and optional trend indicator
 * Built with React Native Paper's Card and Text components
 *
 * Perfect for streaks, adherence rates, progress metrics
 */

import React from "react";
import { View, ViewStyle } from "react-native";
import { Card, Text } from "react-native-paper";
import { theme } from "../theme";

interface AppStatCardProps {
  /** Main stat value */
  value: string | number;
  /** Label below the value */
  label: string;
  /** Optional icon (emoji or component) */
  icon?: React.ReactNode;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional trend indicator (positive/negative/neutral) */
  trend?: "up" | "down" | "neutral";
  /** Trend value text (e.g., "+5%" or "-2 pts") */
  trendValue?: string;
  style?: ViewStyle;
}

export default function AppStatCard({
  value,
  label,
  icon,
  subtitle,
  trend,
  trendValue,
  style,
}: AppStatCardProps) {
  const getTrendColor = () => {
    if (trend === "up") return theme.colors.success[600];
    if (trend === "down") return theme.colors.error[600];
    return theme.colors.text.secondary;
  };

  const getTrendIcon = () => {
    if (trend === "up") return "↑";
    if (trend === "down") return "↓";
    return "→";
  };

  return (
    <Card mode="elevated" elevation={1} style={style}>
      <Card.Content>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Icon */}
          {icon && (
            <View
              style={{
                marginRight: theme.spacing[3],
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </View>
          )}

          {/* Content */}
          <View style={{ flex: 1 }}>
            <Text
              variant="headlineMedium"
              style={{
                color: theme.colors.text.primary,
                fontWeight: "700",
              }}
            >
              {value}
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.text.secondary,
                marginTop: theme.spacing[1],
              }}
            >
              {label}
            </Text>
            {subtitle && (
              <Text
                variant="bodySmall"
                style={{
                  color: theme.colors.text.tertiary,
                  marginTop: theme.spacing[0.5],
                }}
              >
                {subtitle}
              </Text>
            )}
            {trend && trendValue && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: theme.spacing[2],
                }}
              >
                <Text
                  variant="labelSmall"
                  style={{
                    color: getTrendColor(),
                    fontWeight: theme.typography.fontWeight.semibold,
                  }}
                >
                  {getTrendIcon()} {trendValue}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}
