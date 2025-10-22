import { DateTime } from "luxon";
import { BaseModel, column, belongsTo } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import RehabLog from "#models/rehab_log";
import type {
  ShortlistExercise,
  UserContextJson,
  AIOutputJson,
} from "#services/ai/provider_interface";

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

// Re-export types for convenience
export type { ShortlistExercise, UserContextJson, AIOutputJson };

export default class RehabPlan extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare rehabLogId: number;

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

  @belongsTo(() => RehabLog, {
    foreignKey: "rehabLogId",
  })
  declare log: BelongsTo<typeof RehabLog>;
}
