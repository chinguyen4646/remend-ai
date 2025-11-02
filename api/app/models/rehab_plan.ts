import { DateTime } from "luxon";
import { BaseModel, column, belongsTo } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import RehabLog from "#models/rehab_log";
import UserOnboardingProfile from "#models/user_onboarding_profile";
import type {
  ShortlistExercise,
  UserContextJson,
  AIOutputJson,
} from "#services/ai/provider_interface";
import type { PatternMappingResult } from "#services/exercises/pattern_mapper_service";
import type { AIPatternInsight } from "#models/user_onboarding_profile";

/**
 * Plan types for analytics tracking
 */
export type PlanType = "ai" | "fallback" | "manual";

/**
 * AI status tracking
 */
export type AiStatus = "pending" | "success" | "failed" | "skipped";

/**
 * Shortlist container
 */
export interface ShortlistJson {
  exercises: ShortlistExercise[];
}

/**
 * Versioned AI context for initial onboarding plans
 * Stores the AI pattern and deterministic mapping used to generate the plan
 */
export interface AIContextJson {
  version: string; // e.g., "1.0"
  pattern: AIPatternInsight;
  mapping: PatternMappingResult;
}

/**
 * AI-generated coaching feedback for adaptive plans
 * Created by GPT-4o-mini for empathetic user guidance
 */
export interface AIFeedbackJson {
  summary: string; // 1-2 sentence progress summary
  coaching: string[]; // Array of coaching tips
  caution: string | null; // Warning for worse trend, else null
}

/**
 * Trend classification for adaptive plans
 */
export type Trend = "improving" | "stable" | "worse";

// Re-export types for convenience
export type { ShortlistExercise, UserContextJson, AIOutputJson };

export default class RehabPlan extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare rehabLogId: number | null;

  // Initial onboarding plan fields
  @column()
  declare isInitial: boolean;

  @column()
  declare onboardingProfileId: number | null;

  @column()
  declare aiContextJson: AIContextJson | null;

  @column()
  declare planType: PlanType;

  @column()
  declare shortlistJson: ShortlistJson;

  @column()
  declare aiOutputJson: AIOutputJson | null;

  @column()
  declare aiStatus: AiStatus;

  @column()
  declare aiError: string | null;

  @column()
  declare userContextJson: UserContextJson;

  @column.dateTime()
  declare generatedAt: DateTime;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  // Adaptive progression fields
  @column()
  declare parentPlanId: number | null;

  @column()
  declare trend: Trend | null;

  @column()
  declare aiFeedbackJson: AIFeedbackJson | null;

  @belongsTo(() => RehabLog, {
    foreignKey: "rehabLogId",
  })
  declare log: BelongsTo<typeof RehabLog>;

  @belongsTo(() => UserOnboardingProfile, {
    foreignKey: "onboardingProfileId",
  })
  declare onboardingProfile: BelongsTo<typeof UserOnboardingProfile>;

  @belongsTo(() => RehabPlan, {
    foreignKey: "parentPlanId",
  })
  declare parentPlan: BelongsTo<typeof RehabPlan>;
}
