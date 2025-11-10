import { ReactNode } from "react";
import { ScrollView, View, ViewStyle, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname } from "expo-router";
import { theme } from "../ui/theme";

interface BaseLayoutProps {
  children: ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  centered?: boolean;
  style?: ViewStyle;
  className?: string;
  /** Optional gradient background [start, end] colors. Default: none (solid bg-gray-50) */
  gradient?: [string, string];
}

/**
 * BaseLayout provides consistent safe area handling and padding for all screens.
 *
 * Features:
 * - Safe area insets (respects notches, status bars, rounded corners)
 * - Consistent padding from design system (20px horizontal, 24px vertical)
 * - Content max width constraint (640px) for tablets/desktop
 * - Optional scrolling (default: true)
 * - Optional keyboard avoiding for forms (default: false)
 * - Optional vertical centering for auth screens (default: false)
 * - Prevents content from being cut off on any device
 *
 * Usage:
 * <BaseLayout>
 *   <Text>Your content here</Text>
 * </BaseLayout>
 *
 * For forms with keyboard input:
 * <BaseLayout keyboardAvoiding>
 *   <TextInput />
 * </BaseLayout>
 *
 * For centered content (login/register):
 * <BaseLayout keyboardAvoiding centered>
 *   <Text>Centered content</Text>
 * </BaseLayout>
 */
export default function BaseLayout({
  children,
  scrollable = true,
  keyboardAvoiding = false,
  centered = false,
  style,
  className,
  gradient,
}: BaseLayoutProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // Check if bottom tab bar should be visible (hide only on auth and onboarding)
  const showTabBar = !pathname.startsWith("/(auth)") && !pathname.startsWith("/(onboarding)");

  // Calculate bottom padding: tab bar height (56px) + standard padding, or just standard padding
  const bottomPadding = showTabBar
    ? 56 + theme.container.verticalPadding // Tab bar + standard padding = 80px
    : theme.container.verticalPadding; // Just standard padding = 24px

  const content = scrollable ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={
        centered ? "flex-grow justify-center items-center" : "items-center"
      }
      contentContainerStyle={{
        paddingHorizontal: theme.container.horizontalPadding,
        paddingTop: theme.container.verticalPadding,
        paddingBottom: bottomPadding,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps={keyboardAvoiding ? "handled" : undefined}
    >
      <View style={{ width: "100%", maxWidth: theme.container.maxWidth }}>{children}</View>
    </ScrollView>
  ) : (
    <View
      className={centered ? "flex-1 justify-center items-center" : "flex-1 items-center"}
      style={{
        paddingHorizontal: theme.container.horizontalPadding,
        paddingTop: theme.container.verticalPadding,
        paddingBottom: bottomPadding,
      }}
    >
      <View style={{ width: "100%", maxWidth: theme.container.maxWidth }}>{children}</View>
    </View>
  );

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  // Wrapper with safe area insets and gradient support
  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          {
            flex: 1,
            paddingTop: insets.top,
            paddingBottom: showTabBar ? 0 : insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
          style,
        ]}
      >
        {wrappedContent}
      </LinearGradient>
    );
  }

  // Fallback to solid background
  return (
    <View
      className={`flex-1 bg-gray-50 ${className || ""}`}
      style={[
        {
          paddingTop: insets.top,
          paddingBottom: showTabBar ? 0 : insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        style,
      ]}
    >
      {wrappedContent}
    </View>
  );
}
