/**
 * WeeklySummaryFormatter: Generate motivational weekly progress summaries
 *
 * Purpose:
 * - Generate friendly "Weekly Progress Summary" messages using GPT-4o-mini
 * - Focus on effort, consistency, and progress (never medical advice)
 * - Provide encouragement and actionable next steps
 * - Fallback to canned responses if AI fails
 */

import OpenAI from "openai";
import aiConfig from "#config/ai";
import logger from "@adonisjs/core/services/logger";
import type { Trend } from "#models/rehab_plan";

/**
 * Input for weekly summary generation
 */
export interface WeeklySummaryInput {
  adherenceRate: number; // 0-1 percentage
  currentStreak: number;
  avgPainChange: number;
  avgStiffnessChange: number;
  logsThisWeek: number;
  trend: Trend | null;
}

/**
 * GPT-generated weekly summary output
 */
export interface WeeklySummaryOutput {
  summary: string; // 1-2 sentences summarizing overall progress
  highlights: string[]; // Array of achievements/observations
  encouragement: string; // Gentle next-step motivation
  emoji: string; // Match tone: 🎉 💪 🌟 📈
}

/**
 * Canned responses for fallback (when AI fails or is disabled)
 * One for each trend type
 */
const CANNED_SUMMARIES: Record<string, WeeklySummaryOutput> = {
  improving: {
    summary:
      "Great week! Your pain and stiffness are trending down, and you're staying consistent.",
    highlights: [
      "Pain levels improving",
      "Building momentum with regular logging",
      "Showing positive progress",
    ],
    encouragement: "Keep up the excellent work - you're on the right track!",
    emoji: "🎉",
  },
  stable: {
    summary: "Steady progress this week. You're maintaining your gains and staying consistent.",
    highlights: [
      "Consistent logging habit",
      "Maintaining stability",
      "Building a strong foundation",
    ],
    encouragement: "Small, consistent steps lead to lasting results. Stay the course!",
    emoji: "📈",
  },
  worse: {
    summary:
      "This week had some challenges, but you're still showing up and tracking your progress.",
    highlights: [
      "Continuing to log despite setbacks",
      "Building awareness of patterns",
      "Staying committed to recovery",
    ],
    encouragement:
      "Progress isn't always linear. Focus on rest and gentle movement, and consult your provider if symptoms persist.",
    emoji: "💪",
  },
  default: {
    summary: "Thanks for staying consistent with your rehab tracking this week!",
    highlights: [
      "Regular logging helps track patterns",
      "Building healthy habits",
      "Taking ownership of recovery",
    ],
    encouragement: "Every log entry brings you closer to your goals. Keep it up!",
    emoji: "🌟",
  },
};

