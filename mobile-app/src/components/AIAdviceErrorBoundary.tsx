import React, { Component, ReactNode } from "react";
import { View, Text } from "react-native";
import { Card, Button, Icon } from "react-native-paper";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for AI Advice feature
 * Prevents crashes from propagating and shows fallback UI
 */
export default class AIAdviceErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error("AI Advice Error Boundary caught an error:", error, errorInfo);

    // In production, you could send this to an error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="mb-4 bg-red-50">
          <Card.Content>
            <View className="flex-row items-center mb-3">
              <Icon source="alert-circle" size={24} color="#dc2626" />
              <Text className="text-lg font-semibold text-red-700 ml-2">
                AI Feedback Unavailable
              </Text>
            </View>

            <Text className="text-base text-gray-800 mb-4">
              Something went wrong while displaying AI insights. This doesn't affect your logs or
              other features.
            </Text>

            <Button mode="outlined" onPress={this.handleReset} textColor="#dc2626">
              <Text>Try Again</Text>
            </Button>
          </Card.Content>
        </Card>
      );
    }

    return this.props.children;
  }
}
