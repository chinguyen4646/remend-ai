/**
 * AdherenceService: Calculate streaks, adherence rates, and weekly summaries
 *
 * Core responsibilities:
 * 1. Streak tracking: Flexible 1-day gap logic (daysBetween <= 2 continues streak)
 * 2. Adherence metrics: Calculate logging rate and consistency
 * 3. Weekly summaries: Aggregate progress data for GPT feedback generation
 */

import { DateTime } from "luxon";
import RehabProgram from "#models/rehab_program";
import RehabLog from "#models/rehab_log";
import RehabPlan from "#models/rehab_plan";
import type { Trend } from "#models/rehab_plan";

/**
 * Adherence summary for a program
 */
export interface AdherenceSummary {
  daysLogged: number;
  totalDays: number;
  adherenceRate: number; // 0-1 percentage
  currentStreak: number;
  longestStreak: number;
  lastLoggedAt: DateTime | null;
}

/**
 * Weekly summary data for GPT feedback
 */
export interface WeeklySummaryData {
  avgPainChange: number;
  avgStiffnessChange: number;
  logsThisWeek: number;
  trend: Trend | null;
  daysWithLogs: number; // How many of the 7 days had logs
}

export default class AdherenceService {
  /**
   * Calculate and update streak for a program after a new log
   *
   * Flexible streak logic:
   * - If daysBetween <= 2 (allows 1 missed day) → increment streak
   * - Else → reset to 1
   *
   * @param programId - Program to update
   * @param newLogDate - Date of the new log
   */
  async calculateStreak(programId: number, newLogDate: DateTime): Promise<void> {
    const program = await RehabProgram.findOrFail(programId);

    // Get all logs for this program to determine streak
    const allLogs = await RehabLog.query().where("program_id", programId).orderBy("date", "desc");

    if (allLogs.length === 0) {
      // No logs found (shouldn't happen if called after log creation, but handle it)
      program.currentStreak = 1;
      program.longestStreak = Math.max(1, program.longestStreak);
      program.lastLoggedAt = newLogDate;
      await program.save();
      return;
    }

    if (allLogs.length === 1) {
      // First log ever - start streak at 1
      program.currentStreak = 1;
      program.longestStreak = Math.max(1, program.longestStreak);
      program.lastLoggedAt = newLogDate;
      await program.save();
      return;
    }

    // Get the current log (should be the most recent) and previous log
    const currentLog = allLogs[0];
    const previousLog = allLogs[1];

    // Check if this is an update to the same day (not a new log)
    if (currentLog.date.hasSame(newLogDate, "day") && allLogs.length > 1) {
      // This is an update to today's log, check if we need to recalculate from previous
      const daysBetween = Math.abs(Math.floor(currentLog.date.diff(previousLog.date, "days").days));

      if (daysBetween <= 2) {
        // Continue streak from previous
        if (program.currentStreak === 0) {
          // First time calculating after update
          program.currentStreak = 2;
        }
      } else {
        // Gap too large
        program.currentStreak = 1;
      }
    } else {
      // This is a new log on a different day
      const daysBetween = Math.abs(Math.floor(currentLog.date.diff(previousLog.date, "days").days));

      if (daysBetween <= 2) {
        // Flexible streak: allow 1 missed day (daysBetween = 2)
        program.currentStreak += 1;
      } else {
        // Gap too large, reset streak
        program.currentStreak = 1;
      }
    }

    // Update longest streak if new record
    program.longestStreak = Math.max(program.currentStreak, program.longestStreak);
    program.lastLoggedAt = newLogDate;

    await program.save();
  }

