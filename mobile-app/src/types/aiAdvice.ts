/**
 * AI-generated rehabilitation advice response
 */
export interface AIAdvice {
  /**
   * 1-3 sentence summary of observations
   * Early mode: Brief observation, no trend
   * Full mode: Trend analysis over time
   */
  summary: string;

  /**
   * Actionable recommendations
   * Early mode: 1-2 conservative suggestions
   * Full mode: Exactly 3 specific actions
   */
  actions: string[];

  /**
   * Safety warning if pain is worsening significantly
   * Early mode: Always empty (not enough data)
   * Full mode: Non-empty if pain increased >2 points
   */
  caution: string;
}

/**
 * Cached AI advice with metadata
 * Stored in AsyncStorage to prevent redundant API calls
 */
export interface CachedAdvice {
  /**
   * The AI-generated advice
   */
  advice: AIAdvice;

  /**
   * Date of the most recent log used for this advice
   * Format: YYYY-MM-DD
   * Used to determine if cache is stale
   */
  asOfDate: string;

  /**
   * Program ID this advice belongs to
   */
  programId: number;

  /**
   * Timestamp when advice was generated
   * Used for TTL checks (7 days)
   */
  generatedAt: number;
}

/**
 * API error response for AI advice endpoint
 */
export interface AIAdviceError {
  message: string;
  code?: "AI_DISABLED" | "NO_LOGS" | "RATE_LIMIT" | "UNKNOWN";
}
