import { useEffect, useState, useRef } from "react";
import { View, Animated, TouchableOpacity, StyleSheet } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { authApi } from "../src/api/auth";
import type { User } from "../src/types/auth";
import BaseLayout from "../src/components/BaseLayout";
import { rehabApi } from "../src/api/rehab";
import type { RehabProgram } from "../src/types/rehab";
import { AppButton, AppCard, AppBadge } from "../src/ui/components";
import { theme } from "../src/ui/theme";

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/** Profile header with title and subtitle */
function ProfileHeader() {
  return (
    <View style={{ marginBottom: theme.spacing[8] }}>
      <Text
        variant="headlineLarge"
        style={{
          fontWeight: "700",
          color: theme.colors.text.primary,
          marginBottom: theme.spacing[2],
        }}
      >
        Profile
      </Text>
      <Text
        variant="bodyMedium"
        style={{
          color: theme.colors.neutral[500],
          lineHeight: 20,
        }}
      >
        Manage your account and rehab programs
      </Text>
    </View>
  );
}

/** Account info row with icon, label, and value */
interface AccountInfoRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  isLast?: boolean;
}

function AccountInfoRow({ icon, label, value, isLast }: AccountInfoRowProps) {
  return (
    <View style={[styles.infoRow, !isLast && { marginBottom: theme.spacing[4] }]}>
      <Feather
        name={icon}
        size={16}
        color={theme.colors.neutral[500]}
        style={{ marginRight: theme.spacing[2] }}
      />
      <View style={{ flex: 1 }}>
        <Text variant="labelMedium" style={{ color: theme.colors.neutral[500], marginBottom: 2 }}>
          {label}
        </Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.text.primary, fontWeight: "500" }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/** Motivational banner showing active programs and journey stats */
interface MotivationalBannerProps {
  activeCount: number;
  daysSinceStart: number;
}

function MotivationalBanner({ activeCount, daysSinceStart }: MotivationalBannerProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, marginBottom: theme.spacing[4] }}>
      <AppCard leftAccentColor="#10B981" padding="md" shadow style={{ backgroundColor: "#DCFCE7" }}>
        <View style={{ gap: theme.spacing[2] }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Feather
              name="activity"
              size={18}
              color="#15803D"
              style={{ marginRight: theme.spacing[2] }}
            />
            <Text variant="bodyLarge" style={{ fontWeight: "600", color: "#15803D" }}>
              {activeCount} active program{activeCount !== 1 ? "s" : ""}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Feather
              name="calendar"
              size={18}
              color="#15803D"
              style={{ marginRight: theme.spacing[2] }}
            />
            <Text variant="bodyMedium" style={{ color: "#15803D" }}>
              {daysSinceStart} {daysSinceStart === 1 ? "day" : "days"} on your journey
            </Text>
          </View>
        </View>
      </AppCard>
    </Animated.View>
  );
}

/** Program card with left accent bar and status badge */
interface ProgramCardProps {
  program: RehabProgram;
  index: number;
  onPress: () => void;
}

