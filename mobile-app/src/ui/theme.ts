/**
 * Remend Design System v1 - Theme Tokens
 *
 * Central source of truth for:
 * - Colors (primary, secondary, semantic, neutral)
 * - Typography (sizes, weights, line heights mapped to Paper scale)
 * - Spacing (4px base scale)
 * - Border radius (rounded corners)
 * - Elevation (shadow system for depth)
 * - Opacity (transparency values)
 *
 * Tone: Calm, clinical, trustworthy — digital health + modern wellness
 */

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  // Primary: Indigo (trustworthy, clinical)
  primary: {
    50: "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#6366f1",
    600: "#4f46e5", // Main primary
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
  },

  // Secondary: Teal (wellness, calm)
  secondary: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6", // Main secondary
    600: "#0d9488",
    700: "#0f766e",
    800: "#115e59",
    900: "#134e4a",
  },

  // Success: Green (progress, positive)
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#10b981", // Main success
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },

  // Warning: Amber (caution, attention)
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b", // Main warning
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  // Error: Red (danger, critical)
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444", // Main error
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },

  // Info: Blue (informational)
  info: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9", // Main info
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },

  // Neutral: Gray scale
  neutral: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },

  // Semantic colors (light backgrounds for status cards)
  semantic: {
    successBg: "#d1fae5", // Light green
    warningBg: "#fef3c7", // Light amber
    errorBg: "#fee2e2", // Light red
    infoBg: "#f0f9ff", // Light blue
    neutralBg: "#e0e7ff", // Light indigo
  },

  // Base colors
  white: "#ffffff",
  black: "#000000",
  background: "#f9fafb", // neutral.50
  surface: "#ffffff",
  text: {
    primary: "#111827", // neutral.900
    secondary: "#4b5563", // neutral.600
    tertiary: "#9ca3af", // neutral.400
    disabled: "#d1d5db", // neutral.300
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

/**
 * Typography tokens mapped to React Native Paper's scale
 * Paper variants: headline*, title*, body*, label*
 */
export const typography = {
  // Font families
  fontFamily: {
    regular: "System",
    medium: "System",
    bold: "System",
  },

  // Font sizes (mapped to Paper's typography scale)
  fontSize: {
    // Headlines (large display text)
    headlineLarge: 32,
    headlineMedium: 28,
    headlineSmall: 24,

    // Titles (section headers)
    titleLarge: 22,
    titleMedium: 16,
    titleSmall: 14,

    // Body (main content)
    bodyLarge: 16,
    bodyMedium: 14,
    bodySmall: 12,

    // Labels (small text, captions)
    labelLarge: 14,
    labelMedium: 12,
    labelSmall: 11,
  },

  // Font weights
  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

/**
 * Spacing scale based on 4px base unit
 * Use these for margins, padding, gaps
 */
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

// ============================================================================
// CONTAINER / LAYOUT
// ============================================================================

/**
 * Container and layout tokens for consistent screen padding and max widths
 * Use these in BaseLayout and screen components
 */
export const container = {
  /** Horizontal padding for screen edges (mobile-friendly) */
  horizontalPadding: 20,
  /** Maximum content width for large screens (tablets, desktop) */
  maxWidth: 640,
  /** Vertical padding for screen top/bottom */
  verticalPadding: 24,
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

/**
 * Border radius for rounded corners
 */
export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
} as const;

// ============================================================================
// ELEVATION (SHADOWS)
// ============================================================================

/**
 * Elevation system for consistent depth/shadows
 * Each level includes shadowOffset, shadowOpacity, shadowRadius, elevation
 *
 * Usage:
 * <View style={theme.elevation[2]}>...</View>
 */
export const elevation = {
  0: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  1: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  2: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  3: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  4: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  5: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
} as const;

// ============================================================================
// OPACITY
// ============================================================================

/**
 * Opacity values for overlays, disabled states, etc.
 */
export const opacity = {
  disabled: 0.4,
  hover: 0.8,
  overlay: 0.6,
  subtle: 0.12,
} as const;

// ============================================================================
// EXPORT THEME OBJECT
// ============================================================================

export const theme = {
  colors,
  typography,
  spacing,
  container,
  radius,
  elevation,
  opacity,
} as const;

export default theme;
