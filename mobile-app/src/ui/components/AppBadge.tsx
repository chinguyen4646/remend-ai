/**
 * AppBadge Component
 *
 * Wrapper around React Native Paper's Chip with semantic color variants
 *
 * Variants: success, warning, error, info, neutral
 * Compact, pill-shaped status indicators
 */

import React from "react";
import { Chip, ChipProps } from "react-native-paper";
import { ViewStyle, TextStyle } from "react-native";
import { theme } from "../theme";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface AppBadgeProps extends Omit<ChipProps, "mode"> {
  children: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export default function AppBadge({
  children,
  variant = "neutral",
  style,
  ...paperProps
}: AppBadgeProps) {
  const getVariantStyles = (): { backgroundColor: string; textColor: string } => {
    switch (variant) {
      case "success":
        return {
          backgroundColor: theme.colors.semantic.successBg,
          textColor: theme.colors.success[800],
        };
      case "warning":
        return {
          backgroundColor: theme.colors.semantic.warningBg,
          textColor: theme.colors.warning[800],
        };
      case "error":
        return {
          backgroundColor: theme.colors.semantic.errorBg,
          textColor: theme.colors.error[800],
        };
      case "info":
        return {
          backgroundColor: theme.colors.semantic.infoBg,
          textColor: theme.colors.info[800],
        };
      case "neutral":
      default:
        return {
          backgroundColor: theme.colors.semantic.neutralBg,
          textColor: theme.colors.primary[800],
        };
    }
  };

  const variantStyles = getVariantStyles();

  const chipStyle: ViewStyle = {
    backgroundColor: variantStyles.backgroundColor,
    height: 24,
  };

  const textStyle: TextStyle = {
    fontSize: theme.typography.fontSize.labelSmall,
    fontWeight: theme.typography.fontWeight.semibold,
    color: variantStyles.textColor,
    marginVertical: 0,
    marginHorizontal: 0,
  };

  return (
    <Chip {...paperProps} mode="flat" compact style={[chipStyle, style]} textStyle={textStyle}>
      {children}
    </Chip>
  );
}