  /**
   * Calculate overall adherence metrics for a program
   *
   * @param programId - Program to analyze
   * @returns Adherence summary with rates and streaks
   */
  async calculateAdherence(programId: number): Promise<AdherenceSummary> {
    const program = await RehabProgram.findOrFail(programId);

    // Get all logs for this program
    const logs = await RehabLog.query().where("program_id", programId).orderBy("date", "asc");

    const daysLogged = logs.length;

    // Calculate total days since program start
    const startDate = program.startDate;
    const today = DateTime.now();
    const totalDays = Math.max(1, Math.floor(today.diff(startDate, "days").days) + 1); // +1 to include start day

    // Calculate adherence rate
    const adherenceRate = Math.min(1, daysLogged / totalDays);

    return {
      daysLogged,
      totalDays,
      adherenceRate,
      currentStreak: program.currentStreak,
      longestStreak: program.longestStreak,
      lastLoggedAt: program.lastLoggedAt,
    };
  }

  /**
   * Get last week summary data for GPT feedback generation
   *
   * Analyzes last 7 calendar days:
   * - Average pain/stiffness changes vs previous week
   * - Number of logs this week
   * - Latest trend classification
   *
   * @param programId - Program to analyze
   * @returns Weekly summary data
   */
  async getLastWeekSummary(programId: number): Promise<WeeklySummaryData> {
    // Get logs from last 14 days (to compare week-over-week)
    const fourteenDaysAgo = DateTime.now().minus({ days: 14 });
    const sevenDaysAgo = DateTime.now().minus({ days: 7 });

    const allLogs = await RehabLog.query()
      .where("program_id", programId)
      .where("date", ">=", fourteenDaysAgo.toSQLDate())
      .orderBy("date", "asc");

    // Split into this week and previous week
    const thisWeekLogs = allLogs.filter((log) => log.date >= sevenDaysAgo);
    const previousWeekLogs = allLogs.filter(
      (log) => log.date >= fourteenDaysAgo && log.date < sevenDaysAgo,
    );

    // Calculate averages for this week
    const thisWeekPainAvg =
      thisWeekLogs.length > 0
        ? thisWeekLogs.reduce((sum, log) => sum + log.pain, 0) / thisWeekLogs.length
        : 0;

    const thisWeekStiffnessAvg =
      thisWeekLogs.length > 0
        ? thisWeekLogs.reduce((sum, log) => sum + log.stiffness, 0) / thisWeekLogs.length
        : 0;

    // Calculate averages for previous week
    const prevWeekPainAvg =
      previousWeekLogs.length > 0
        ? previousWeekLogs.reduce((sum, log) => sum + log.pain, 0) / previousWeekLogs.length
        : thisWeekPainAvg; // If no previous week data, use current as baseline

    const prevWeekStiffnessAvg =
      previousWeekLogs.length > 0
        ? previousWeekLogs.reduce((sum, log) => sum + log.stiffness, 0) / previousWeekLogs.length
        : thisWeekStiffnessAvg;

    // Calculate changes (negative = improvement)
    const avgPainChange = thisWeekPainAvg - prevWeekPainAvg;
    const avgStiffnessChange = thisWeekStiffnessAvg - prevWeekStiffnessAvg;

    // Get latest plan trend
    const latestPlan = await RehabPlan.query()
      .whereHas("log", (logQuery) => {
        logQuery.where("program_id", programId);
      })
      .orderBy("generated_at", "desc")
      .first();

    const trend = latestPlan?.trend || null;

    // Count days with logs (max 7)
    const daysWithLogs = thisWeekLogs.length;

    return {
      avgPainChange,
      avgStiffnessChange,
      logsThisWeek: daysWithLogs,
      trend,
      daysWithLogs,
    };
  }

  /**
   * Check if weekly summary should be generated
   *
   * @param program - Program to check
   * @returns True if 7+ days since last summary or never generated
   */
  shouldGenerateWeeklySummary(program: RehabProgram): boolean {
    if (!program.lastSummaryGeneratedAt) {
      return true; // Never generated
    }

    const daysSince = Math.floor(DateTime.now().diff(program.lastSummaryGeneratedAt, "days").days);

    return daysSince >= 7;
  }
}
