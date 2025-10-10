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
    serialize: (value: DateTime | null) => value?.toISODate() ?? null,
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
