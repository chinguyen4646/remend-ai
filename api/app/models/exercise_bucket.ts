import { DateTime } from "luxon";
import { BaseModel, column, hasMany } from "@adonisjs/lucid/orm";
import type { HasMany } from "@adonisjs/lucid/types/relations";
import Exercise from "#models/exercise";

export default class ExerciseBucket extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare area: string; // knee, shoulder, back, etc.

  @column()
  declare slug: string; // mobility_knee, activation_quads, etc.

  @column()
  declare label: string; // Knee Mobility, Quad Activation, etc.

  @column()
  declare isActive: boolean;

  @column()
  declare sortOrder: number;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @hasMany(() => Exercise, {
    foreignKey: "bucketId",
  })
  declare exercises: HasMany<typeof Exercise>;
}
