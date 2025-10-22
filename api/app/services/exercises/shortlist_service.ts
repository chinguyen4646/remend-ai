import { DateTime } from "luxon";
import db from "@adonisjs/lucid/services/db";
import type RehabLog from "#models/rehab_log";
import type RehabProgram from "#models/rehab_program";
import type { DosageJson } from "#models/exercise";
import type { ShortlistExercise } from "#services/ai/provider_interface";

/**
 * Risk level extracted from program metadata
 */
type RiskLevel = "low" | "moderate" | "high";

/**
 * Trend analysis result
 */
interface TrendAnalysis {
  averagePain: number;
  painTrend: "improving" | "stable" | "worsening";
  trendSummary: string; // e.g., "Pain down 2 pts vs 3-day avg"
}

/**
 * ShortlistService: Deterministic exercise selection with area abstraction
 *
 * Rules:
 * - Always include mobility_${area}
 * - High risk → isometric_${area}
 * - Improving trend → activation exercises
 * - Low pain → light strength exercises
 * - Aggravator-specific adjustments (stairs → activation_quads, squatting → stability_lower)
 */
export default class ShortlistService {
  /**
   * Generate shortlist of exercises for a rehab log
   */
  async generateShortlist(log: RehabLog, program: RehabProgram): Promise<ShortlistExercise[]> {
    const area = program.area;
    const riskLevel = this.extractRiskLevel(program);

    // Load recent logs for trend analysis
    const recentLogs = await this.loadRecentLogs(program.id);
    const trend = this.analyzeTrend(log, recentLogs);

    // Build shortlist using area-abstracted rules
    const shortlist: ShortlistExercise[] = [];

    // Rule 1: Always include mobility exercises
    const mobilityExercise = await this.selectRandomFromBucket(
      `mobility_${area}`,
      this.selectDosageLevel(riskLevel, trend),
    );
    if (mobilityExercise) shortlist.push(mobilityExercise);

    // Rule 2: High risk → isometric strengthening
    if (riskLevel === "high" || log.pain >= 6) {
      const isometricExercise = await this.selectRandomFromBucket(`isometric_${area}`, "low");
      if (isometricExercise) shortlist.push(isometricExercise);
    }

    // Rule 3: Improving trend → activation exercises
    if (trend.painTrend === "improving" && log.pain <= 5) {
      const bodyPart = this.getBodyPartForArea(area);
      const activationExercise = await this.selectRandomFromBucket(
        `activation_${bodyPart}`,
        this.selectDosageLevel(riskLevel, trend),
      );
      if (activationExercise) shortlist.push(activationExercise);
    }

    // Rule 4: Low pain → light strength
    if (log.pain <= 3 && trend.painTrend !== "worsening") {
      const strengthExercise = await this.selectRandomFromBucket(
        `light_strength_${area}`,
        this.selectDosageLevel(riskLevel, trend),
      );
      if (strengthExercise) shortlist.push(strengthExercise);
    }

    // Rule 5: Aggravator-specific adjustments
    shortlist.push(...(await this.handleAggravators(log.aggravators, area)));

    // Ensure 2-4 exercises (deduplication by ID)
    const uniqueShortlist = this.deduplicateExercises(shortlist);
    return uniqueShortlist.slice(0, 4);
  }

  /**
   * Extract risk level from program metadata
   */
  private extractRiskLevel(program: RehabProgram): RiskLevel {
    if (!program.metadata) return "moderate";
    const riskLevel = program.metadata.riskLevel as RiskLevel | undefined;
    return riskLevel || "moderate";
  }

  /**
   * Load last 14 days of logs for trend analysis
   */
  private async loadRecentLogs(programId: number): Promise<RehabLog[]> {
    const fourteenDaysAgo = DateTime.now().minus({ days: 14 }).toISODate();

    return await db
      .from("rehab_logs")
      .where("program_id", programId)
      .where("date", ">=", fourteenDaysAgo)
      .orderBy("date", "desc")
      .limit(14);
  }

