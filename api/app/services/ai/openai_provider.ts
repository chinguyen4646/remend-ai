import OpenAI from "openai";
import type {
  AIProvider,
  AIAdvice,
  FeedbackMode,
  ShortlistExercise,
  UserContextJson,
  AIOutputJson,
  OnboardingDataForAI,
  AIOnboardingInsight,
} from "./provider_interface.js";
import type RehabLog from "#models/rehab_log";
import { buildEarlySnapshotPrompt, buildFullFeedbackPrompt } from "./prompt_builder.js";
import aiConfig from "#config/ai";
import logger from "@adonisjs/core/services/logger";

/**
 * OpenAI GPT implementation of AIProvider
 * Uses gpt-4o-mini with JSON mode for structured output
 */
export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: aiConfig.openai.apiKey,
      timeout: aiConfig.openai.timeout,
    });
  }

  async getRehabAdvice(logs: RehabLog[], mode: FeedbackMode): Promise<AIAdvice> {
    const prompt =
      mode === "early" ? buildEarlySnapshotPrompt(logs) : buildFullFeedbackPrompt(logs);

    try {
      const startTime = Date.now();

      const completion = await this.client.chat.completions.create({
        model: aiConfig.openai.model,
        temperature: aiConfig.openai.temperature,
        max_tokens: aiConfig.openai.maxTokens,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: prompt,
          },
        ],
      });

      const duration = Date.now() - startTime;
      const content = completion.choices[0]?.message?.content;

      if (!content) {
        logger.error("OpenAI returned empty response");
        throw new Error("Empty response from AI");
      }

      // Parse and validate JSON response
      const parsed = JSON.parse(content);
      const advice = this.validateAdvice(parsed, mode);

      logger.info(
        {
          mode,
          logCount: logs.length,
          duration,
          tokens: completion.usage?.total_tokens,
        },
        "AI advice generated successfully",
      );

      return advice;
    } catch (error) {
      logger.error({ error: error.message, mode }, "Failed to get AI advice");

      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw new Error("AI service rate limit exceeded. Please try again in a moment.");
        }
        if (error.status === 401) {
          throw new Error("AI service authentication failed. Please contact support.");
        }
      }

      throw new Error("Unable to generate AI advice. Please try again later.");
    }
  }

  /**
   * Format exercise plan with AI coaching
   */
  async formatExercisePlan(
    shortlist: ShortlistExercise[],
    userContext: UserContextJson,
  ): Promise<AIOutputJson> {
    try {
      const startTime = Date.now();
      const prompt = this.buildPlanPrompt(shortlist, userContext);

      const completion = await this.client.chat.completions.create({
        model: aiConfig.openai.model,
        temperature: 0.5, // Slightly higher for empathy/variety
        max_tokens: 800, // More tokens for coaching
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: prompt,
          },
        ],
      });

      const duration = Date.now() - startTime;
      const content = completion.choices[0]?.message?.content;

      if (!content) {
        logger.error("OpenAI returned empty response for plan formatting");
        throw new Error("Empty response from AI");
      }

      // Parse and validate JSON response
      const parsed = JSON.parse(content);
      const aiOutput = this.validatePlanOutput(parsed, shortlist);

      logger.info(
        {
          exerciseCount: shortlist.length,
          duration,
          tokens: completion.usage?.total_tokens,
        },
        "Plan formatted successfully with AI",
      );

      return aiOutput;
    } catch (error) {
      logger.error({ error: error.message }, "Failed to format plan with AI");

      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw new Error("AI service rate limit exceeded. Please try again in a moment.");
        }
        if (error.status === 401) {
          throw new Error("AI service authentication failed. Please contact support.");
        }
      }

      throw new Error("Unable to format plan. Please try again later.");
    }
  }

  /**
   * Validate and sanitize AI response
   * Ensures response matches expected schema and constraints
   */
  private validateAdvice(parsed: any, mode: FeedbackMode): AIAdvice {
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid JSON structure from AI");
    }

    const { summary, actions, caution } = parsed;

    // Validate summary
    if (!summary || typeof summary !== "string" || summary.trim().length === 0) {
      throw new Error("Invalid or missing summary in AI response");
    }

    // Validate actions
    if (!Array.isArray(actions) || actions.length === 0) {
      throw new Error("Invalid or missing actions in AI response");
    }

    // Check action count based on mode
    if (mode === "early" && actions.length > 2) {
      logger.warn("Early snapshot returned more than 2 actions, truncating");
      actions.length = 2;
    } else if (mode === "full" && actions.length !== 3) {
      logger.warn(`Full feedback returned ${actions.length} actions instead of 3`);
      // Pad or truncate to exactly 3
      if (actions.length < 3) {
        actions.push("Continue monitoring your symptoms and adjusting as needed");
      } else {
        actions.length = 3;
      }
    }

    // Validate caution (should be empty for early mode)
    const validatedCaution = typeof caution === "string" ? caution.trim() : "";

    return {
      summary: summary.trim(),
      actions: actions.map((a: any) => String(a).trim()).filter(Boolean),
      caution: validatedCaution,
    };
  }

  /**
   * Build prompt for exercise plan formatting
   */
  private buildPlanPrompt(shortlist: ShortlistExercise[], userContext: UserContextJson): string {
    const exerciseList = shortlist
      .map(
        (ex, idx) =>
          `${idx + 1}. **${ex.name}** (ID: ${ex.id}) - ${ex.bucket}\n   - Dosage: ${ex.dosage_text}\n   - Safety: ${ex.safety_notes || "N/A"}`,
      )
      .join("\n");

    return `You are a supportive physical therapy assistant. Your job is to format an exercise plan for a patient recovering from injury.

**User Context:**
- Recent notes: "${userContext.notes || "None"}"
- Aggravators: ${userContext.aggravators.length > 0 ? userContext.aggravators.join(", ") : "None reported"}
- Pain trend: ${userContext.trend_summary}

**Shortlisted Exercises (pre-selected for safety):**
${exerciseList}

**Your Task:**
Generate a JSON response with the following structure:

{
  "summary": "A 2-3 sentence empathetic summary that acknowledges the user's context and motivates them. Reference their notes or pain trend if relevant.",
  "bullets": [
    {
      "exercise_id": 123,
      "exercise_name": "Exercise Name",
      "dosage_text": "Exact dosage from shortlist (do not modify)",
      "coaching": "1-2 sentences of supportive coaching tips for this exercise"
    }
  ],
  "caution": "Optional: Add a caution note if user's aggravators or pain level warrant extra care"
}

**CRITICAL Guidelines:**
- Use the EXACT exercise_id values shown in the shortlist above (e.g., "ID: 123" means exercise_id should be 123)
- Include ALL exercises from the shortlist in your bullets array
- Summary must reference user context (notes, aggravators, or trend)
- Coaching should be warm, encouraging, and specific to each exercise
- Do NOT invent new exercises or modify dosages - use exact values from shortlist
- Keep tone conversational but professional
- Caution is optional - only add if truly needed based on context

Return only valid JSON.`;
  }

  /**
   * Validate and sanitize plan output from AI
   */
  private validatePlanOutput(parsed: any, shortlist: ShortlistExercise[]): AIOutputJson {
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid JSON structure from AI");
    }

    const { summary, bullets, caution } = parsed;

    // Validate summary
    if (!summary || typeof summary !== "string" || summary.trim().length === 0) {
      throw new Error("Invalid or missing summary in AI response");
    }

    // Validate bullets
    if (!Array.isArray(bullets) || bullets.length === 0) {
      throw new Error("Invalid or missing bullets in AI response");
    }

    // Ensure bullets match shortlist (by exercise_id)
    const validatedBullets = bullets
      .map((bullet: any) => {
        const matchingExercise = shortlist.find((ex) => ex.id === bullet.exercise_id);
        if (!matchingExercise) {
          logger.warn(
            { bulletId: bullet.exercise_id },
            "AI returned bullet for non-shortlisted exercise, skipping",
          );
          return null;
        }

        return {
          exercise_id: matchingExercise.id,
          exercise_name: matchingExercise.name,
          dosage_text: matchingExercise.dosage_text, // Use original, not AI's
          coaching: typeof bullet.coaching === "string" ? bullet.coaching.trim() : "",
        };
      })
      .filter(Boolean);

    if (validatedBullets.length === 0) {
      throw new Error("No valid bullets after validation");
    }

    // Validate caution
    const validatedCaution =
      typeof caution === "string" && caution.trim().length > 0 ? caution.trim() : undefined;

    return {
      summary: summary.trim(),
      bullets: validatedBullets as any,
      caution: validatedCaution,
    };
  }

  /**
   * Get onboarding insight from pain description and data
   * Analyzes user's pain description and provides pattern insight
   * with 10-second timeout
   */
  async getOnboardingInsight(data: OnboardingDataForAI): Promise<AIOnboardingInsight> {
    try {
      const startTime = Date.now();
      const prompt = this.buildOnboardingPrompt(data);

      const completion = await this.client.chat.completions.create({
        model: aiConfig.openai.model,
        temperature: 0.3, // Deterministic for consistency
        max_tokens: 500, // Concise responses
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a cautious, supportive physiotherapy assistant.
Analyze the user's pain description and data.
Infer the most likely pain pattern (non-diagnostic, educational only).
Suggest which body side is affected if mentioned in the description.
Return safe, conservative recommendations.

CRITICAL: This is educational guidance only, NOT medical diagnosis.
Your tone should be supportive and reassuring, never authoritative or diagnostic.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const duration = Date.now() - startTime;
      const content = completion.choices[0]?.message?.content;

      if (!content) {
        logger.error("OpenAI returned empty response for onboarding insight");
        throw new Error("Empty response from AI");
      }

      // Parse and validate JSON response
      const parsed = JSON.parse(content);
      const insight = this.validateOnboardingInsight(parsed);

      logger.info(
        {
          area: data.area,
          duration,
          tokens: completion.usage?.total_tokens,
          confidence: insight.confidence,
        },
        "Onboarding insight generated successfully",
      );

      return insight;
    } catch (error) {
      logger.error({ error: error.message, area: data.area }, "Failed to get onboarding insight");

      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw new Error("AI service rate limit exceeded. Please try again in a moment.");
        }
        if (error.status === 401) {
          throw new Error("AI service authentication failed. Please contact support.");
        }
      }

      throw new Error("Unable to generate onboarding insight. Please try again later.");
    }
  }

  /**
   * Build prompt for onboarding insight
   */
  private buildOnboardingPrompt(data: OnboardingDataForAI): string {
    const areaLabel = data.areaOtherLabel
      ? `${data.area} (${data.areaOtherLabel})`
      : data.area.replace("_", " ");

    return `
User's pain description: "${data.userDescription}"

Pain levels:
- At rest: ${data.painRest}/10
- During activity: ${data.painActivity}/10
- Stiffness: ${data.stiffness}/10

Duration: ${data.onset}
Body area: ${areaLabel}

Makes it worse: ${data.aggravators.length > 0 ? data.aggravators.join(", ") : "none specified"}
Helps: ${data.easers.length > 0 ? data.easers.join(", ") : "none specified"}
Red flags: ${data.redFlags.length > 0 ? data.redFlags.join(", ") : "none"}

Return JSON with:
{
  "suspected_pattern": "friendly name for the likely pain pattern (e.g., 'front-of-knee load sensitivity')",
  "reasoning": ["key observation 1", "key observation 2", "key observation 3"],
  "recommended_focus": ["focus area 1 (e.g., 'gentle activation')", "focus area 2 (e.g., 'mobility')"],
  "reassurance": "brief reassuring message (1-2 sentences)",
  "caution": "brief caution if needed (e.g., 'Avoid deep squats if painful'), or null",
  "confidence": "high" | "medium" | "low",
  "suggested_side": "left" | "right" | "both" | "na" (extract from description if mentioned, otherwise null)
}

Guidelines:
- Pattern name should be non-clinical and understandable (avoid medical jargon)
- Reasoning should be clear observations from the data
- Recommended focus should be actionable categories (e.g., "isometrics", "mobility", "load management")
- Reassurance should be warm and encouraging
- Only add caution if red flags or high pain levels warrant it
- Confidence should reflect how clear the pattern is from the description
- Extract side from description if user mentions "left", "right", "both sides", etc.

Return only valid JSON.
`.trim();
  }

  /**
   * Validate and sanitize onboarding insight from AI
   */
  private validateOnboardingInsight(parsed: any): AIOnboardingInsight {
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid JSON structure from AI");
    }

    const {
      suspected_pattern,
      reasoning,
      recommended_focus,
      reassurance,
      caution,
      confidence,
      suggested_side,
    } = parsed;

    // Validate required fields
    if (
      !suspected_pattern ||
      typeof suspected_pattern !== "string" ||
      suspected_pattern.trim().length === 0
    ) {
      throw new Error("Invalid or missing suspected_pattern in AI response");
    }

    if (!Array.isArray(reasoning) || reasoning.length === 0) {
      throw new Error("Invalid or missing reasoning in AI response");
    }

    if (!Array.isArray(recommended_focus) || recommended_focus.length === 0) {
      throw new Error("Invalid or missing recommended_focus in AI response");
    }

    if (!reassurance || typeof reassurance !== "string" || reassurance.trim().length === 0) {
      throw new Error("Invalid or missing reassurance in AI response");
    }

    if (!["high", "medium", "low"].includes(confidence)) {
      throw new Error("Invalid confidence level in AI response");
    }

    // Validate optional side suggestion
    const validSides = ["left", "right", "both", "na"];
    const validatedSide =
      suggested_side && validSides.includes(suggested_side) ? suggested_side : undefined;

    // Validate caution (can be null or string)
    const validatedCaution =
      caution && typeof caution === "string" && caution.trim().length > 0 ? caution.trim() : null;

    return {
      suspected_pattern: suspected_pattern.trim(),
      reasoning: reasoning.map((r: any) => String(r).trim()).filter(Boolean),
      recommended_focus: recommended_focus.map((f: any) => String(f).trim()).filter(Boolean),
      reassurance: reassurance.trim(),
      caution: validatedCaution,
      confidence,
      suggested_side: validatedSide,
    };
  }
}

// Export singleton instance
export default new OpenAIProvider();
