import { View, Text } from "react-native";
import { Card, Icon } from "react-native-paper";
import type { AIAdvice } from "../types/aiAdvice";

interface AIAdviceCardProps {
  advice: AIAdvice;
}

/**
 * Display card for AI-generated rehabilitation advice
 * Shows summary, actionable recommendations, and optional caution
 */
export default function AIAdviceCard({ advice }: AIAdviceCardProps) {
  const { summary, actions, caution } = advice;

  return (
    <Card className="mb-4 bg-blue-50">
      <Card.Content>
        {/* Header */}
        <View className="flex-row items-center mb-3">
          <Icon source="lightbulb-outline" size={24} color="#2563eb" />
          <Text className="text-lg font-semibold text-blue-700 ml-2">AI Insights</Text>
        </View>

        {/* Summary */}
        <Text className="text-base text-gray-800 mb-4">{summary}</Text>

        {/* Actions */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Recommended Actions:</Text>
          {actions.map((action, index) => (
            <View key={index} className="flex-row items-start mb-2">
              <View className="mt-1.5">
                <Icon source="check-circle" size={16} color="#16a34a" />
              </View>
              <Text className="text-sm text-gray-700 ml-2 flex-1">{action}</Text>
            </View>
          ))}
        </View>

        {/* Caution (if present) */}
        {caution && caution.trim().length > 0 && (
          <View className="bg-amber-100 border border-amber-300 rounded-lg p-3">
            <View className="flex-row items-start">
              <Icon source="alert-circle" size={20} color="#f59e0b" />
              <View className="ml-2 flex-1">
                <Text className="text-sm font-semibold text-amber-800 mb-1">Caution</Text>
                <Text className="text-sm text-amber-700">{caution}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Disclaimer */}
        <View className="mt-4 pt-4 border-t border-gray-200">
          <Text className="text-xs text-gray-500 italic">
            This advice is AI-generated and should not replace professional medical guidance. Always
            consult your healthcare provider for personalized recommendations.
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}
