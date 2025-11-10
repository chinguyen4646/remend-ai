import { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "../../src/api/client";
import type { RehabPlan } from "../../src/types/rehabPlan";
import BaseLayout from "../../src/components/BaseLayout";
import { AppButton, AppCard } from "../../src/ui/components";
import { theme } from "../../src/ui/theme";

export default function PlanCreatedScreen() {
  const router = useRouter();
  const { planId, programId, isInitial } = useLocalSearchParams<{
    planId: string;
    programId?: string;
    isInitial?: string;
  }>();
  const [plan, setPlan] = useState<RehabPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isInitialPlan = isInitial === "true";

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
    if (isInitialPlan) {
      // Initial plans navigate to profile
      router.replace("/profile");
    } else if (programId) {
      router.replace(`/rehab-home?programId=${programId}`);
    } else {
      router.replace("/home");
    }
  };

  if (isLoading) {
    return (
      <BaseLayout gradient={["#F8FAFC", "#FFFFFF"]} centered>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        <Text
          variant="bodyLarge"
          style={{ marginTop: theme.spacing[4], color: theme.colors.text.primary }}
        >
          Generating your plan...
        </Text>
      </BaseLayout>
    );
  }

  if (error || !plan) {
    return (
      <BaseLayout gradient={["#F8FAFC", "#FFFFFF"]} centered>
        <Text
          variant="bodyLarge"
          style={{ color: theme.colors.error[600], marginBottom: theme.spacing[4] }}
        >
          {error || "Plan not found"}
        </Text>
        <AppButton variant="primary" size="large" onPress={handleGoHome}>
          Go Home
        </AppButton>
      </BaseLayout>
    );
  }

  const aiOutput = plan.aiOutputJson;
  const hasFallback = plan.planType === "fallback" || plan.aiStatus === "failed";

  return (
    <BaseLayout gradient={["#F8FAFC", "#FFFFFF"]} scrollable>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: theme.spacing[6] }}>
          <Text
            variant="headlineLarge"
            style={{
              fontWeight: "700",
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[2],
            }}
          >
            {isInitialPlan ? "Your Starting Plan" : "Today's Plan"}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.neutral[500] }}>
            {isInitialPlan
              ? "Welcome! Here's your personalized starting plan"
              : "Your personalized exercise plan is ready"}
          </Text>
        </View>

        {/* Plan Type Badge */}
        {hasFallback && (
          <AppCard
            leftAccentColor="#F59E0B"
            shadow
            padding="md"
            style={{ backgroundColor: "#FEF3C7", marginBottom: theme.spacing[4] }}
          >
            <Text variant="bodyMedium" style={{ color: "#92400E" }}>
              ℹ️ Using fallback plan. AI personalization temporarily unavailable.
            </Text>
          </AppCard>
        )}

        {/* AI Summary */}
        {aiOutput?.summary && (
          <AppCard shadow padding="md" style={{ marginBottom: theme.spacing[4] }}>
            <Text
              variant="titleMedium"
              style={{
                fontWeight: "600",
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[2],
              }}
            >
              Summary
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>
              {aiOutput.summary}
            </Text>
          </AppCard>
        )}

        {/* Caution */}
        {aiOutput?.caution && (
          <AppCard
            leftAccentColor="#DC2626"
            shadow
            padding="md"
            style={{ backgroundColor: "#FEE2E2", marginBottom: theme.spacing[4] }}
          >
            <Text
              variant="titleMedium"
              style={{
                fontWeight: "600",
                color: "#991B1B",
                marginBottom: theme.spacing[2],
              }}
            >
              ⚠️ Caution
            </Text>
            <Text variant="bodyMedium" style={{ color: "#991B1B" }}>
              {aiOutput.caution}
            </Text>
          </AppCard>
        )}

        {/* Exercise List */}
        <View style={{ marginBottom: theme.spacing[6] }}>
          <Text
            variant="titleLarge"
            style={{
              fontWeight: "600",
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[3],
            }}
          >
            Exercises
          </Text>
          {aiOutput?.bullets
            ? // AI-formatted bullets
              aiOutput.bullets.map((bullet, idx) => (
                <AppCard
                  key={idx}
                  leftAccentColor={theme.colors.primary[500]}
                  shadow
                  padding="md"
                  style={{ marginBottom: theme.spacing[3] }}
                >
                  <Text
                    variant="titleMedium"
                    style={{
                      fontWeight: "600",
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing[1],
                    }}
                  >
                    {idx + 1}. {bullet.exercise_name}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.primary[600],
                      marginBottom: theme.spacing[2],
                    }}
                  >
                    {bullet.dosage_text}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>
                    {bullet.coaching}
                  </Text>
                </AppCard>
              ))
            : // Fallback: show shortlist without AI coaching
              plan.shortlistJson.exercises.map((exercise, idx) => (
                <AppCard
                  key={idx}
                  leftAccentColor={theme.colors.primary[500]}
                  shadow
                  padding="md"
                  style={{ marginBottom: theme.spacing[3] }}
                >
                  <Text
                    variant="titleMedium"
                    style={{
                      fontWeight: "600",
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing[1],
                    }}
                  >
                    {idx + 1}. {exercise.name}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.primary[600],
                      marginBottom: theme.spacing[2],
                    }}
                  >
                    {exercise.dosage_text}
                  </Text>
                  {exercise.safety_notes && (
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.neutral[500], fontStyle: "italic" }}
                    >
                      {exercise.safety_notes}
                    </Text>
                  )}
                </AppCard>
              ))}
        </View>

        {/* Action Button */}
        <View style={{ marginBottom: theme.spacing[4] }}>
          <AppButton variant="primary" size="large" onPress={handleGoHome}>
            {isInitialPlan ? "Get Started!" : "Back to Home"}
          </AppButton>
        </View>
      </ScrollView>
    </BaseLayout>
  );
}
