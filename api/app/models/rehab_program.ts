import { DateTime } from "luxon";
import { BaseModel, column, belongsTo, hasMany } from "@adonisjs/lucid/orm";
import type { BelongsTo, HasMany } from "@adonisjs/lucid/types/relations";
import User from "#models/user";
import RehabLog from "#models/rehab_log";

export default class RehabProgram extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare userId: number;

  @column()
  declare area:
    | "knee"
    | "ankle"
    | "foot"
    | "achilles"
    | "calf"
    | "hamstring"
    | "quadriceps"
    | "hip"
    | "groin"
    | "glute"
    | "lower_back"
    | "mid_back"
    | "upper_back"
    | "neck"
    | "shoulder"
    | "elbow"
    | "wrist"
    | "hand"
    | "other";

  @column()
  declare areaOtherLabel: string | null;

  @column()
  declare side: "left" | "right" | "both" | "na";

  @column.date({
    serialize: (value: DateTime | null) => value?.toISODate() ?? null,
  })
  declare startDate: DateTime;

  @column()
  declare status: "active" | "completed" | "paused";

  @column({
    prepare: (value: Record<string, any> | null) => (value ? JSON.stringify(value) : null),
    consume: (value: unknown): Record<string, any> | null => {
      if (!value) return null;

      if (typeof value === "string") {
        try {
          return JSON.parse(value) as Record<string, any>;
        } catch (err) {
          console.error("Failed to parse metadata JSON:", err);
          return null;
        }
      }

      if (typeof value === "object") {
        return value as Record<string, any>;
      }

      return null;
    },
  })
  declare metadata: Record<string, any> | null;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>;

  @hasMany(() => RehabLog, {
    foreignKey: "programId",
  })
  declare rehabLogs: HasMany<typeof RehabLog>;
}
