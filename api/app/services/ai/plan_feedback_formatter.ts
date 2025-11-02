/**
 * PlanFeedbackFormatter: Generate AI coaching feedback for adaptive plans
 *
 * Purpose:
 * - Generate empathetic coaching feedback using GPT-4o-mini
 * - Summarize progress trend and provide actionable tips
 * - Add caution warnings for worsening trends
 * - Fallback to canned responses if AI fails
 *
 * NOT used for exercise selection - only for formatting feedback
 */

import OpenAI from "openai";
import aiConfig from "#config/ai";
import logger from "@adonisjs/core/services/logger";
import type { Trend, AIFeedbackJson } from "#models/rehab_plan";
import type { TrendAnalysis } from "#services/exercises/progression_service";

/**
 * Input for feedback generation
 */
export interface FeedbackInput {
  trend: Trend;
  trendAnalysis: TrendAnalysis;
  exerciseCount: number;
  buckets: string[];
  userNotes?: string;
}

/**
 * Canned responses for fallback (when AI fails or is disabled)
 */
const CANNED_RESPONSES: Record<Trend, AIFeedbackJson> = {
  improving: {
    summary: "Great progress! Your pain and stiffness levels are trending down.",
    coaching: [
      "Continue with consistent exercise - you're building momentum",
      "Listen to your body and maintain good form on all movements",
      "Gradually increase activity as symptoms allow",
    ],
    caution: null,
  },
  stable: {
    summary: "You're maintaining steady progress - consistency is key.",
    coaching: [
      "Keep up your exercise routine to maintain gains",
      "Try to be consistent with timing and form",
      "Small improvements add up over time",
    ],
    caution: null,
  },
  worse: {
    summary: "Your symptoms have increased slightly - let's adjust your approach.",
    coaching: [
      "Focus on gentle movements and avoid aggravating activities",
      "Prioritize rest and recovery between sessions",
      "If pain persists or worsens, consult your healthcare provider",
    ],
    caution:
      "Your pain or stiffness has increased. We've adjusted your plan to be more conservative. If symptoms continue to worsen, please consult a healthcare professional.",
  },
};

