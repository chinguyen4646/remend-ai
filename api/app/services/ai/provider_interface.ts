import type RehabLog from "#models/rehab_log";
import type { DosageJson } from "#models/exercise";

/**
 * AI Advice structure returned by providers
 */
export interface AIAdvice {
  /**
   * 2-3 sentence summary of progress/trend
   * For early snapshot (1-2 logs): brief observation without trend analysis
   * For full feedback (3+ logs): clear trend with context
   */
  summary: string;

  /**
   * Actionable recommendations
   * Early snapshot: 1-2 actions
   * Full feedback: exactly 3 actions
   */
  actions: string[];

  /**
   * Warning/caution note (only for full feedback when worsening)
   * Empty string if no concerns
   */
  caution: string;
}

/**
 * Feedback mode determines prompt strategy
 * - early: 1-2 logs, no trend analysis, conservative advice
 * - full: 3+ logs, trend analysis, comprehensive feedback
 */
export type FeedbackMode = "early" | "full";

/**
 * Shortlist exercise from DB rules
 */
export interface ShortlistExercise {
  id: number;
  name: string;
  bucket: string;
  dosage_json: DosageJson;
  dosage_text: string; // Pre-formatted for display
  safety_notes?: string;
}

/**
 * User context for plan transparency
 */
export interface UserContextJson {
  notes: string;
  aggravators: string[];
  trend_summary: string;
}

/**
 * AI-formatted plan bullet
 */
export interface AIPlanBullet {
  exercise_id: number;
  exercise_name: string;
  dosage_text: string;
  coaching: string;
}

/**
 * AI output structure for exercise plans
 */
export interface AIOutputJson {
  summary: string;
  bullets: AIPlanBullet[];
  caution?: string;
}

/**
 * Onboarding data structure for AI analysis
 */
export interface OnboardingDataForAI {
  area: string;
  areaOtherLabel?: string;
  userDescription: string;
  onset: string;
  painRest: number;
  painActivity: number;
  stiffness: number;
  aggravators: string[];
  easers: string[];
  redFlags: string[];
}

/**
 * AI Pattern Insight (unwrapped data, without version wrapper)
 */
export interface AIOnboardingInsight {
  suspected_pattern: string;
  reasoning: string[];
  recommended_focus: string[];
  reassurance: string;
  caution: string | null;
  confidence: "high" | "medium" | "low";
  suggested_side?: "left" | "right" | "both" | "na";
}

/**
 * Provider interface for AI services
 * Allows swapping OpenAI → Claude/Gemini/etc. later
 */
export interface AIProvider {
  /**
   * Get rehab advice based on log history
   * @param logs - Rehab logs (sorted by date, most recent first)
   * @param mode - Feedback mode (early or full)
   * @returns Structured advice
   */
  getRehabAdvice(logs: RehabLog[], mode: FeedbackMode): Promise<AIAdvice>;

  /**
   * Format exercise plan with AI coaching
   * @param shortlist - Deterministic shortlist from DB
   * @param userContext - User notes/aggravators/trend for context
   * @returns Formatted plan with coaching tips
   */
  formatExercisePlan(
    shortlist: ShortlistExercise[],
    userContext: UserContextJson,
  ): Promise<AIOutputJson>;

  /**
   * Get onboarding insight from pain description and data
   * @param data - Onboarding data from user input
   * @returns AI-generated pattern insight
   * @throws Error on timeout (10s) or API failure
   */
  getOnboardingInsight(data: OnboardingDataForAI): Promise<AIOnboardingInsight>;
}
