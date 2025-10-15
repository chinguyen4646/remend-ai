import type { HttpContext } from "@adonisjs/core/http";
import WellnessLog from "#models/wellness_log";
import { createWellnessLogValidator, getWellnessLogsValidator } from "#validators/wellness/log";
import { todayInTimezone, rangeLastNDays, isValidIsoDate } from "#utils/dates";
import logger from "@adonisjs/core/services/logger";
import { DateTime } from "../../../node_modules/@types/luxon/index.js";

export default class LogsController {
  async create({ auth, request, response }: HttpContext) {
    const user = auth.user!;
    const data = await request.validateUsing(createWellnessLogValidator);
    const tz = user.tz;

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
      const log = await WellnessLog.create({
        userId: user.id,
        mode: data.mode,
        date: DateTime.fromISO(logDate),
        pain: data.pain || null,
        stiffness: data.stiffness || null,
        tension: data.tension || null,
        energy: data.energy || null,
        areaTag: data.areaTag || null,
        notes: data.notes || null,
      });

      logger.info({ userId: user.id, mode: data.mode, date: logDate }, "Wellness log created");

      return response.created({ log });
    } catch (error) {
      // Handle unique constraint violation
      if (error.code === "23505") {
        return response.conflict({
          errors: [{ message: "A wellness log already exists for this mode and date" }],
        });
      }
      throw error;
    }
  }

  async index({ auth, request, response }: HttpContext) {
    const user = auth.user!;
    const params = await request.validateUsing(getWellnessLogsValidator);
    const tz = user.tz;

    const query = WellnessLog.query().where("user_id", user.id).where("mode", params.mode);

    // Apply date range filter using user's timezone
    if (params.range) {
      const days = params.range === "last_7" ? 7 : 30;
      const { start, end } = rangeLastNDays(days, tz);

      query.where("date", ">=", start).andWhere("date", "<=", end);
    }

    const logs = await query.orderBy("date", "desc");

    return response.ok({ logs });
  }
}