export default class PlanFeedbackFormatter {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: aiConfig.openai.apiKey,
      timeout: aiConfig.openai.timeout,
    });
  }

  /**
   * Generate coaching feedback for adaptive plan
   *
   * @param input - Trend analysis and plan metadata
   * @returns AI-generated feedback or canned fallback
   */
  async generateFeedback(input: FeedbackInput): Promise<AIFeedbackJson> {
    // If AI is disabled, return canned response
    if (!aiConfig.enabled) {
      logger.info({ trend: input.trend }, "AI disabled - using canned feedback");
      return CANNED_RESPONSES[input.trend];
    }

    try {
      const startTime = Date.now();
      const prompt = this.buildFeedbackPrompt(input);

      const completion = await this.client.chat.completions.create({
        model: aiConfig.openai.model,
        temperature: 0.3, // Low temperature for consistent, professional feedback
        max_tokens: 400, // Concise feedback
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a supportive, empathetic physical therapy coach.
Your job is to provide encouraging, actionable feedback for users progressing through rehab.

CRITICAL Guidelines:
- Be warm and supportive, not clinical or diagnostic
- Focus on motivation and practical tips
- Keep language simple and accessible
- For worsening trends, be reassuring but cautious
- Never diagnose or claim to treat conditions
- This is educational guidance only`,
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
        logger.warn("OpenAI returned empty response for plan feedback, using fallback");
        return CANNED_RESPONSES[input.trend];
      }

      // Parse and validate JSON response
      const parsed = JSON.parse(content);
      const feedback = this.validateFeedback(parsed, input.trend);

      logger.info(
        {
          trend: input.trend,
          duration,
          tokens: completion.usage?.total_tokens,
        },
        "Plan feedback generated successfully with AI",
      );

      return feedback;
    } catch (error) {
      logger.warn(
        { error: error.message, trend: input.trend },
        "Failed to generate AI feedback, using canned fallback",
      );

      // Return canned response on any error
      return CANNED_RESPONSES[input.trend];
    }
  }

  /**
   * Build prompt for feedback generation
   */
  private buildFeedbackPrompt(input: FeedbackInput): string {
    const { trend, trendAnalysis, exerciseCount, buckets, userNotes } = input;

    // Format delta values
    const painChange =
      trendAnalysis.painDelta >= 0
        ? `+${trendAnalysis.painDelta.toFixed(1)}`
        : trendAnalysis.painDelta.toFixed(1);
    const stiffnessChange =
      trendAnalysis.stiffnessDelta >= 0
        ? `+${trendAnalysis.stiffnessDelta.toFixed(1)}`
        : trendAnalysis.stiffnessDelta.toFixed(1);

    return `
User's Rehab Progress Update:

**Trend Classification:** ${trend}

**Pain/Stiffness Changes:**
- Current pain: ${trendAnalysis.currentPain}/10 (change: ${painChange})
- Current stiffness: ${trendAnalysis.currentStiffness}/10 (change: ${stiffnessChange})
- Baseline pain (7-log avg): ${trendAnalysis.baselinePain.toFixed(1)}/10
- Baseline stiffness (7-log avg): ${trendAnalysis.baselineStiffness.toFixed(1)}/10

**Program Stats:**
- Days since start: ${trendAnalysis.daysSinceStart}
- Total logs: ${trendAnalysis.logCount}

**New Plan Details:**
- Exercise count: ${exerciseCount}
- Focus areas: ${buckets.join(", ")}
${userNotes ? `- User's recent notes: "${userNotes}"` : ""}

---

**Your Task:**
Generate a JSON response with coaching feedback for this user's adaptive plan:

{
  "summary": "A 1-2 sentence summary acknowledging their progress trend and motivating them forward",
  "coaching": [
    "Actionable tip 1 (specific to their trend)",
    "Actionable tip 2 (encouragement or technique advice)",
    "Actionable tip 3 (long-term guidance or reassurance)"
  ],
  "caution": ${trend === "worse" ? '"A brief caution note about their worsening trend (1 sentence)"' : "null"}
}

**Guidelines:**
- ${trend === "improving" ? "Celebrate their progress! Be enthusiastic and encouraging." : ""}
- ${trend === "stable" ? "Emphasize consistency and patience. Progress isn't always linear." : ""}
- ${trend === "worse" ? "Be empathetic and reassuring. Suggest reducing intensity and consulting a provider if it continues." : ""}
- Coaching tips should be concise (1 sentence each)
- Reference their pain/stiffness changes if relevant
- Keep tone warm and conversational, not clinical
- ${trend === "worse" ? "MUST include a caution message for worsening trend" : "caution should be null for improving/stable trends"}

Return only valid JSON.
`.trim();
  }

  /**
   * Validate and sanitize AI feedback
   */
  private validateFeedback(parsed: any, trend: Trend): AIFeedbackJson {
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid JSON structure from AI");
    }

    const { summary, coaching, caution } = parsed;

    // Validate summary
    if (!summary || typeof summary !== "string" || summary.trim().length === 0) {
      throw new Error("Invalid or missing summary in AI response");
    }

    // Validate coaching array
    if (!Array.isArray(coaching) || coaching.length === 0) {
      throw new Error("Invalid or missing coaching in AI response");
    }

    // Ensure exactly 3 coaching tips
    const validatedCoaching = coaching
      .map((tip: any) => (typeof tip === "string" ? tip.trim() : ""))
      .filter((tip) => tip.length > 0);

    if (validatedCoaching.length < 3) {
      // Pad with generic tips
      while (validatedCoaching.length < 3) {
        validatedCoaching.push("Continue monitoring your symptoms and adjusting as needed");
      }
    } else if (validatedCoaching.length > 3) {
      // Truncate to 3
      validatedCoaching.length = 3;
    }

    // Validate caution
    let validatedCaution: string | null = null;
    if (trend === "worse") {
      // Must have caution for worsening trend
      if (!caution || typeof caution !== "string" || caution.trim().length === 0) {
        logger.warn("AI did not provide caution for worsening trend, using default");
        validatedCaution =
          "Your symptoms have increased. We've adjusted your plan. If pain continues to worsen, please consult a healthcare professional.";
      } else {
        validatedCaution = caution.trim();
      }
    } else {
      // Should be null for improving/stable
      validatedCaution = null;
    }

    return {
      summary: summary.trim(),
      coaching: validatedCoaching,
      caution: validatedCaution,
    };
  }
}
