/**
 * PatternMapperService: Maps AI-inferred pain patterns to exercise buckets
 *
 * Pure deterministic logic - no AI calls, just rule-based mapping.
 * Ensures every pattern gets mapped to safe, appropriate exercise buckets.
 */

export interface PatternMappingInput {
  suspectedPattern: string;
  recommendedFocus: string[];
  confidence: "high" | "medium" | "low";
  area?: string; // Optional: knee, shoulder, ankle, etc.
}

export interface PatternMappingResult {
  buckets: string[];
  rationale: string[];
  confidenceLevel: "high" | "medium" | "low";
  matchedKeywords: string[];
  notes: string;
}

/**
 * Pattern matching rules
 * Each rule checks for keywords in suspected_pattern and recommended_focus
 */
interface PatternRule {
  keywords: string[]; // Keywords to match in pattern/focus
  buckets: string[]; // Bucket slugs to return
  rationale: string; // Human-readable explanation
}

const PATTERN_RULES: PatternRule[] = [
  // Knee patterns
  {
    keywords: ["quad", "patellar", "front of knee", "kneecap"],
    buckets: ["isometric_knee", "mobility_knee"],
    rationale: "Front-of-knee pattern: isometric loading + mobility",
  },
  {
    keywords: ["meniscus", "twisting", "locking", "catching"],
    buckets: ["stability_lower", "mobility_knee"],
    rationale: "Meniscus-like pattern: stability work + controlled mobility",
  },
  {
    keywords: ["hamstring"],
    buckets: ["activation_quads", "mobility_knee"],
    rationale: "Hamstring involvement: quad activation + gentle mobility",
  },

  // Ankle patterns
  {
    keywords: ["achilles", "calf", "ankle"],
    buckets: ["isometric_ankle", "mobility_ankle"],
    rationale: "Ankle/calf pattern: isometric strengthening + mobility",
  },

  // Focus-based mappings (when pattern is vague)
  {
    keywords: ["isometric", "load management"],
    buckets: ["isometric_knee", "isometric_ankle"],
    rationale: "Isometric focus: safe loading without movement",
  },
  {
    keywords: ["mobility", "range of motion", "stiffness"],
    buckets: ["mobility_knee", "mobility_ankle"],
    rationale: "Mobility focus: gentle range of motion work",
  },
  {
    keywords: ["activation", "muscle activation"],
    buckets: ["activation_quads"],
    rationale: "Activation focus: targeted muscle engagement",
  },
  {
    keywords: ["stability", "balance", "control"],
    buckets: ["stability_lower"],
    rationale: "Stability focus: balance and proprioception",
  },
];

/**
 * Fallback buckets when no pattern matches
 * Always safe, always available
 */
const FALLBACK_BUCKETS = ["mobility_general", "isometric_general"];

export default class PatternMapperService {
  /**
   * Map AI pattern to exercise buckets
   *
   * @param input - AI pattern data from onboarding
   * @returns Bucket list, rationale, and metadata
   */
  mapPattern(input: PatternMappingInput): PatternMappingResult {
    const { suspectedPattern, recommendedFocus, confidence, area } = input;

    // Combine all text to search
    const searchText = [
      suspectedPattern.toLowerCase(),
      ...recommendedFocus.map((f) => f.toLowerCase()),
      area?.toLowerCase() || "",
    ].join(" ");

    // Find matching rules
    const matchedRules: PatternRule[] = [];
    const matchedKeywords: string[] = [];

    for (const rule of PATTERN_RULES) {
      const foundKeywords = rule.keywords.filter((keyword) => searchText.includes(keyword));

      if (foundKeywords.length > 0) {
        matchedRules.push(rule);
        matchedKeywords.push(...foundKeywords);
      }
    }

    // If low confidence, restrict to conservative buckets only
    let buckets: string[] = [];
    let confidenceLevel: "high" | "medium" | "low" = confidence;
    let notes = "";

    if (matchedRules.length === 0) {
      // No matches - use fallback
      buckets = FALLBACK_BUCKETS;
      confidenceLevel = "low";
      notes = `No pattern match found - using safe defaults (${FALLBACK_BUCKETS.join(", ")})`;
    } else {
      // Combine buckets from all matched rules
      const allBuckets = new Set<string>();
      matchedRules.forEach((rule) => rule.buckets.forEach((b) => allBuckets.add(b)));
      buckets = Array.from(allBuckets);

      // If AI confidence is low, filter to conservative buckets only
      if (confidence === "low") {
        const conservativeBuckets = buckets.filter(
          (b) => b.includes("mobility") || b.includes("isometric"),
        );

        if (conservativeBuckets.length > 0) {
          buckets = conservativeBuckets;
          notes = `Low AI confidence - restricted to conservative buckets: ${conservativeBuckets.join(", ")}`;
        } else {
          // No conservative buckets found - use fallback
          buckets = FALLBACK_BUCKETS;
          notes = `Low AI confidence + no conservative buckets - using fallback: ${FALLBACK_BUCKETS.join(", ")}`;
        }
      } else {
        notes = `Matched ${matchedRules.length} rule(s) with keywords: ${matchedKeywords.join(", ")}`;
      }
    }

    // Build rationale from matched rules
    const rationale =
      matchedRules.length > 0
        ? matchedRules.map((r) => r.rationale)
        : ["Using general safe exercises - no specific pattern detected"];

    return {
      buckets,
      rationale,
      confidenceLevel,
      matchedKeywords,
      notes,
    };
  }

  /**
   * Helper: Get area-specific bucket if available
   * Falls back to general if area-specific doesn't exist
   */
  private getAreaBucket(bucketType: string, area: string): string {
    return `${bucketType}_${area}`;
  }
}
