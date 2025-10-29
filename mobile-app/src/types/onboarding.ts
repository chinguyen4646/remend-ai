// Onboarding V2 Types

export type Area =
  | "knee"
  | "shoulder"
  | "lower_back"
  | "upper_back"
  | "hip"
  | "ankle"
  | "wrist"
  | "elbow"
  | "other";

export type Onset = "recent" | "1-3months" | "3plus" | "incident";

export type RedFlag = "night_pain" | "numbness" | "trauma" | "fever" | "locking";

export type ModeSuggestion = "rehab" | "maintenance";

export type RiskLevel = "low" | "medium" | "high";

export type BodySide = "left" | "right" | "both" | "na";

// Onboarding V2 Data Structure
export interface OnboardingData {
  // Screen 1: Area
  area: Area;
  areaOtherLabel?: string | null;

  // Screen 2: Description
  userDescription: string;
  redFlags: RedFlag[];

  // Screen 3: Duration & Intensity
  onset: Onset;
  painRest: number; // 0-10
  painActivity: number; // 0-10
  stiffness: number; // 0-10

  // Screen 4: Aggravators & Easers
  aggravators: string[];
  easers: string[];
}

export interface OnboardingSubmission extends OnboardingData {
  modeSelected: ModeSuggestion;
}

// AI Pattern Insight (versioned for future-proofing)
export interface AIPatternInsight {
  version: string; // e.g., "1.0"
  data: {
    suspected_pattern: string;
    reasoning: string[];
    recommended_focus: string[];
    reassurance: string;
    caution: string | null;
    confidence: "high" | "medium" | "low";
    suggested_side?: BodySide;
  };
}

export interface OnboardingProfile {
  id: number;
  modeSuggestion: ModeSuggestion;
  modeSelected: ModeSuggestion;
  riskLevel: RiskLevel;
  reasoning: string;
  data: OnboardingData;
  userDescription?: string | null; // V2
  areaOtherLabel?: string | null; // V2
  aiPatternJson?: AIPatternInsight | null; // V2
  onboardingVersion: number;
  createdAt: string;
}
