import { ReactNode } from "react";
import { ScrollView, View, ViewStyle, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname } from "expo-router";

interface BaseLayoutProps {
  children: ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  centered?: boolean;
  style?: ViewStyle;
  className?: string;
}

/**
 * BaseLayout provides consistent safe area handling and padding for all screens.
 *
 * Features:
 * - Safe area insets (respects notches, status bars, rounded corners)
 * - Consistent horizontal padding
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
}: BaseLayoutProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // Check if bottom tab bar should be visible (hide only on auth and onboarding)
  const showTabBar = !pathname.startsWith("/(auth)") && !pathname.startsWith("/(onboarding)");

  // Add extra bottom padding when tab bar is visible (56px for tab bar height)
  const bottomPadding = showTabBar ? 56 : 0;

  const content = scrollable ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={
        centered ? "flex-grow justify-center items-center px-8 py-6" : "items-center px-8 py-6"
      }
      contentContainerStyle={{ paddingBottom: bottomPadding }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps={keyboardAvoiding ? "handled" : undefined}
    >
      <View className="w-full max-w-md">{children}</View>
    </ScrollView>
  ) : (
    <View
      className={
        centered ? "flex-1 justify-center items-center px-8 py-6" : "flex-1 items-center px-8 py-6"
      }
      style={{ paddingBottom: bottomPadding }}
    >
      <View className="w-full max-w-md">{children}</View>
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

  return (
    <View
      className={`flex-1 bg-gray-50 ${className || ""}`}
      style={[
        {
          paddingTop: insets.top,
          paddingBottom: showTabBar ? 0 : insets.bottom, // Don't add bottom padding when tab bar is visible
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
