import type { HttpContext } from "@adonisjs/core/http";
import { DateTime } from "luxon";
import { updateModeValidator } from "#validators/users/mode";
import RehabProgram from "#models/rehab_program";
import logger from "@adonisjs/core/services/logger";
import featuresConfig from "#config/features";

export default class ModeController {
  async update({ auth, request, response }: HttpContext) {
    const user = auth.user!;
    const data = await request.validateUsing(updateModeValidator);

    // Check if the requested mode is enabled via feature flags
    if (data.mode === "maintenance" && !featuresConfig.maintenanceModeEnabled) {
      logger.warn({ userId: user.id, mode: data.mode }, "Attempted to switch to disabled mode");
      return response.badRequest({
        errors: [{ message: "Maintenance mode is currently disabled" }],
      });
    }

    if (data.mode === "general" && !featuresConfig.generalModeEnabled) {
      logger.warn({ userId: user.id, mode: data.mode }, "Attempted to switch to disabled mode");
      return response.badRequest({
        errors: [{ message: "General mode is currently disabled" }],
      });
    }

    const previousMode = user.mode;

    // Return error if trying to switch to the same mode
    if (previousMode === data.mode) {
      logger.warn({ userId: user.id, mode: data.mode }, "Attempted to switch to same mode");
      return response.badRequest({
        errors: [{ message: `You are already in ${data.mode} mode` }],
      });
    }

    // If leaving rehab mode, auto-pause any active programs
    if (previousMode === "rehab" && data.mode !== "rehab") {
      const pausedResult = await RehabProgram.query()
        .where("user_id", user.id)
        .where("status", "active")
        .update({ status: "paused" });

      const pausedCount = Array.isArray(pausedResult) ? pausedResult.length : pausedResult;

      if (pausedCount > 0) {
        logger.info(
          { userId: user.id, pausedCount },
          "Auto-paused active rehab program(s) on mode switch",
        );
      }
    }

    user.mode = data.mode;
    user.injuryType = data.injuryType || null;
    user.modeStartedAt = DateTime.utc();

    await user.save();

    logger.info({ userId: user.id, mode: data.mode, previousMode }, "User mode updated");

    return response.ok({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        mode: user.mode,
        injuryType: user.injuryType,
        modeStartedAt: user.modeStartedAt,
      },
      message:
        previousMode === "rehab" && data.mode !== "rehab"
          ? "Your rehab program has been paused. You can resume anytime by switching back to Rehab mode."
          : undefined,
    });
  }
}
