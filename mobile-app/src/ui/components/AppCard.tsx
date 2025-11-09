/**
 * AppCard Component
 *
 * Wrapper around React Native Paper's Card with design system theming
 *
 * Variants: elevated (with shadow), flat (no shadow)
 * Features: optional title, subtitle, and footer
 */

import React from "react";
import { Card, CardProps } from "react-native-paper";
import { ViewStyle } from "react-native";
import { theme } from "../theme";

type CardVariant = "elevated" | "flat";

interface AppCardProps extends Omit<CardProps, "mode" | "elevation"> {
  children: React.ReactNode;
  variant?: CardVariant;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  style?: ViewStyle;
}

export default function AppCard({
  children,
  variant = "elevated",
  title,
  subtitle,
  footer,
  style,
  ...paperProps
}: AppCardProps) {
  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    ...(variant === "flat" && { elevation: 0 }),
  };

  return (
    <Card
      {...paperProps}
      mode={variant === "elevated" ? "elevated" : "contained"}
      elevation={variant === "elevated" ? 2 : 0}
      style={[cardStyle, style]}
    >
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
      <Card.Content>{children}</Card.Content>

      {/* Footer */}
      {footer && <Card.Actions>{footer}</Card.Actions>}
    </Card>
  );
}
