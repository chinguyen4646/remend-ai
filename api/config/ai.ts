import env from "#start/env";

const aiConfig = {
  /**
   * Feature flag to enable/disable AI feedback
   * Set via AI_ENABLED environment variable
   */
  enabled: env.get("AI_ENABLED", false),

  /**
   * OpenAI API configuration
   */
  openai: {
    apiKey: env.get("OPENAI_API_KEY", ""),
    model: "gpt-4o-mini", // Fast, cheap, good enough for MVP
    temperature: 0.3, // Deterministic but not robotic
    maxTokens: 500, // Keep responses concise
    timeout: 10000, // 10 seconds max
  },

  /**
   * Deduplication cache TTL (milliseconds)
   * Prevents redundant LLM calls for the same request
   */
  cacheTtl: 5 * 60 * 1000, // 5 minutes
};

export default aiConfig;