function ProgramCard({ program, index, onPress }: ProgramCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 100, // Stagger animation
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const formatArea = () => {
    const side =
      program.side === "both"
        ? "Both"
        : program.side === "na"
          ? ""
          : program.side.charAt(0).toUpperCase() + program.side.slice(1);
    const area =
      program.area === "other" ? program.areaOtherLabel || "Other" : program.area.replace("_", " ");
    return `${side} ${area}`.trim();
  };

  const statusConfig = {
    active: {
      accent: "#10B981",
      badge: "success" as const,
    },
    paused: {
      accent: "#F59E0B",
      badge: "warning" as const,
    },
    completed: {
      accent: "#6B7280",
      badge: "neutral" as const,
    },
  };

  const config = statusConfig[program.status as keyof typeof statusConfig] || statusConfig.active;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        marginBottom: theme.spacing[3],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
      >
        <AppCard leftAccentColor={config.accent} padding="md" shadow>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
          >
            <View style={{ flex: 1, marginRight: theme.spacing[3] }}>
              <Text
                variant="titleMedium"
                style={{ fontWeight: "600", color: theme.colors.text.primary, marginBottom: 4 }}
              >
                {formatArea()}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.neutral[500] }}>
                Started {new Date(program.startDate).toLocaleDateString()}
              </Text>
            </View>
            <AppBadge variant={config.badge} size="small">
              {program.status}
            </AppBadge>
          </View>
        </AppCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [programs, setPrograms] = useState<RehabProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      setError(null);
      const response = await authApi.me();
      setUser(response.user);
      // Fetch programs if user is in rehab mode
      if (response.user.mode === "rehab") {
        fetchPrograms();
      }
    } catch (err: unknown) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      setProgramsLoading(true);
      const response = await rehabApi.getPrograms();
      setPrograms(response.programs);
    } catch (err: unknown) {
      // Silently fail - programs are optional
      console.error("Failed to fetch programs:", err);
    } finally {
      setProgramsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleBack = () => {
    router.back();
  };

  // Calculate motivational stats
  const activeCount = programs.filter((p) => p.status === "active").length;
  const sortedPrograms = [...programs].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );
  const oldestProgram = sortedPrograms[0];
  const daysSinceStart = oldestProgram
    ? Math.floor((Date.now() - new Date(oldestProgram.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <BaseLayout gradient={["#F8FAFC", "#FFFFFF"]} centered>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </BaseLayout>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <BaseLayout gradient={["#F8FAFC", "#FFFFFF"]} centered>
        <View style={{ padding: theme.spacing[6], alignItems: "center" }}>
          <Text
            variant="bodyLarge"
            style={{
              color: theme.colors.error[600],
              marginBottom: theme.spacing[4],
              textAlign: "center",
            }}
          >
            {error}
          </Text>
          <AppButton variant="primary" size="large" onPress={fetchUser}>
            Retry
          </AppButton>
        </View>
      </BaseLayout>
    );
  }

  // ============================================================================
  // MAIN CONTENT
  // ============================================================================

  return (
    <BaseLayout gradient={["#F8FAFC", "#FFFFFF"]}>
      {/* Header */}
      <ProfileHeader />

      {/* Account Information Card */}
      <AppCard shadow padding="md" style={{ marginBottom: theme.spacing[5] }}>
        <Text
          variant="titleLarge"
          style={{
            fontWeight: "600",
            color: theme.colors.text.primary,
            marginBottom: theme.spacing[4],
          }}
        >
          Account Information
        </Text>

        <AccountInfoRow icon="user" label="Full Name" value={user?.fullName || "Not provided"} />
        <AccountInfoRow icon="mail" label="Email" value={user?.email || ""} />
        <AccountInfoRow icon="hash" label="User ID" value={`#${user?.id}`} isLast />
      </AppCard>

      {/* Motivational Banner (if active programs exist) */}
      {user?.mode === "rehab" && activeCount > 0 && (
        <MotivationalBanner activeCount={activeCount} daysSinceStart={daysSinceStart} />
      )}

      {/* My Rehab Programs Section */}
      {user?.mode === "rehab" && (
        <View>
          <Text
            variant="titleLarge"
            style={{
              fontWeight: "600",
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[3],
            }}
          >
            My Rehab Programs
          </Text>

          {programsLoading && (
            <View style={{ paddingVertical: theme.spacing[6], alignItems: "center" }}>
              <ActivityIndicator size="large" color={theme.colors.primary[600]} />
            </View>
          )}

          {!programsLoading && programs.length === 0 && (
            <AppCard
              padding="lg"
              shadow
              style={{ alignItems: "center", paddingVertical: theme.spacing[8] }}
            >
              <Text
                variant="titleMedium"
                style={{
                  fontWeight: "600",
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing[2],
                }}
              >
                No programs yet
              </Text>
              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.neutral[500],
                  textAlign: "center",
                  marginBottom: theme.spacing[4],
                }}
              >
                Start your first program to begin tracking your recovery journey
              </Text>
              <AppButton
                variant="primary"
                size="medium"
                onPress={() => router.push("/(onboarding)/welcome")}
              >
                Create Program
              </AppButton>
            </AppCard>
          )}

          {!programsLoading && programs.length > 0 && (
            <View>
              {programs.map((program, index) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  index={index}
                  onPress={() => router.push(`/rehab-home?programId=${program.id}`)}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </BaseLayout>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
});
