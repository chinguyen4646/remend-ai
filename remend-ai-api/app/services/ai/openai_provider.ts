import OpenAI from "openai";
import type { AIProvider, AIAdvice, FeedbackMode } from "./provider_interface.js";
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
}

// Export singleton instance
export default new OpenAIProvider();