export default class WeeklySummaryFormatter {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: aiConfig.openai.apiKey,
      timeout: aiConfig.openai.timeout,
    });
  }

  /**
   * Generate weekly progress summary
   *
   * @param input - Adherence and progress data
   * @returns GPT-generated summary or canned fallback
   */
  async generateSummary(input: WeeklySummaryInput): Promise<WeeklySummaryOutput> {
    // If AI is disabled, return canned response
    if (!aiConfig.enabled) {
      logger.info({ trend: input.trend }, "AI disabled - using canned weekly summary");
      return this.getCannedSummary(input.trend);
    }

    try {
      const startTime = Date.now();
      const prompt = this.buildPrompt(input);

      const completion = await this.client.chat.completions.create({
        model: aiConfig.openai.model,
        temperature: 0.3, // Consistent, professional tone
        max_tokens: 400,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an empathetic physical therapist providing weekly encouragement.
Focus on effort and progress. No medical advice or diagnosis.
Be warm, supportive, and motivating.`,
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
        logger.warn("OpenAI returned empty response for weekly summary, using fallback");
        return this.getCannedSummary(input.trend);
      }

      // Parse and validate JSON response
      const parsed = JSON.parse(content);
      const summary = this.validateSummary(parsed, input.trend);

      logger.info(
        {
          adherenceRate: input.adherenceRate,
          streak: input.currentStreak,
          duration,
          tokens: completion.usage?.total_tokens,
        },
        "Weekly summary generated successfully with AI",
      );

      return summary;
    } catch (error) {
      logger.warn(
        { error: error.message, trend: input.trend },
        "Failed to generate AI weekly summary, using canned fallback",
      );

      // Return canned response on any error
      return this.getCannedSummary(input.trend);
    }
  }

  /**
   * Build prompt for weekly summary generation
   */
  private buildPrompt(input: WeeklySummaryInput): string {
    const { adherenceRate, currentStreak, avgPainChange, avgStiffnessChange, logsThisWeek, trend } =
      input;

    const adherencePercent = Math.round(adherenceRate * 100);
    const painChangeText =
      avgPainChange >= 0 ? `+${avgPainChange.toFixed(1)}` : avgPainChange.toFixed(1);
    const stiffnessChangeText =
      avgStiffnessChange >= 0 ? `+${avgStiffnessChange.toFixed(1)}` : avgStiffnessChange.toFixed(1);

    return `
User's Weekly Rehab Progress:

**Adherence:**
- Current streak: ${currentStreak} days
- Overall adherence: ${adherencePercent}%
- Logs this week: ${logsThisWeek}/7 days

**Progress Metrics:**
- Pain change: ${painChangeText} (vs previous week)
- Stiffness change: ${stiffnessChangeText} (vs previous week)
- Overall trend: ${trend || "stable"}

---

**Your Task:**
Generate a JSON response with a motivational weekly summary:

{
  "summary": "1-2 sentence overview celebrating progress and consistency",
  "highlights": ["achievement 1", "achievement 2", "achievement 3"],
  "encouragement": "Gentle next-step motivation (1 sentence)",
  "emoji": "🎉" | "💪" | "🌟" | "📈" (match tone and progress)
}

**Guidelines:**
- ${trend === "improving" ? "Celebrate their progress! Be enthusiastic about pain/stiffness improvements." : ""}
- ${trend === "stable" ? "Emphasize consistency and building foundation. Progress isn't just numbers." : ""}
- ${trend === "worse" ? "Be empathetic and reassuring. Acknowledge setbacks as part of recovery. Suggest rest if needed." : ""}
- ${currentStreak >= 5 ? "Celebrate their impressive streak! Consistency is key." : ""}
- ${adherencePercent >= 80 ? "Praise their excellent adherence rate." : ""}
- ${logsThisWeek < 3 ? "Gently encourage more frequent logging for better insights." : ""}
- Highlights should be specific observations from the data (not generic)
- Encouragement should be actionable but not medical advice
- Tone: warm, supportive, conversational (not clinical)

Return only valid JSON.
`.trim();
  }

  /**
   * Validate and sanitize AI summary
   */
  private validateSummary(parsed: any, trend: Trend | null): WeeklySummaryOutput {
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid JSON structure from AI");
    }

    const { summary, highlights, encouragement, emoji } = parsed;

    // Validate summary
    if (!summary || typeof summary !== "string" || summary.trim().length === 0) {
      throw new Error("Invalid or missing summary in AI response");
    }

    // Validate highlights
    if (!Array.isArray(highlights) || highlights.length === 0) {
      throw new Error("Invalid or missing highlights in AI response");
    }

    // Ensure exactly 3 highlights
    const validatedHighlights = highlights
      .map((h: any) => (typeof h === "string" ? h.trim() : ""))
      .filter((h) => h.length > 0);

    if (validatedHighlights.length < 3) {
      // Pad with generic highlights
      while (validatedHighlights.length < 3) {
        validatedHighlights.push("Staying committed to recovery");
      }
    } else if (validatedHighlights.length > 3) {
      validatedHighlights.length = 3;
    }

    // Validate encouragement
    if (!encouragement || typeof encouragement !== "string" || encouragement.trim().length === 0) {
      throw new Error("Invalid or missing encouragement in AI response");
    }

    // Validate emoji
    const validEmojis = ["🎉", "💪", "🌟", "📈"];
    const validatedEmoji =
      emoji && validEmojis.includes(emoji) ? emoji : this.getDefaultEmoji(trend);

    return {
      summary: summary.trim(),
      highlights: validatedHighlights,
      encouragement: encouragement.trim(),
      emoji: validatedEmoji,
    };
  }

  /**
   * Get canned summary based on trend
   */
  private getCannedSummary(trend: Trend | null): WeeklySummaryOutput {
    if (trend && CANNED_SUMMARIES[trend]) {
      return CANNED_SUMMARIES[trend];
    }
    return CANNED_SUMMARIES.default;
  }

  /**
   * Get default emoji based on trend
   */
  private getDefaultEmoji(trend: Trend | null): string {
    if (trend === "improving") return "🎉";
    if (trend === "worse") return "💪";
    if (trend === "stable") return "📈";
    return "🌟";
  }
}
