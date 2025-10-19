import type { OnboardingData } from "#models/user_onboarding_profile";
import type { ModeSuggestion, RiskLevel } from "#models/user_onboarding_profile";

export interface OnboardingSuggestion {
  modeSuggestion: ModeSuggestion;
  riskLevel: RiskLevel;
  reasoning: string;
}

/**
 * Computes mode suggestion and risk level based on deterministic rules
 *
 * Rules:
 * - Any red flag → Rehab (high risk)
 * - pain_rest ≥ 4 OR onset in [recent, ongoing] → Rehab (medium risk)
 * - pain_rest ≤ 3 AND onset = chronic → Maintenance (low risk)
 */
export function computeModeSuggestion(data: OnboardingData): OnboardingSuggestion {
  const { painRest, onset, redFlags } = data;

  // Rule 1: Red flags → Rehab (high risk)
  if (redFlags && redFlags.length > 0) {
    return {
      modeSuggestion: "rehab",
      riskLevel: "high",
      reasoning: `You reported ${redFlags.length} red flag${redFlags.length > 1 ? "s" : ""} that may need professional assessment`,
    };
  }

  // Rule 2: High pain or recent/ongoing onset → Rehab (medium risk)
  if (painRest >= 4 || onset === "recent" || onset === "ongoing") {
    const reasons = [];
    if (painRest >= 4) reasons.push(`pain at rest: ${painRest}/10`);
    if (onset === "recent") reasons.push("recent onset");
    if (onset === "ongoing") reasons.push("ongoing symptoms");

    return {
      modeSuggestion: "rehab",
      riskLevel: "medium",
      reasoning: `Based on your ${reasons.join(" and ")}`,
    };
  }

  // Rule 3: Low pain and chronic → Maintenance (low risk)
  if (painRest <= 3 && onset === "chronic") {
    return {
      modeSuggestion: "maintenance",
      riskLevel: "low",
      reasoning: "Your symptoms are manageable and long-standing",
    };
  }

  // Default fallback (should not normally reach here)
  return {
    modeSuggestion: "maintenance",
    riskLevel: "low",
    reasoning: "Based on your overall profile",
  };
}
