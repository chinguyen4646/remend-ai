export type Area = "knee" | "shoulder" | "back" | "hip" | "ankle" | "wrist" | "elbow" | "other";
export type Onset = "recent" | "ongoing" | "chronic";
export type Timing = "before" | "during" | "after";
export type ActivityLevel = "low" | "moderate" | "high";
export type Goal = "return_to_sport" | "walk_pain_free" | "reduce_stiffness" | "maintain_mobility";
export type RedFlag = "night_pain" | "numbness" | "trauma" | "fever" | "locking";
export type ModeSuggestion = "rehab" | "maintenance";
export type RiskLevel = "low" | "medium" | "high";

export interface OnboardingData {
  // Baseline
  area: Area;
  areaOtherLabel?: string | null;
  onset: Onset;
  painRest: number; // 0-10
  painActivity: number; // 0-10
  stiffness: number; // 0-10
  timing: Timing[];
  aggravators: string[];
  easers: string[];
  activityLevel: ActivityLevel;

  // Goal
  goal: Goal;

  // Safety
  redFlags: RedFlag[];
}

export interface OnboardingSubmission extends OnboardingData {
  modeSelected: ModeSuggestion;
}

export interface OnboardingProfile {
  id: number;
  modeSuggestion: ModeSuggestion;
  modeSelected: ModeSuggestion;
  riskLevel: RiskLevel;
  reasoning: string;
}
