import type { HttpContext } from "@adonisjs/core/http";
import RehabProgram from "#models/rehab_program";
import RehabLog from "#models/rehab_log";
import { rehabSummaryValidator } from "#validators/sessions/rehab_summary";
import aiConfig from "#config/ai";
import openaiProvider from "#services/ai/openai_provider";
import deduplicationCache from "#services/ai/deduplication_cache";
import logger from "@adonisjs/core/services/logger";

export default class RehabSummaryController {
  async create({ auth, request, response }: HttpContext) {
    const user = auth.user!;

    // Check if AI is enabled
    if (!aiConfig.enabled) {
      return response.serviceUnavailable({
        errors: [{ message: "AI feedback is temporarily unavailable" }],
      });
    }

    const data = await request.validateUsing(rehabSummaryValidator);
    const programId = data.programId;

    // Verify program exists and belongs to user
    const program = await RehabProgram.find(programId);
    if (!program || program.userId !== user.id) {
      return response.notFound({
        errors: [{ message: "Program not found" }],
      });
    }

    // Fetch last 14 days of logs
    const logs = await RehabLog.query()
      .where("user_id", user.id)
      .where("program_id", programId)
      .orderBy("date", "desc")
      .limit(14);

    // Apply threshold rules
    if (logs.length === 0) {
      return response.badRequest({
        errors: [{ message: "Log at least once to get feedback" }],
      });
    }

    // Determine feedback mode
    const mode = logs.length <= 2 ? "early" : "full";

    // Check deduplication cache
    const logIds = logs.map((log) => log.id);
    const cacheKey = deduplicationCache.generateKey(user.id, programId, logIds);
    const cachedAdvice = deduplicationCache.get(cacheKey);

    if (cachedAdvice) {
      logger.info({ userId: user.id, programId, mode }, "AI advice returned from cache");
      return response.ok(cachedAdvice);
    }

    // Call AI provider
    try {
      const advice = await openaiProvider.getRehabAdvice(logs, mode);

      // Cache the result
      deduplicationCache.set(cacheKey, advice);

      logger.info(
        { userId: user.id, programId, mode, logCount: logs.length },
        "AI advice generated",
      );

      return response.ok(advice);
    } catch (error) {
      logger.error(
        { error: error.message, userId: user.id, programId },
        "Failed to generate AI advice",
      );

      return response.internalServerError({
        errors: [
          { message: error.message || "Unable to generate AI advice. Please try again later." },
        ],
      });
    }
  }
}
