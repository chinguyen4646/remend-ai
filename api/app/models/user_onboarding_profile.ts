import { DateTime } from "luxon";
import { BaseModel, column, belongsTo } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import User from "#models/user";

export type ModeSuggestion = "rehab" | "maintenance";
export type RiskLevel = "low" | "medium" | "high";

export interface OnboardingData {
  area: string; // knee, shoulder, back, other
  areaOtherLabel?: string; // if area = 'other'
  onset: string; // recent, ongoing, chronic
  painRest: number; // 0-10
  painActivity: number; // 0-10
  stiffness: number; // 0-10
  timing: string[]; // before, during, after
  aggravators: string[];
  easers: string[];
  activityLevel: string; // low, moderate, high
  goal: string; // return_to_sport, walk_pain_free, reduce_stiffness, maintain_mobility

  redFlags: string[]; // night_pain, numbness, trauma, fever, locking
}

export default class UserOnboardingProfile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare userId: number;

  @column({
    prepare: (value: OnboardingData) => JSON.stringify(value),
    consume: (value: unknown): OnboardingData => {
      if (typeof value === "string") {
        try {
          return JSON.parse(value) as OnboardingData;
        } catch (err) {
          console.error("Failed to parse onboarding data JSON:", err);
          return {} as OnboardingData;
        }
      }

      if (value && typeof value === "object") {
        return value as OnboardingData;
      }

      return {} as OnboardingData;
    },
  })
  declare data: OnboardingData;

  @column()
  declare modeSuggestion: ModeSuggestion;

  @column()
  declare modeSelected: ModeSuggestion;

  @column()
  declare riskLevel: RiskLevel;

  @column()
  declare reasoning: string;

  @column()
  declare onboardingVersion: number;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>;
}
