/**
 * ProgressionService: Analyze user logs and progress rehab plans adaptively
 *
 * Core responsibilities:
 * 1. Trend analysis: Compare recent logs to baseline, classify as improving/stable/worse
 * 2. Plan progression: Adjust exercise buckets and dosages based on trend
 * 3. Trigger logic: Determine when to generate new adaptive plans
 *
 * Philosophy:
 * - Deterministic bucket progression (no AI)
 * - Conservative dosage increases (strength/isometric only, cap at 4 sets)
 * - Hybrid bucket rotation: keep mobility core, rotate activation→strength→stability
 */

import db from "@adonisjs/lucid/services/db";
import RehabLog from "#models/rehab_log";
import RehabPlan from "#models/rehab_plan";
import type { Trend } from "#models/rehab_plan";
import type { ShortlistExercise } from "#services/ai/provider_interface";
import type { DosageJson } from "#models/exercise";
import { DateTime } from "luxon";

/**
 * Trend analysis result
 */
export interface TrendAnalysis {
  trend: Trend;
  currentPain: number;
  currentStiffness: number;
  baselinePain: number;
  baselineStiffness: number;
  painDelta: number;
  stiffnessDelta: number;
  logCount: number;
  daysSinceStart: number;
}

/**
 * Progression trigger check result
 */
export interface ProgressionTrigger {
  shouldProgress: boolean;
  reason: string;
  logCount: number;
  daysSinceLastPlan: number;
}

/**
 * Plan progression result
 */
export interface ProgressionResult {
  exercises: ShortlistExercise[];
  buckets: string[];
  reasoning: string[];
}

export default class ProgressionService {
  /**
   * Analyze trend from recent logs
   *
   * Logic:
   * - Load last 7 logs for program
   * - Compute pain/stiffness deltas (most recent vs 7-log average)
   * - Classify: improving (≤ -1), worse (≥ 1), stable (otherwise)
   * - "Either" trigger: pain OR stiffness delta counts
   *
   * @param programId - Rehab program to analyze
   * @returns Trend classification and metrics
   */
  async analyzeTrend(programId: number): Promise<TrendAnalysis | null> {
    // Load last 7 logs (ordered by date DESC)
    const logs = await RehabLog.query()
      .where("program_id", programId)
      .orderBy("date", "desc")
      .limit(7);

    if (logs.length === 0) {
      return null; // No logs yet
    }

    // Current values (most recent log)
    const currentLog = logs[0];
    const currentPain = currentLog.pain;
    const currentStiffness = currentLog.stiffness;

    // Baseline: average of last 7 logs (including current)
    const totalPain = logs.reduce((sum, log) => sum + log.pain, 0);
    const totalStiffness = logs.reduce((sum, log) => sum + log.stiffness, 0);
    const baselinePain = totalPain / logs.length;
    const baselineStiffness = totalStiffness / logs.length;

    // Deltas: current - baseline (negative = improvement)
    const painDelta = currentPain - baselinePain;
    const stiffnessDelta = currentStiffness - baselineStiffness;

    // Classify trend: "either" trigger logic
    let trend: Trend;
    if (painDelta <= -1 || stiffnessDelta <= -1) {
      trend = "improving";
    } else if (painDelta >= 1 || stiffnessDelta >= 1) {
      trend = "worse";
    } else {
      trend = "stable";
    }

    // Calculate days since program start
    const programStartDate = logs[logs.length - 1].date; // Oldest log
    const daysSinceStart = Math.floor(DateTime.now().diff(programStartDate, "days").days);

    return {
      trend,
      currentPain,
      currentStiffness,
      baselinePain,
      baselineStiffness,
      painDelta,
      stiffnessDelta,
      logCount: logs.length,
      daysSinceStart,
    };
  }

  /**
   * Check if progression should be triggered
   *
   * Trigger conditions (either/or):
   * 1. 7 days since last plan
   * 2. 3 logs since last plan
   *
   * @param programId - Rehab program to check
   * @returns Whether to trigger progression and reason
   */
  async shouldTriggerProgression(programId: number): Promise<ProgressionTrigger> {
    // Get latest plan for this program
    const latestPlan = await RehabPlan.query()
      .whereHas("log", (logQuery) => {
        logQuery.where("program_id", programId);
      })
      .orderBy("generated_at", "desc")
      .first();

    if (!latestPlan) {
      return {
        shouldProgress: false,
        reason: "No previous plan found",
        logCount: 0,
        daysSinceLastPlan: 0,
      };
    }

    // Count logs since last plan
    const latestPlanDate = latestPlan.generatedAt.toSQL();
    if (!latestPlanDate) {
      return {
        shouldProgress: false,
        reason: "Invalid plan date",
        logCount: 0,
        daysSinceLastPlan: 0,
      };
    }

    const logsSinceLastPlan = await RehabLog.query()
      .where("program_id", programId)
      .where("created_at", ">", latestPlanDate)
      .count("* as total");

    const logCount = Number(logsSinceLastPlan[0].$extras.total);

    // Calculate days since last plan
    const daysSinceLastPlan = Math.floor(DateTime.now().diff(latestPlan.generatedAt, "days").days);

    // Trigger conditions: 7 days OR 3 logs (whichever first)
    if (daysSinceLastPlan >= 7) {
      return {
        shouldProgress: true,
        reason: `7 days elapsed since last plan (${daysSinceLastPlan} days)`,
        logCount,
        daysSinceLastPlan,
      };
    }

    if (logCount >= 3) {
      return {
        shouldProgress: true,
        reason: `3 logs completed since last plan (${logCount} logs)`,
        logCount,
        daysSinceLastPlan,
      };
    }

    return {
      shouldProgress: false,
      reason: `Waiting for 7 days or 3 logs (currently ${daysSinceLastPlan} days, ${logCount} logs)`,
      logCount,
      daysSinceLastPlan,
    };
  }

