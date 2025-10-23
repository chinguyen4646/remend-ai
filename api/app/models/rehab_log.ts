import { DateTime } from "luxon";
import { BaseModel, column, belongsTo, hasOne } from "@adonisjs/lucid/orm";
import type { BelongsTo, HasOne } from "@adonisjs/lucid/types/relations";
import User from "#models/user";
import RehabProgram from "#models/rehab_program";
import RehabPlan from "#models/rehab_plan";

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
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string | string[]) => {
      if (typeof value === "string") return JSON.parse(value);
      return value;
    },
    serialize: (value: string[]) => value,
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

  @hasOne(() => RehabPlan, {
    foreignKey: "rehabLogId",
  })
  declare plan: HasOne<typeof RehabPlan>;
}
