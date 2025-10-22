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

  @column({
    prepare: (value: ShortlistJson | null | undefined) =>
      value === null ? null : JSON.stringify(value),
    consume: (value: unknown): ShortlistJson | null => {
      if (value === null) return null;
      if (typeof value === "object") return value as ShortlistJson;
      if (typeof value === "string") {
        try {
          return JSON.parse(value) as ShortlistJson;
        } catch (err) {
          console.error("Failed to parse shortlistJson:", err, { value });
          return null;
        }
      }
      return null;
    },
  })
  declare shortlistJson: ShortlistJson | null;

  @column({
    prepare: (value: AIOutputJson | null | undefined) =>
      value === null ? null : JSON.stringify(value),
    consume: (value: unknown): AIOutputJson | null => {
      if (value === null) return null;
      if (typeof value === "object") return value as AIOutputJson;
      if (typeof value === "string") {
        try {
          return JSON.parse(value) as AIOutputJson;
        } catch (err) {
          console.error("Failed to parse aiOutputJson:", err, { value });
          return null;
        }
      }
      return null;
    },
  })
  declare aiOutputJson: AIOutputJson | null;
  @column()
  declare aiStatus: AiStatus;

  @column()
  declare aiError: string | null;

  @column({
    prepare: (value: UserContextJson | null | undefined) =>
      value === null ? null : JSON.stringify(value),
    consume: (value: unknown): UserContextJson | null => {
      if (value === null) return null;
      if (typeof value === "object") return value as UserContextJson;
      if (typeof value === "string") {
        try {
          return JSON.parse(value) as UserContextJson;
        } catch (err) {
          console.error("Failed to parse userContextJson:", err, { value });
          return null;
        }
      }
      return null;
    },
  })
  declare userContextJson: UserContextJson | null;

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