  /**
   * Progress exercise plan based on trend
   *
   * Bucket progression strategy (hybrid):
   * - Keep mobility buckets constant (always present)
   * - Rotate other buckets: activation → strength → stability
   *
   * Dosage progression:
   * - Apply to strength/isometric exercises only
   * - Cap at 4 sets max (safety limit)
   * - Improving: +1 set or +2 reps
   * - Stable: +1 rep
   * - Worse: -1 set or revert to low dosage
   *
   * @param currentPlan - Current plan to evolve
   * @param trend - Analyzed trend classification
   * @returns New exercise list and buckets
   */
  async progressPlan(currentPlan: RehabPlan, trend: Trend): Promise<ProgressionResult> {
    const currentExercises = currentPlan.shortlistJson.exercises;
    const reasoning: string[] = [];

    // Determine bucket progression
    const newBuckets = this.progressBuckets(currentExercises, trend);
    reasoning.push(`Bucket strategy: ${newBuckets.join(", ")}`);

    // Select exercises from new buckets
    const newExercises = await this.selectExercisesFromBuckets(newBuckets, currentExercises, trend);

    // Adjust dosages based on trend
    const adjustedExercises = newExercises.map((exercise) =>
      this.adjustDosage(exercise, trend, reasoning),
    );

    return {
      exercises: adjustedExercises,
      buckets: newBuckets,
      reasoning,
    };
  }

  /**
   * Progress buckets using hybrid strategy
   *
   * Rules:
   * - Always keep mobility buckets (core foundation)
   * - Rotate other buckets based on trend:
   *   - Improving: activation → strength → stability
   *   - Stable: keep same buckets
   *   - Worse: revert to activation/isometric (more conservative)
   */
  private progressBuckets(currentExercises: ShortlistExercise[], trend: Trend): string[] {
    // Extract current buckets from exercises
    const currentBuckets = [
      ...new Set(currentExercises.map((ex) => this.inferBucketSlug(ex.bucket))),
    ];

    // Always keep mobility buckets
    const mobilityBuckets = currentBuckets.filter((b) => b.includes("mobility"));

    // Get non-mobility buckets
    const otherBuckets = currentBuckets.filter((b) => !b.includes("mobility"));

    if (trend === "improving") {
      // Progress: activation → strength → stability
      const progressedBuckets = otherBuckets.map((bucket) => {
        if (bucket.includes("activation")) {
          return bucket.replace("activation", "strength");
        } else if (bucket.includes("isometric")) {
          return bucket.replace("isometric", "strength");
        } else if (bucket.includes("strength")) {
          return bucket.replace("strength", "stability");
        }
        return bucket; // Keep stability as-is
      });

      return [...mobilityBuckets, ...progressedBuckets];
    } else if (trend === "worse") {
      // Regress: strength/stability → activation/isometric
      const regressedBuckets = otherBuckets.map((bucket) => {
        if (bucket.includes("strength") || bucket.includes("stability")) {
          return bucket.replace(/strength|stability/, "activation");
        }
        return bucket;
      });

      return [...mobilityBuckets, ...regressedBuckets];
    } else {
      // Stable: keep same buckets
      return currentBuckets;
    }
  }

  /**
   * Select exercises from buckets (similar to InitialPlanService)
   */
  private async selectExercisesFromBuckets(
    bucketSlugs: string[],
    currentExercises: ShortlistExercise[],
    trend: Trend,
  ): Promise<ShortlistExercise[]> {
    const selectedExercises: ShortlistExercise[] = [];

    // Try to maintain some continuity: keep 1 exercise if improving/stable
    if (trend !== "worse" && currentExercises.length > 0) {
      const keepExercise = currentExercises[0]; // Keep first exercise for continuity
      selectedExercises.push(keepExercise);
    }

    // Fill remaining slots from new buckets
    for (const bucketSlug of bucketSlugs) {
      if (selectedExercises.length >= 3) break;

      const exercise = await this.selectRandomFromBucket(bucketSlug, selectedExercises);
      if (exercise) {
        selectedExercises.push(exercise);
      }
    }

    return selectedExercises.slice(0, 3); // Max 3 exercises
  }

