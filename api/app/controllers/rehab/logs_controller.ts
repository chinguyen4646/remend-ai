import type { HttpContext } from "@adonisjs/core/http";
import RehabLog from "#models/rehab_log";
import RehabProgram from "#models/rehab_program";
import { createRehabLogValidator, getRehabLogsValidator } from "#validators/rehab/log";
import { todayInTimezone, isValidIsoDate } from "#utils/dates";
import logger from "@adonisjs/core/services/logger";
import { DateTime } from "luxon";

export default class LogsController {
  async create({ auth, request, response }: HttpContext) {
    const user = auth.user!;
    const data = await request.validateUsing(createRehabLogValidator);
    const tz = user.tz;

    // Verify program exists and belongs to user
    const program = await RehabProgram.find(data.programId);

    if (!program) {
      return response.notFound({ errors: [{ message: "Program not found" }] });
    }

    if (program.userId !== user.id) {
      return response.forbidden({ errors: [{ message: "Unauthorized" }] });
    }

    if (program.status !== "active") {
      return response.badRequest({
        errors: [{ message: "Cannot log to a non-active program" }],
      });
    }

    // Validate and get date string
    let logDate: string;
    if (data.date) {
      if (!isValidIsoDate(data.date)) {
        return response.unprocessableEntity({
          errors: [{ message: "Invalid date format. Use YYYY-MM-DD" }],
        });
      }
      logDate = data.date;
    } else {
      logDate = todayInTimezone(tz);
    }

    try {
      const log = await RehabLog.create({
        userId: user.id,
        programId: data.programId,
        date: DateTime.fromISO(logDate),
        pain: data.pain,
        stiffness: data.stiffness,
        swelling: data.swelling || null,
        activityLevel: data.activityLevel || null,
        notes: data.notes || null,
      });

      logger.info(
        { userId: user.id, programId: data.programId, date: logDate },
        "Rehab log created",
      );

      return response.created({ log });
    } catch (error) {
      // Handle unique constraint violation
      if (error.code === "23505") {
        return response.conflict({
          errors: [{ message: "A log already exists for this program and date" }],
        });
      }
      throw error;
    }
  }

  async index({ auth, request, response }: HttpContext) {
    const user = auth.user!;
    const params = await request.validateUsing(getRehabLogsValidator);
    const tz = user.tz;

    let programId: number | null = null;

    // Resolve 'active' to actual program ID
    if (params.programId === "active") {
      const activeProgram = await RehabProgram.query()
        .where("user_id", user.id)
        .where("status", "active")
        .first();

      if (!activeProgram) {
        return response.notFound({
          errors: [{ message: "No active rehab program found" }],
        });
      }

      programId = activeProgram.id;
    } else if (params.programId) {
      programId = Number.parseInt(params.programId);

      // Verify program belongs to user
      const program = await RehabProgram.find(programId);
      if (!program || program.userId !== user.id) {
        return response.notFound({ errors: [{ message: "Program not found" }] });
      }
    }

    // Build query
    const query = RehabLog.query().where("user_id", user.id);

    if (programId) {
      query.where("program_id", programId);
    }

    // Apply date range filter using user's timezone
    if (params.range) {
      const { rangeLastNDays } = await import("#utils/dates");
      const days = params.range === "last_7" ? 7 : params.range === "last_14" ? 14 : 30;
      const { start, end } = rangeLastNDays(days, tz);

      query.where("date", ">=", start).andWhere("date", "<=", end);
    }

    const logs = await query.orderBy("date", "desc").preload("program");

    return response.ok({ logs });
  }
}
