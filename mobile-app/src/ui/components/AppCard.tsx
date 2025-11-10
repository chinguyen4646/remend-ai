/**
 * AppCard Component
 *
 * Wrapper around React Native Paper's Card with design system theming
 *
 * Variants: elevated (with shadow), flat (no shadow), outlined
 * Features: optional title, subtitle, footer, left accent bar, custom padding, shadow control
 */

import React from "react";
import { Card, CardProps } from "react-native-paper";
import { View, ViewStyle } from "react-native";
import { theme } from "../theme";

type CardVariant = "elevated" | "flat" | "outlined";
type CardPadding = "sm" | "md" | "lg";

interface AppCardProps extends Omit<CardProps, "mode" | "elevation"> {
  children: React.ReactNode;
  variant?: CardVariant;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  style?: ViewStyle;
  /** 4px left accent bar color (e.g., for status indicators) */
  leftAccentColor?: string;
  /** Padding size variant */
  padding?: CardPadding;
  /** Override shadow (default: true for elevated, false for flat) */
  shadow?: boolean;
}

export default function AppCard({
  children,
  variant = "elevated",
  title,
  subtitle,
  footer,
  style,
  leftAccentColor,
  padding = "md",
  shadow,
  ...paperProps
}: AppCardProps) {
  // Determine shadow
  const shouldShowShadow = shadow !== undefined ? shadow : variant === "elevated";

  // Padding mapping
  const paddingMap: Record<CardPadding, number> = {
    sm: theme.spacing[3], // 12px
    md: theme.spacing[4], // 16px
    lg: theme.spacing[5], // 20px
  };

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl, // 16px
    ...(variant === "flat" && { elevation: 0 }),
    ...(variant === "outlined" && {
      borderWidth: 1,
      borderColor: theme.colors.neutral[200],
      elevation: 0,
    }),
    overflow: "hidden", // Ensures left accent bar clips correctly
  };

  // Left accent bar style
  const leftAccentStyle: ViewStyle | undefined = leftAccentColor
    ? {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: leftAccentColor,
        borderTopLeftRadius: theme.radius.xl,
        borderBottomLeftRadius: theme.radius.xl,
      }
    : undefined;

  return (
    <Card
      {...paperProps}
      mode={
        variant === "outlined" ? "contained" : variant === "elevated" ? "elevated" : "contained"
      }
      elevation={shouldShowShadow ? 2 : 0}
      style={[cardStyle, style]}
    >
      {/* Left accent bar */}
      {leftAccentStyle && <View style={leftAccentStyle} />}

      {/* Header */}
      {(title || subtitle) && (
        <Card.Title
          title={title}
          subtitle={subtitle}
          titleStyle={{ color: theme.colors.text.primary }}
          subtitleStyle={{ color: theme.colors.text.secondary }}
        />
      )}

      {/* Content */}
      <Card.Content
        style={{ paddingHorizontal: paddingMap[padding], paddingVertical: paddingMap[padding] }}
      >
        {children}
      </Card.Content>

      {/* Footer */}
      {footer && <Card.Actions>{footer}</Card.Actions>}
    </Card>
  );
}