  /**
   * Select a random exercise from a bucket
   */
  private async selectRandomFromBucket(
    bucketSlug: string,
    excludeExercises: ShortlistExercise[] = [],
  ): Promise<ShortlistExercise | null> {
    const excludeIds = excludeExercises.map((ex) => ex.id);

    const query = db
      .from("exercises")
      .join("exercise_buckets", "exercises.bucket_id", "exercise_buckets.id")
      .where("exercise_buckets.slug", bucketSlug)
      .where("exercises.is_active", true)
      .select(
        "exercises.id",
        "exercises.name",
        "exercise_buckets.label as bucket",
        "exercises.dosage_low_json",
        "exercises.dosage_medium_json",
        "exercises.safety_notes",
      );

    if (excludeIds.length > 0) {
      query.whereNotIn("exercises.id", excludeIds);
    }

    const exercises = await query;

    if (exercises.length === 0) return null;

    // Select random exercise
    const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];

    // Use medium dosage as baseline for progression
    const dosageJson: DosageJson = randomExercise.dosage_medium_json;
    const dosageText = this.formatDosageText(dosageJson);

    return {
      id: randomExercise.id,
      name: randomExercise.name,
      bucket: randomExercise.bucket,
      dosage_json: dosageJson,
      dosage_text: dosageText,
      safety_notes: randomExercise.safety_notes || undefined,
    };
  }

  /**
   * Adjust dosage based on trend
   *
   * Rules:
   * - Only adjust strength/isometric exercises
   * - Cap at 4 sets max
   * - Improving: +1 set (if < 4) or +2 reps
   * - Stable: +1 rep
   * - Worse: -1 set (if > 2) or revert to low dosage
   */
  private adjustDosage(
    exercise: ShortlistExercise,
    trend: Trend,
    reasoning: string[],
  ): ShortlistExercise {
    const bucket = exercise.bucket.toLowerCase();
    const isStrengthOrIsometric = bucket.includes("strength") || bucket.includes("isometric");

    if (!isStrengthOrIsometric) {
      reasoning.push(`${exercise.name}: kept dosage (${bucket} bucket)`);
      return exercise; // Only adjust strength/isometric
    }

    const dosage = { ...exercise.dosage_json };

    if (trend === "improving") {
      // Increase sets (cap at 4) or reps
      if (dosage.sets && dosage.sets < 4) {
        dosage.sets += 1;
        reasoning.push(`${exercise.name}: +1 set (now ${dosage.sets})`);
      } else if (dosage.reps) {
        dosage.reps += 2;
        reasoning.push(`${exercise.name}: +2 reps (now ${dosage.reps})`);
      }
    } else if (trend === "worse") {
      // Decrease sets or revert to low dosage
      if (dosage.sets && dosage.sets > 2) {
        dosage.sets -= 1;
        reasoning.push(`${exercise.name}: -1 set (now ${dosage.sets})`);
      } else if (dosage.reps && dosage.reps > 5) {
        dosage.reps -= 2;
        reasoning.push(`${exercise.name}: -2 reps (now ${dosage.reps})`);
      }
    } else {
      // Stable: small increase
      if (dosage.reps) {
        dosage.reps += 1;
        reasoning.push(`${exercise.name}: +1 rep (now ${dosage.reps})`);
      }
    }

    return {
      ...exercise,
      dosage_json: dosage,
      dosage_text: this.formatDosageText(dosage),
    };
  }

  /**
   * Infer bucket slug from bucket label
   * (Reverse lookup: "Knee Mobility" → "mobility_knee")
   */
  private inferBucketSlug(bucketLabel: string): string {
    const normalized = bucketLabel.toLowerCase().replace(/\s+/g, "_");
    // Common patterns: "Knee Mobility" → "mobility_knee"
    const parts = normalized.split("_");
    if (parts.length === 2) {
      return `${parts[1]}_${parts[0]}`; // Swap order
    }
    return normalized;
  }

  /**
   * Format dosage JSON as human-readable text
   */
  private formatDosageText(dosage: DosageJson): string {
    const parts: string[] = [];

    if (dosage.sets && dosage.reps) {
      parts.push(`${dosage.sets} sets × ${dosage.reps} reps`);
    } else if (dosage.sets && dosage.hold_seconds) {
      parts.push(`${dosage.sets} sets × ${dosage.hold_seconds}s hold`);
    } else if (dosage.sets && dosage.time_seconds) {
      parts.push(`${dosage.sets} sets × ${dosage.time_seconds}s`);
    } else if (dosage.time_seconds) {
      const minutes = Math.floor(dosage.time_seconds / 60);
      const seconds = dosage.time_seconds % 60;
      if (minutes > 0 && seconds === 0) {
        parts.push(`${minutes} min`);
      } else if (minutes > 0) {
        parts.push(`${minutes} min ${seconds}s`);
      } else {
        parts.push(`${seconds}s`);
      }
    }

    if (dosage.rest_seconds) {
      parts.push(`${dosage.rest_seconds}s rest`);
    }

    if (dosage.notes) {
      parts.push(`• ${dosage.notes}`);
    }

    return parts.join(", ");
  }
}
