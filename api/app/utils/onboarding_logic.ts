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
 * NOTE: Currently always returns "rehab" as maintenance and general modes are disabled.
 * Original logic preserved in comments for future re-enablement.
 */
export function computeModeSuggestion(data: OnboardingData): OnboardingSuggestion {
  const { painRest, onset, redFlags } = data;

  // Determine risk level for rehab mode
  let riskLevel: RiskLevel;
  let reasoning: string;

  // High risk: Red flags present
  if (redFlags && redFlags.length > 0) {
    riskLevel = "high";
    reasoning = `You reported ${redFlags.length} red flag${redFlags.length > 1 ? "s" : ""} that may need professional assessment`;
  }
  // Medium risk: High pain or recent/ongoing onset
  else if (painRest >= 4 || onset === "recent" || onset === "ongoing") {
    riskLevel = "medium";
    const reasons = [];
    if (painRest >= 4) reasons.push(`pain at rest: ${painRest}/10`);
    if (onset === "recent") reasons.push("recent onset");
    if (onset === "ongoing") reasons.push("ongoing symptoms");
    reasoning = `Based on your ${reasons.join(" and ")}`;
  }
  // Low risk: Everything else
  else {
    riskLevel = "low";
    reasoning = "We recommend structured rehab tracking to support your recovery";
  }

  return {
    modeSuggestion: "rehab",
    riskLevel,
    reasoning,
  };

  /* ORIGINAL LOGIC - Preserved for when maintenance mode is re-enabled:

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

  // Default fallback
  return {
    modeSuggestion: "maintenance",
    riskLevel: "low",
    reasoning: "Based on your overall profile",
  };
  */
}
