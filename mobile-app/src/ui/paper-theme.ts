/**
 * React Native Paper Theme Configuration
 *
 * Maps design system tokens to Paper's theming system
 * Ensures consistent styling across Paper components (Button, Card, Text, etc.)
 */

import { MD3LightTheme } from "react-native-paper";
import { theme } from "./theme";

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Primary color (indigo)
    primary: theme.colors.primary[600],
    primaryContainer: theme.colors.primary[100],
    onPrimary: theme.colors.white,
    onPrimaryContainer: theme.colors.primary[900],

    // Secondary color (teal)
    secondary: theme.colors.secondary[500],
    secondaryContainer: theme.colors.secondary[100],
    onSecondary: theme.colors.white,
    onSecondaryContainer: theme.colors.secondary[900],

    // Tertiary (success green)
    tertiary: theme.colors.success[600],
    tertiaryContainer: theme.colors.success[100],
    onTertiary: theme.colors.white,
    onTertiaryContainer: theme.colors.success[900],

    // Error
    error: theme.colors.error[500],
    errorContainer: theme.colors.error[100],
    onError: theme.colors.white,
    onErrorContainer: theme.colors.error[900],

    // Background & Surface
    background: theme.colors.background,
    onBackground: theme.colors.text.primary,
    surface: theme.colors.surface,
    onSurface: theme.colors.text.primary,
    surfaceVariant: theme.colors.neutral[100],
    onSurfaceVariant: theme.colors.text.secondary,

    // Outline
    outline: theme.colors.neutral[300],
    outlineVariant: theme.colors.neutral[200],

    // Surface tints
    surfaceDisabled: theme.colors.neutral[200],
    onSurfaceDisabled: theme.colors.text.disabled,

    // Inverse (for dark elements on light backgrounds)
    inverseSurface: theme.colors.neutral[800],
    inverseOnSurface: theme.colors.white,
    inversePrimary: theme.colors.primary[300],

    // Shadow
    shadow: theme.colors.black,
    scrim: theme.colors.black,

    // Backdrop
    backdrop: `rgba(0, 0, 0, ${theme.opacity.overlay})`,

    // Elevation
    elevation: {
      level0: "transparent",
      level1: theme.colors.surface,
      level2: theme.colors.surface,
      level3: theme.colors.surface,
      level4: theme.colors.surface,
      level5: theme.colors.surface,
    },
  },
  fonts: {
    // Regular weight
    regular: {
      fontFamily: theme.typography.fontFamily.regular,
      fontWeight: theme.typography.fontWeight.regular,
    },
    // Medium weight
    medium: {
      fontFamily: theme.typography.fontFamily.medium,
      fontWeight: theme.typography.fontWeight.medium,
    },
    // Bold weight
    bold: {
      fontFamily: theme.typography.fontFamily.bold,
      fontWeight: theme.typography.fontWeight.bold,
    },
  },
  roundness: theme.radius.md, // Default roundness for Paper components
} as const;

/**
 * Typography variants for Paper's Text component
 * Maps to design system typography scale
 *
 * Usage:
 * <Text variant="headlineSmall">Heading</Text>
 * <Text variant="bodyMedium">Body text</Text>
 */
export const paperTypography = {
  // Display (largest text)
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    fontWeight: theme.typography.fontWeight.regular,
  },
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    fontWeight: theme.typography.fontWeight.regular,
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: theme.typography.fontWeight.regular,
  },

  // Headline (large headers)
  headlineLarge: {
    fontSize: theme.typography.fontSize.headlineLarge,
    lineHeight: theme.typography.fontSize.headlineLarge * theme.typography.lineHeight.normal,
    fontWeight: theme.typography.fontWeight.bold,
  },
  headlineMedium: {
    fontSize: theme.typography.fontSize.headlineMedium,
    lineHeight: theme.typography.fontSize.headlineMedium * theme.typography.lineHeight.normal,
    fontWeight: theme.typography.fontWeight.bold,
  },
  headlineSmall: {
    fontSize: theme.typography.fontSize.headlineSmall,
    lineHeight: theme.typography.fontSize.headlineSmall * theme.typography.lineHeight.normal,
    fontWeight: theme.typography.fontWeight.bold,
  },

  // Title (section headers)
  titleLarge: {
    fontSize: theme.typography.fontSize.titleLarge,
    lineHeight: theme.typography.fontSize.titleLarge * theme.typography.lineHeight.normal,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  titleMedium: {
    fontSize: theme.typography.fontSize.titleMedium,
    lineHeight: theme.typography.fontSize.titleMedium * theme.typography.lineHeight.normal,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  titleSmall: {
    fontSize: theme.typography.fontSize.titleSmall,
    lineHeight: theme.typography.fontSize.titleSmall * theme.typography.lineHeight.normal,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  // Body (main content)
  bodyLarge: {
    fontSize: theme.typography.fontSize.bodyLarge,
    lineHeight: theme.typography.fontSize.bodyLarge * theme.typography.lineHeight.relaxed,
    fontWeight: theme.typography.fontWeight.regular,
  },
  bodyMedium: {
    fontSize: theme.typography.fontSize.bodyMedium,
    lineHeight: theme.typography.fontSize.bodyMedium * theme.typography.lineHeight.relaxed,
    fontWeight: theme.typography.fontWeight.regular,
  },
  bodySmall: {
    fontSize: theme.typography.fontSize.bodySmall,
    lineHeight: theme.typography.fontSize.bodySmall * theme.typography.lineHeight.relaxed,
    fontWeight: theme.typography.fontWeight.regular,
  },

  // Label (small text, captions)
  labelLarge: {
    fontSize: theme.typography.fontSize.labelLarge,
    lineHeight: theme.typography.fontSize.labelLarge * theme.typography.lineHeight.tight,
    fontWeight: theme.typography.fontWeight.medium,
  },
  labelMedium: {
    fontSize: theme.typography.fontSize.labelMedium,
    lineHeight: theme.typography.fontSize.labelMedium * theme.typography.lineHeight.tight,
    fontWeight: theme.typography.fontWeight.medium,
  },
  labelSmall: {
    fontSize: theme.typography.fontSize.labelSmall,
    lineHeight: theme.typography.fontSize.labelSmall * theme.typography.lineHeight.tight,
    fontWeight: theme.typography.fontWeight.medium,
  },
} as const;

export default paperTheme;
