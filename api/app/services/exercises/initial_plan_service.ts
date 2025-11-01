/**
 * InitialPlanService: Generate first exercise plan from onboarding data
 *
 * Simplified version of ShortlistService for onboarding:
 * - No log/trend analysis (user has no history yet)
 * - Uses AI pattern + area from onboarding
 * - Always uses low dosage for safety
 * - Returns 2-3 exercises from mapped buckets
 */

import db from "@adonisjs/lucid/services/db";
import type { DosageJson } from "#models/exercise";
import type { ShortlistExercise } from "#services/ai/provider_interface";
import type UserOnboardingProfile from "#models/user_onboarding_profile";
import PatternMapperService, {
  type PatternMappingResult,
} from "#services/exercises/pattern_mapper_service";

export interface InitialPlanResult {
  exercises: ShortlistExercise[];
  mappingResult: PatternMappingResult;
}

export default class InitialPlanService {
  private patternMapper = new PatternMapperService();

  /**
   * Generate initial exercise plan from onboarding profile
   *
   * @param profile - User's onboarding profile
   * @returns Exercise list and mapping metadata
   */
  async generateInitialPlan(profile: UserOnboardingProfile): Promise<InitialPlanResult> {
    // Extract AI pattern data
    if (!profile.aiPatternJson) {
      throw new Error("Onboarding profile missing AI pattern analysis");
    }

    const aiPattern = profile.aiPatternJson.data;
    const area = profile.data.area;

    // Map AI pattern to exercise buckets
    const mappingResult = this.patternMapper.mapPattern({
      suspectedPattern: aiPattern.suspected_pattern,
      recommendedFocus: aiPattern.recommended_focus,
      confidence: aiPattern.confidence,
      area,
    });

    // Select 2-3 exercises from mapped buckets
    const exercises = await this.selectExercisesFromBuckets(mappingResult.buckets);

    // Ensure at least 2 exercises (should always pass due to fallback buckets)
    if (exercises.length === 0) {
      throw new Error(
        `Failed to generate initial plan: no exercises found in buckets [${mappingResult.buckets.join(", ")}]`,
      );
    }

    return {
      exercises: exercises.slice(0, 3), // Limit to 3 exercises max
      mappingResult,
    };
  }

  /**
   * Select 2-3 random exercises from the given buckets
   * Diversifies across buckets when possible
   */
  private async selectExercisesFromBuckets(bucketSlugs: string[]): Promise<ShortlistExercise[]> {
    const selectedExercises: ShortlistExercise[] = [];
    const usedBuckets = new Set<string>();

    // First pass: One exercise from each bucket (up to 3)
    for (const bucketSlug of bucketSlugs) {
      if (selectedExercises.length >= 3) break;

      const exercise = await this.selectRandomFromBucket(bucketSlug);
      if (exercise) {
        selectedExercises.push(exercise);
        usedBuckets.add(bucketSlug);
      }
    }

    // Second pass: If we have < 2 exercises, try to get more from any bucket
    if (selectedExercises.length < 2) {
      for (const bucketSlug of bucketSlugs) {
        if (selectedExercises.length >= 3) break;

        // Try to get another exercise from this bucket
        const exercise = await this.selectRandomFromBucket(bucketSlug, selectedExercises);
        if (exercise) {
          selectedExercises.push(exercise);
        }
      }
    }

    return selectedExercises;
  }

  /**
   * Select a random exercise from a bucket
   * Always uses LOW dosage for initial plans (safety first)
   *
   * @param bucketSlug - Exercise bucket slug
   * @param excludeExercises - Already selected exercises to avoid duplicates
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
        "exercises.safety_notes",
      );

    // Exclude already selected exercises
    if (excludeIds.length > 0) {
      query.whereNotIn("exercises.id", excludeIds);
    }

    const exercises = await query;

    if (exercises.length === 0) return null;

    // Select random exercise
    const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];

    // Always use LOW dosage for initial plans
    const dosageJson: DosageJson = randomExercise.dosage_low_json;
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
   * (Same logic as ShortlistService)
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
      // Handle time-only exercises (e.g., walking)
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
