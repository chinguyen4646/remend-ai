/**
 * AppButton Component
 *
 * Wrapper around React Native Paper's Button with design system theming
 *
 * Variants:
 * - Primary: Filled with primary color
 * - Secondary: Filled with secondary color
 * - Outline: Border with transparent background
 * - Text: No background, text only
 *
 * Features:
 * - Loading state with spinner
 * - Disabled state
 * - Custom sizing (small, medium, large)
 * - Icon support (left/right)
 * - Material Design 3 compliant
 */

import React from "react";
import { Button, ButtonProps, Text } from "react-native-paper";
import { theme } from "../theme";

type ButtonVariant = "primary" | "secondary" | "outlined" | "text" | "contained" | "elevated";
type ButtonSize = "small" | "medium" | "large";

interface AppButtonProps extends Omit<ButtonProps, "mode" | "children"> {
  /** Button text */
  children: React.ReactNode;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Icon component (left side) */
  iconLeft?: string;
  /** Icon component (right side) */
  iconRight?: string;
}

export default function AppButton({
  children,
  variant = "primary",
  size = "medium",
  iconLeft,
  iconRight,
  ...paperProps
}: AppButtonProps) {
  // Map variant to Paper's mode
  const getMode = (): ButtonProps["mode"] => {
    if (variant === "outlined") return "outlined";
    if (variant === "text") return "text";
    return "contained"; // primary and secondary use contained mode
  };

  // Get button color based on variant
  const getButtonColor = (): string => {
    if (variant === "secondary") return theme.colors.secondary[500];
    return theme.colors.primary[600]; // primary, outline, text
  };

  // Get text color based on variant
  const getTextColor = (): string | undefined => {
    if (variant === "primary") return theme.colors.white;
    if (variant === "secondary") return theme.colors.white;
    if (variant === "outlined") return theme.colors.primary[600];
    if (variant === "text") return theme.colors.primary[600];
    return undefined;
  };

  // Get size-specific height
  const getContentStyle = () => {
    if (size === "small") {
      return { height: 36, paddingHorizontal: theme.spacing[2] };
    } else if (size === "large") {
      return { height: 56, paddingHorizontal: theme.spacing[6] };
    }
    // medium (default)
    return { height: 44, paddingHorizontal: theme.spacing[4] };
  };

  // Determine icon placement
  const icon = iconLeft || iconRight;

  return (
    <Button
      {...paperProps}
      mode={getMode()}
      buttonColor={getButtonColor()}
      textColor={getTextColor()}
      contentStyle={getContentStyle()}
      icon={icon}
      labelStyle={{
        fontSize:
          size === "small"
            ? theme.typography.fontSize.bodySmall
            : theme.typography.fontSize.bodyMedium,
        fontWeight: theme.typography.fontWeight.semibold,
      }}
    >
      <Text>{children}</Text>
    </Button>
  );
}
