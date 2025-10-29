import { DateTime } from "luxon";
import { BaseModel, column, belongsTo } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import User from "#models/user";

export type ModeSuggestion = "rehab" | "maintenance";
export type RiskLevel = "low" | "medium" | "high";

// Onboarding v2 data structure
export interface OnboardingData {
  // Screen 1: Area
  area:
    | "knee"
    | "shoulder"
    | "lower_back"
    | "upper_back"
    | "ankle"
    | "hip"
    | "wrist"
    | "elbow"
    | "other";
  areaOtherLabel?: string;

  // Screen 2: Description (stored separately in userDescription column)
  // userDescription is NOT in data JSONB, it has its own column
  redFlags: string[]; // night_pain, numbness, trauma, fever, locking

  // Screen 3: Duration & Intensity
  onset: "recent" | "1-3months" | "3plus" | "incident";
  painRest: number; // 0-10
  painActivity: number; // 0-10
  stiffness: number; // 0-10

  // Screen 4: Aggravators & Easers
  aggravators: string[];
  easers: string[];
}

// AI Pattern Insight structure (versioned for future-proofing)
export interface AIPatternInsight {
  version: string; // e.g., "1.0"
  data: {
    suspected_pattern: string;
    reasoning: string[];
    recommended_focus: string[];
    reassurance: string;
    caution: string | null;
    confidence: "high" | "medium" | "low";
    suggested_side?: "left" | "right" | "both" | "na";
  };
}

export default class UserOnboardingProfile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare userId: number;

  @column()
  declare data: OnboardingData;

  // V2 columns: dedicated storage for description and AI insights
  @column()
  declare userDescription: string | null;

  @column()
  declare aiPatternJson: AIPatternInsight | null;

  @column()
  declare areaOtherLabel: string | null;

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
