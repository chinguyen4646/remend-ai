import { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { Text, Button, Card, ActivityIndicator } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "../../src/api/client";
import type { RehabPlan } from "../../src/types/rehabPlan";
import BaseLayout from "../../src/components/BaseLayout";

export default function PlanCreatedScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const [plan, setPlan] = useState<RehabPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) {
        setError("No plan ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<{ plan: RehabPlan }>(`/api/rehab-plans/${planId}`);
        setPlan(response.data.plan);
      } catch (err: unknown) {
        setError(err.response?.data?.errors?.[0]?.message || "Failed to load plan");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  const handleGoHome = () => {
    router.replace("/rehab-home");
  };

  if (isLoading) {
    return (
      <BaseLayout centered>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" className="mt-4">
          Generating your plan...
        </Text>
      </BaseLayout>
    );
  }

  if (error || !plan) {
    return (
      <BaseLayout centered>
        <Text variant="bodyLarge" className="text-red-600 mb-4">
          {error || "Plan not found"}
        </Text>
        <Button mode="contained" onPress={handleGoHome}>
          <Text>Go Home</Text>
        </Button>
      </BaseLayout>
    );
  }

  const aiOutput = plan.aiOutputJson;
  const hasFallback = plan.planType === "fallback" || plan.aiStatus === "failed";

  return (
    <BaseLayout scrollable>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text variant="headlineMedium" className="font-bold mb-2">
            Today&apos;s Plan
          </Text>
          <Text variant="bodyLarge" className="text-gray-600">
            Your personalized exercise plan is ready
          </Text>
        </View>

        {/* Plan Type Badge */}
        {hasFallback && (
          <Card className="mb-4 bg-yellow-50">
            <Card.Content>
              <Text variant="bodyMedium" className="text-yellow-800">
                ℹ️ Using fallback plan. AI personalization temporarily unavailable.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* AI Summary */}
        {aiOutput?.summary && (
          <Card className="mb-4">
            <Card.Content>
              <Text variant="titleMedium" className="font-bold mb-2">
                Summary
              </Text>
              <Text variant="bodyMedium" className="text-gray-700">
                {aiOutput.summary}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Caution */}
        {aiOutput?.caution && (
          <Card className="mb-4 bg-red-50">
            <Card.Content>
              <Text variant="titleMedium" className="font-bold mb-2 text-red-800">
                ⚠️ Caution
              </Text>
              <Text variant="bodyMedium" className="text-red-700">
                {aiOutput.caution}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Exercise List */}
        <View className="mb-6">
          <Text variant="titleLarge" className="font-bold mb-3">
            Exercises
          </Text>
          {aiOutput?.bullets
            ? // AI-formatted bullets
              aiOutput.bullets.map((bullet, idx) => (
                <Card key={idx} className="mb-3">
                  <Card.Content>
                    <Text variant="titleMedium" className="font-bold mb-1">
                      {idx + 1}. {bullet.exercise_name}
                    </Text>
                    <Text variant="bodyMedium" className="text-indigo-600 mb-2">
                      {bullet.dosage_text}
                    </Text>
                    <Text variant="bodyMedium" className="text-gray-700">
                      {bullet.coaching}
                    </Text>
                  </Card.Content>
                </Card>
              ))
            : // Fallback: show shortlist without AI coaching
              plan.shortlistJson.exercises.map((exercise, idx) => (
                <Card key={idx} className="mb-3">
                  <Card.Content>
                    <Text variant="titleMedium" className="font-bold mb-1">
                      {idx + 1}. {exercise.name}
                    </Text>
                    <Text variant="bodyMedium" className="text-indigo-600 mb-2">
                      {exercise.dosage_text}
                    </Text>
                    {exercise.safety_notes && (
                      <Text variant="bodySmall" className="text-gray-600 italic">
                        {exercise.safety_notes}
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              ))}
        </View>

        {/* Action Button */}
        <View className="mb-4">
          <Button mode="contained" onPress={handleGoHome}>
            <Text>Back</Text>
          </Button>
        </View>
      </ScrollView>
    </BaseLayout>
  );
}
