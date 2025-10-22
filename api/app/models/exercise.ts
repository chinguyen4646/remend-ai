import { DateTime } from "luxon";
import { BaseModel, column, belongsTo } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import ExerciseBucket from "#models/exercise_bucket";

/**
 * Dosage JSON structure (hybrid format)
 * Stored as JSON for programmatic access, formatted as text for display
 */
export interface DosageJson {
  sets?: number;
  reps?: number;
  hold_seconds?: number;
  time_seconds?: number;
  rest_seconds?: number;
  notes?: string;
}

export default class Exercise extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare bucketId: number;

  @column()
  declare name: string;

  @column()
  declare description: string | null;

  @column()
  declare dosageLowJson: DosageJson;

  @column()
  declare dosageModJson: DosageJson;

  @column()
  declare safetyNotes: string | null;

  @column()
  declare isActive: boolean;

  @column()
  declare sortOrder: number;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @belongsTo(() => ExerciseBucket, {
    foreignKey: "bucketId",
  })
  declare bucket: BelongsTo<typeof ExerciseBucket>;
}
