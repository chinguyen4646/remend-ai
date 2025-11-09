/**
 * Design System Preview Screen
 *
 * Interactive demo of Remend Design System v1
 * Shows all tokens, components, and usage examples
 *
 * Access: /dev/design-system
 */

import React, { useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import {
  AppButton,
  AppCard,
  AppBadge,
  AppProgressBar,
  AppChartContainer,
  AppDivider,
  AppStatCard,
} from "../../src/ui/components";
import { theme } from "../../src/ui/theme";
import BaseLayout from "../../src/components/BaseLayout";

export default function DesignSystemScreen() {
  const [loading, setLoading] = useState(false);

  return (
    <BaseLayout scrollable>
      <View className="w-full">
        {/* Header */}
        <View style={{ marginBottom: theme.spacing[6] }}>
          <Text
            variant="displaySmall"
            style={{ color: theme.colors.text.primary, fontWeight: "700" }}
          >
            Remend Design System
          </Text>
          <Text
            variant="bodyLarge"
            style={{ color: theme.colors.text.secondary, marginTop: theme.spacing[2] }}
          >
            Calm, clinical, trustworthy — v1.0
          </Text>
        </View>

        {/* Colors Section */}
        <Text
          variant="headlineMedium"
          style={{ marginBottom: theme.spacing[4], fontWeight: "700" }}
        >
          🎨 Colors
        </Text>

        {/* Primary Colors */}
        <Text
          variant="titleMedium"
          style={{ marginBottom: theme.spacing[2], marginTop: theme.spacing[4] }}
        >
          Primary (Indigo)
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: theme.spacing[2],
            marginBottom: theme.spacing[4],
          }}
        >
          {Object.entries(theme.colors.primary).map(([key, value]) => (
            <View key={key} style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: value,
                  borderRadius: theme.radius.md,
                  marginBottom: theme.spacing[1],
                  ...theme.elevation[2],
                }}
              />
              <Text variant="labelSmall" style={{ color: theme.colors.text.secondary }}>
                {key}
              </Text>
            </View>
          ))}
        </View>

        {/* Secondary Colors */}
        <Text variant="titleMedium" style={{ marginBottom: theme.spacing[2] }}>
          Secondary (Teal)
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: theme.spacing[2],
            marginBottom: theme.spacing[4],
          }}
        >
          {Object.entries(theme.colors.secondary).map(([key, value]) => (
            <View key={key} style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: value,
                  borderRadius: theme.radius.md,
                  marginBottom: theme.spacing[1],
                  ...theme.elevation[2],
                }}
              />
              <Text variant="labelSmall" style={{ color: theme.colors.text.secondary }}>
                {key}
              </Text>
            </View>
          ))}
        </View>

        {/* Semantic Colors */}
        <Text variant="titleMedium" style={{ marginBottom: theme.spacing[2] }}>
          Semantic
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: theme.spacing[2],
            marginBottom: theme.spacing[6],
          }}
        >
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 80,
                height: 60,
                backgroundColor: theme.colors.success[600],
                borderRadius: theme.radius.md,
                marginBottom: theme.spacing[1],
              }}
            />
            <Text variant="labelSmall">Success</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 80,
                height: 60,
                backgroundColor: theme.colors.warning[500],
                borderRadius: theme.radius.md,
                marginBottom: theme.spacing[1],
              }}
            />
            <Text variant="labelSmall">Warning</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 80,
                height: 60,
                backgroundColor: theme.colors.error[500],
                borderRadius: theme.radius.md,
                marginBottom: theme.spacing[1],
              }}
            />
            <Text variant="labelSmall">Error</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 80,
                height: 60,
                backgroundColor: theme.colors.info[500],
                borderRadius: theme.radius.md,
                marginBottom: theme.spacing[1],
              }}
            />
            <Text variant="labelSmall">Info</Text>
          </View>
        </View>

        <AppDivider label="Typography" />

        {/* Typography Section */}
        <View style={{ marginBottom: theme.spacing[6] }}>
          <Text variant="headlineLarge" style={{ marginBottom: theme.spacing[2] }}>
            Headline Large
          </Text>
          <Text variant="headlineMedium" style={{ marginBottom: theme.spacing[2] }}>
            Headline Medium
          </Text>
          <Text variant="headlineSmall" style={{ marginBottom: theme.spacing[2] }}>
            Headline Small
          </Text>
          <Text variant="titleLarge" style={{ marginBottom: theme.spacing[2] }}>
            Title Large
          </Text>
          <Text variant="titleMedium" style={{ marginBottom: theme.spacing[2] }}>
            Title Medium
          </Text>
          <Text variant="titleSmall" style={{ marginBottom: theme.spacing[2] }}>
            Title Small
          </Text>
          <Text variant="bodyLarge" style={{ marginBottom: theme.spacing[2] }}>
            Body Large: The quick brown fox jumps over the lazy dog.
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: theme.spacing[2] }}>
            Body Medium: The quick brown fox jumps over the lazy dog.
          </Text>
          <Text variant="bodySmall" style={{ marginBottom: theme.spacing[2] }}>
            Body Small: The quick brown fox jumps over the lazy dog.
          </Text>
          <Text variant="labelMedium" style={{ marginBottom: theme.spacing[2] }}>
            Label Medium
          </Text>
          <Text variant="labelSmall">Label Small</Text>
        </View>

        <AppDivider label="Container / Layout" />

        {/* Container / Layout Section */}
        <Text
          variant="headlineMedium"
          style={{ marginBottom: theme.spacing[4], fontWeight: "700" }}
        >
          📐 Container & Layout
        </Text>
        <View style={{ marginBottom: theme.spacing[6] }}>
          <Text
            variant="bodyMedium"
            style={{ marginBottom: theme.spacing[3], color: theme.colors.text.secondary }}
          >
            Screen padding and content constraints for consistent layouts across all screens.
          </Text>

          <View style={{ gap: theme.spacing[3] }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text variant="labelMedium" style={{ color: theme.colors.text.tertiary }}>
                Horizontal Padding
              </Text>
              <Text variant="bodyLarge" style={{ fontWeight: "600" }}>
                {theme.container.horizontalPadding}px
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text variant="labelMedium" style={{ color: theme.colors.text.tertiary }}>
                Vertical Padding
              </Text>
              <Text variant="bodyLarge" style={{ fontWeight: "600" }}>
                {theme.container.verticalPadding}px
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text variant="labelMedium" style={{ color: theme.colors.text.tertiary }}>
                Max Width (tablets/desktop)
              </Text>
              <Text variant="bodyLarge" style={{ fontWeight: "600" }}>
                {theme.container.maxWidth}px
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: theme.spacing[4],
              padding: theme.spacing[3],
              backgroundColor: theme.colors.neutral[100],
              borderRadius: theme.radius.md,
            }}
          >
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.text.tertiary, marginBottom: theme.spacing[1] }}
            >
              💡 Usage
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.text.secondary }}>
              All screens use BaseLayout which applies these padding values automatically. Content
              is constrained to {theme.container.maxWidth}px width on large screens for optimal
              readability.
            </Text>
          </View>
        </View>

        <AppDivider label="Elevation" />

        {/* Elevation Section */}
        <Text
          variant="headlineMedium"
          style={{ marginBottom: theme.spacing[4], fontWeight: "700" }}
        >
          📦 Elevation
        </Text>
        <View style={{ gap: theme.spacing[4], marginBottom: theme.spacing[6] }}>
          {[0, 1, 2, 3, 4, 5].map((level) => (
            <View key={level}>
              <Text variant="labelMedium" style={{ marginBottom: theme.spacing[2] }}>
                Level {level}
              </Text>
              <View
                style={{
                  padding: theme.spacing[4],
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radius.lg,
                  ...theme.elevation[level],
                }}
              >
                <Text variant="bodyMedium">Shadow level {level}</Text>
              </View>
            </View>
          ))}
        </View>

        <AppDivider label="Buttons" />

        {/* Button Components */}
        <Text
          variant="headlineMedium"
          style={{ marginBottom: theme.spacing[4], fontWeight: "700" }}
        >
          🔘 Buttons
        </Text>
        <View style={{ gap: theme.spacing[3], marginBottom: theme.spacing[6] }}>
          <AppButton variant="primary" onPress={() => console.log("Primary")}>
            Primary Button
          </AppButton>
          <AppButton variant="secondary" onPress={() => console.log("Secondary")}>
            Secondary Button
          </AppButton>
          <AppButton variant="outlined" onPress={() => console.log("Outline")}>
            Outline Button
          </AppButton>
          <AppButton variant="text" onPress={() => console.log("Text")}>
            Text Button
          </AppButton>
          <AppButton
            variant="primary"
            loading={loading}
            onPress={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 2000);
            }}
          >
            Loading State
          </AppButton>
          <AppButton variant="primary" disabled onPress={() => {}}>
            Disabled Button
          </AppButton>
        </View>

        <Text
          variant="titleMedium"
          style={{ marginTop: theme.spacing[4], marginBottom: theme.spacing[3] }}
        >
          Button Sizes
        </Text>
        <View style={{ marginBottom: theme.spacing[6] }}>
          <View style={{ marginBottom: theme.spacing[3] }}>
            <AppButton variant="primary" size="small" onPress={() => console.log("small")}>
              Small Button
            </AppButton>
          </View>
          <View style={{ marginBottom: theme.spacing[3] }}>
            <AppButton variant="primary" size="medium" onPress={() => console.log("medium")}>
              Medium Button
            </AppButton>
          </View>
          <View style={{ marginBottom: theme.spacing[3] }}>
            <AppButton variant="primary" size="large" onPress={() => console.log("large")}>
              Large Button
            </AppButton>
          </View>
        </View>

        <AppDivider label="Badges" />

        {/* Badge Components */}
        <Text
          variant="headlineMedium"
          style={{ marginBottom: theme.spacing[4], fontWeight: "700" }}
        >
          🏷️ Badges
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: theme.spacing[2],
            marginBottom: theme.spacing[6],
          }}
        >
          <AppBadge variant="success">Success</AppBadge>
          <AppBadge variant="warning">Warning</AppBadge>
          <AppBadge variant="error">Error</AppBadge>
          <AppBadge variant="info">Info</AppBadge>
          <AppBadge variant="neutral">Neutral</AppBadge>
        </View>

        <AppDivider label="Cards" />

        {/* Card Components */}
        <Text
          variant="headlineMedium"
          style={{ marginBottom: theme.spacing[4], fontWeight: "700" }}
        >
          🗂️ Cards
        </Text>
        <View style={{ gap: theme.spacing[4], marginBottom: theme.spacing[6] }}>
          <AppCard variant="elevated" title="Elevated Card" subtitle="With shadow">
            <Text variant="bodyMedium">This is an elevated card with shadow depth.</Text>
          </AppCard>
          <AppCard variant="flat" title="Flat Card" subtitle="No shadow">
            <Text variant="bodyMedium">This is a flat card without shadow.</Text>
          </AppCard>
          <AppCard
            title="Card with Footer"
            footer={
              <AppButton variant="primary" onPress={() => {}}>
                Action
              </AppButton>
            }
          >
            <Text variant="bodyMedium">Card content with a footer action.</Text>
          </AppCard>
        </View>

        <AppDivider label="Progress" />

        {/* Progress Bar */}
        <Text
          variant="headlineMedium"
          style={{ marginBottom: theme.spacing[4], fontWeight: "700" }}
        >
          📊 Progress Bar
        </Text>
        <View style={{ gap: theme.spacing[4], marginBottom: theme.spacing[6] }}>
          <AppProgressBar value={25} label="25% Complete" />
          <AppProgressBar value={50} label="50% Complete" color={theme.colors.secondary[500]} />
          <AppProgressBar value={75} label="75% Complete" color={theme.colors.success[600]} />
          <AppProgressBar value={100} label="100% Complete" color={theme.colors.success[600]} />
        </View>

        <AppDivider label="Stat Cards" />

        {/* Stat Cards */}
        <Text
          variant="headlineMedium"
          style={{ marginBottom: theme.spacing[4], fontWeight: "700" }}
        >
          📈 Stat Cards
        </Text>
        <View style={{ gap: theme.spacing[3], marginBottom: theme.spacing[6] }}>
          <AppStatCard
            value="4"
            label="Day Streak"
            icon={<Text style={{ fontSize: 32 }}>🔥</Text>}
            trend="up"
            trendValue="+1 day"
          />
          <AppStatCard
            value="73%"
            label="Adherence Rate"
            subtitle="Last 14 days"
            icon={<Text style={{ fontSize: 32 }}>📊</Text>}
            trend="up"
            trendValue="+5%"
          />
          <AppStatCard
            value="3.2"
            label="Average Pain"
            subtitle="Down from 7.5"
            icon={<Text style={{ fontSize: 32 }}>💪</Text>}
            trend="down"
            trendValue="-4.3 pts"
          />
        </View>

        <AppDivider label="Chart Container" />

        {/* Chart Container */}
        <Text
          variant="headlineMedium"
          style={{ marginBottom: theme.spacing[4], fontWeight: "700" }}
        >
          📉 Chart Container
        </Text>
        <AppCard variant="elevated">
          <AppChartContainer title="Weekly Progress" subtitle="Last 7 days">
            <View
              style={{
                height: 120,
                backgroundColor: theme.colors.neutral[100],
                borderRadius: theme.radius.md,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text variant="bodyMedium" style={{ color: theme.colors.text.tertiary }}>
                Chart placeholder
              </Text>
            </View>
          </AppChartContainer>
        </AppCard>

        {/* Footer */}
        <View style={{ marginTop: theme.spacing[12], marginBottom: theme.spacing[6] }}>
          <AppDivider />
          <Text
            variant="bodyMedium"
            style={{ textAlign: "center", color: theme.colors.text.tertiary }}
          >
            Remend Design System v1.0
          </Text>
          <Text
            variant="bodySmall"
            style={{
              textAlign: "center",
              color: theme.colors.text.tertiary,
              marginTop: theme.spacing[1],
            }}
          >
            Calm • Clinical • Trustworthy
          </Text>
        </View>
      </View>
    </BaseLayout>
  );
}