  /**
   * Analyze pain trend over recent logs
   */
  private analyzeTrend(currentLog: RehabLog, recentLogs: any[]): TrendAnalysis {
    if (recentLogs.length === 0) {
      return {
        averagePain: currentLog.pain,
        painTrend: "stable",
        trendSummary: "First log entry",
      };
    }

    const averagePain = recentLogs.reduce((sum, log) => sum + log.pain, 0) / recentLogs.length;

    const painDiff = currentLog.pain - averagePain;
    const painTrend = painDiff <= -1 ? "improving" : painDiff >= 1 ? "worsening" : "stable";

    const trendSummary =
      painTrend === "improving"
        ? `Pain down ${Math.abs(painDiff).toFixed(1)} pts vs ${recentLogs.length}-day avg`
        : painTrend === "worsening"
          ? `Pain up ${Math.abs(painDiff).toFixed(1)} pts vs ${recentLogs.length}-day avg`
          : `Pain stable (${currentLog.pain}/10)`;

    return { averagePain, painTrend, trendSummary };
  }

  /**
   * Select dosage level based on risk and trend
   */
  private selectDosageLevel(riskLevel: RiskLevel, trend: TrendAnalysis): "low" | "mod" {
    if (riskLevel === "high") return "low";
    if (trend.painTrend === "worsening") return "low";
    if (trend.painTrend === "improving" && riskLevel === "low") return "mod";
    return "low";
  }

  /**
   * Map area to body part for activation exercises
   * (e.g., knee → quads, shoulder → rotator_cuff)
   */
  private getBodyPartForArea(area: string): string {
    const mapping: Record<string, string> = {
      knee: "quads",
      shoulder: "rotator_cuff",
      ankle: "calf",
      hip: "glutes",
      elbow: "biceps",
      // Add more mappings as needed
    };
    return mapping[area] || area;
  }

  /**
   * Select a random exercise from a bucket
   */
  private async selectRandomFromBucket(
    bucketSlug: string,
    dosageLevel: "low" | "mod",
  ): Promise<ShortlistExercise | null> {
    const exercises = await db
      .from("exercises")
      .join("exercise_buckets", "exercises.bucket_id", "exercise_buckets.id")
      .where("exercise_buckets.slug", bucketSlug)
      .where("exercises.is_active", true)
      .select(
        "exercises.id",
        "exercises.name",
        "exercise_buckets.label as bucket",
        "exercises.dosage_low_json",
        "exercises.dosage_mod_json",
        "exercises.safety_notes",
      );

    if (exercises.length === 0) return null;

    // Select random exercise
    const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];

    // Choose dosage based on level (JSONB columns are already parsed objects)
    const dosageJson: DosageJson =
      dosageLevel === "low" ? randomExercise.dosage_low_json : randomExercise.dosage_mod_json;

    // Format dosage as text
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
    }

    if (dosage.rest_seconds) {
      parts.push(`${dosage.rest_seconds}s rest`);
    }

    if (dosage.notes) {
      parts.push(`• ${dosage.notes}`);
    }

    return parts.join(", ");
  }

  /**
   * Handle aggravator-specific exercise additions
   */
  private async handleAggravators(
    aggravators: string[],
    area: string,
  ): Promise<ShortlistExercise[]> {
    const additionalExercises: ShortlistExercise[] = [];

    // Aggravator rules (examples - expand as needed)
    if (aggravators.includes("stairs") && area === "knee") {
      const ex = await this.selectRandomFromBucket("activation_quads", "low");
      if (ex) additionalExercises.push(ex);
    }

    if (aggravators.includes("squatting") && area === "knee") {
      const ex = await this.selectRandomFromBucket("stability_lower", "low");
      if (ex) additionalExercises.push(ex);
    }

    // Add more aggravator rules as needed

    return additionalExercises;
  }

  /**
   * Deduplicate exercises by ID
   */
  private deduplicateExercises(exercises: ShortlistExercise[]): ShortlistExercise[] {
    const seen = new Set<number>();
    return exercises.filter((ex) => {
      if (seen.has(ex.id)) return false;
      seen.add(ex.id);
      return true;
    });
  }
}
