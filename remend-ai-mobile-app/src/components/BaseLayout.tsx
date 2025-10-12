import { ReactNode } from "react";
import { ScrollView, View, ViewStyle, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BaseLayoutProps {
  children: ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  centered?: boolean;
  style?: ViewStyle;
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
}: BaseLayoutProps) {
  const insets = useSafeAreaInsets();

  const content = scrollable ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={centered ? "flex-grow justify-center p-6" : "p-6"}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps={keyboardAvoiding ? "handled" : undefined}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={centered ? "flex-1 justify-center p-6" : "flex-1 p-6"}>{children}</View>
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
      className="flex-1 bg-gray-50"
      style={[
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
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
