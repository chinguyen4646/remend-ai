import { DateTime } from "luxon";
import { BaseModel, column, belongsTo } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import User from "#models/user";
import RehabProgram from "#models/rehab_program";

export default class RehabLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare userId: number;

  @column()
  declare programId: number;

  @column.date({
    serialize: (value: DateTime | string | null) => {
      if (!value) return null;
      if (typeof value === "string") return value;
      return value.toISODate();
    },
    prepare: (value: string | DateTime) =>
      typeof value === "string" ? DateTime.fromISO(value) : value,
  })
  declare date: DateTime;

  @column()
  declare pain: number;

  @column()
  declare stiffness: number;

  @column()
  declare swelling: number | null;

  @column()
  declare activityLevel: "rest" | "light" | "moderate" | "heavy" | null;

  @column()
  declare notes: string | null;

  @column({
    prepare: (value: string[] | null | undefined) =>
      value === null ? JSON.stringify([]) : JSON.stringify(value),
    consume: (value: unknown): string[] => {
      if (value === null) return [];
      if (Array.isArray(value)) return value as string[];
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? (parsed as string[]) : [];
        } catch (err) {
          console.error("Failed to parse aggravators:", err, { value });
          return [];
        }
      }
      return [];
    },
  })
  declare aggravators: string[];

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>;

  @belongsTo(() => RehabProgram, {
    foreignKey: "programId",
  })
  declare program: BelongsTo<typeof RehabProgram>;
}
