import { DateTime } from "luxon";
import hash from "@adonisjs/core/services/hash";
import { compose } from "@adonisjs/core/helpers";
import { BaseModel, column, hasMany } from "@adonisjs/lucid/orm";
import { withAuthFinder } from "@adonisjs/auth/mixins/lucid";
import { DbAccessTokensProvider } from "@adonisjs/auth/access_tokens";
import type { HasMany } from "@adonisjs/lucid/types/relations";
import RehabProgram from "#models/rehab_program";
import RehabLog from "#models/rehab_log";
import WellnessLog from "#models/wellness_log";

const AuthFinder = withAuthFinder(() => hash.use("scrypt"), {
  uids: ["email"],
  passwordColumnName: "password",
});

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare fullName: string | null;

  @column()
  declare email: string;

  @column({ serializeAs: null })
  declare password: string;

  @column()
  declare mode: "rehab" | "maintenance" | "general" | null;

  @column()
  declare injuryType: string | null;

  @column.dateTime()
  declare modeStartedAt: DateTime | null;

  @column()
  declare tz: string;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null;

  @hasMany(() => RehabProgram)
  declare rehabPrograms: HasMany<typeof RehabProgram>;

  @hasMany(() => RehabLog)
  declare rehabLogs: HasMany<typeof RehabLog>;

  @hasMany(() => WellnessLog)
  declare wellnessLogs: HasMany<typeof WellnessLog>;

  static accessTokens = DbAccessTokensProvider.forModel(User);
}
