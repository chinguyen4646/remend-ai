import type { HttpContext } from "@adonisjs/core/http";
import RehabProgram from "#models/rehab_program";
import { createProgramValidator, updateProgramStatusValidator } from "#validators/rehab/program";
import { toUtcStartOfLocalDay, todayUtcFromLocal, isValidIsoDate } from "#utils/dates";

import logger from "@adonisjs/core/services/logger";

export default class ProgramsController {
  async create({ auth, request, response }: HttpContext) {
    const user = auth.user!;
    const data = await request.validateUsing(createProgramValidator);
    const tz = user.tz;

    // Validate and transform startDate
    let startDate;
    if (data.startDate) {
      if (!isValidIsoDate(data.startDate)) {
        return response.unprocessableEntity({
          errors: [{ message: "Invalid date format. Use YYYY-MM-DD" }],
        });
      }
      startDate = toUtcStartOfLocalDay(data.startDate, tz);
    } else {
      startDate = todayUtcFromLocal(tz);
    }

    // Check if user already has an active program when creating a new active one
    const status = data.status || "active";
    if (status === "active") {
      const existingActive = await RehabProgram.query()
        .where("user_id", user.id)
        .where("status", "active")
        .first();

      if (existingActive) {
        return response.conflict({
          errors: [{ message: "You already have an active rehab program" }],
        });
      }
    }

    // Snapshot onboarding profile if available
    let metadata = null;
    if (user.currentProfileId) {
      await user.load("currentProfile");
      if (user.currentProfile) {
        const profile = user.currentProfile;
        metadata = {
          area: profile.data.area,
          goal: profile.data.goal,
          riskLevel: profile.riskLevel,
          aggravators: profile.data.aggravators,
          easers: profile.data.easers,
          onset: profile.data.onset,
          painRest: profile.data.painRest,
          painActivity: profile.data.painActivity,
          onboardingVersion: profile.onboardingVersion,
          profileId: profile.id,
        };
      }
    }

    const program = await RehabProgram.create({
      userId: user.id,
      area: data.area,
      areaOtherLabel: data.areaOtherLabel || null,
      side: data.side,
      startDate,
      status,
      metadata,
    });

    logger.info(
      { userId: user.id, programId: program.id, hasProfile: !!metadata },
      "Rehab program created",
    );

    return response.created({ program });
  }

  async updateStatus({ auth, request, response, params }: HttpContext) {
    const user = auth.user!;
    const data = await request.validateUsing(updateProgramStatusValidator);

    const program = await RehabProgram.find(params.id);

    if (!program) {
      return response.notFound({ errors: [{ message: "Program not found" }] });
    }

    if (program.userId !== user.id) {
      return response.forbidden({ errors: [{ message: "Unauthorized" }] });
    }

    // Return error if trying to set the same status
    if (program.status === data.status) {
      logger.warn(
        { userId: user.id, programId: program.id, status: data.status },
        "Attempted to set same program status",
      );
      return response.badRequest({
        errors: [{ message: `Program is already ${data.status}` }],
      });
    }

    // If setting to active, ensure no other active program exists
    if (data.status === "active") {
      const existingActive = await RehabProgram.query()
        .where("user_id", user.id)
        .where("status", "active")
        .whereNot("id", program.id)
        .first();

      if (existingActive) {
        return response.conflict({
          errors: [{ message: "You already have another active rehab program" }],
        });
      }
    }

    program.status = data.status;
    await program.save();

    logger.info(
      { userId: user.id, programId: program.id, status: data.status },
      "Rehab program status updated",
    );

    return response.ok({ program });
  }

  async index({ auth, response }: HttpContext) {
    const user = auth.user!;

    const programs = await RehabProgram.query()
      .where("user_id", user.id)
      .orderBy("created_at", "desc");

    return response.ok({ programs });
  }
}
