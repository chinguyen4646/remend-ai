import type { HttpContext } from "@adonisjs/core/http";
import UserOnboardingProfile from "#models/user_onboarding_profile";
import RehabPlan from "#models/rehab_plan";
import RehabLog from "#models/rehab_log";
import RehabProgram from "#models/rehab_program";
import { submitOnboardingValidator } from "#validators/onboarding";
import logger from "@adonisjs/core/services/logger";
import { DateTime } from "luxon";
import { todayInTimezone } from "#utils/dates";
import aiConfig from "#config/ai";
import aiProvider from "#services/ai/openai_provider";
import InitialPlanService from "#services/exercises/initial_plan_service";

export default class OnboardingController {
  /**
   * Submit onboarding data and get mode suggestion (V2 with AI insight)
   * POST /api/onboarding/submit
   */
  async submit({ auth, request, response }: HttpContext) {
    const user = auth.user!;
    const data = await request.validateUsing(submitOnboardingValidator);

    // Extract fields for dedicated columns
    const { modeSelected, userDescription, areaOtherLabel, ...onboardingData } = data;

    // Hardcode mode to rehab (maintenance mode disabled)
    const finalModeSelected = "rehab";

    // Initialize AI insight variables
    let aiPatternJson = null;
    let riskLevel: "low" | "medium" | "high" = "low";
    let reasoning = "Starting with gentle rehab approach";

    // Try AI analysis if enabled
    if (aiConfig.enabled) {
      try {
        const aiResult = await aiProvider.getOnboardingInsight({
          area: data.area,
          areaOtherLabel: data.areaOtherLabel,
          userDescription: data.userDescription,
          onset: data.onset,
          painRest: data.painRest,
          painActivity: data.painActivity,
          stiffness: data.stiffness,
          aggravators: data.aggravators,
          easers: data.easers,
          redFlags: data.redFlags,
        });

        // Wrap in versioned structure
        aiPatternJson = {
          version: "1.0",
          data: aiResult,
        };

        reasoning = `AI insight: ${aiResult.suspected_pattern} (${aiResult.confidence} confidence)`;

        logger.info(
          {
            userId: user.id,
            confidence: aiResult.confidence,
            pattern: aiResult.suspected_pattern,
          },
          "AI onboarding insight generated",
        );
      } catch (error) {
        logger.warn(
          {
            userId: user.id,
            error: error.message,
          },
          "AI onboarding insight failed, using fallback",
        );
        // Continue with null aiPatternJson - fallback handled in frontend
      }
    }

    // Compute risk level from red flags and pain levels
    if (data.redFlags && data.redFlags.length > 0) {
      riskLevel = "high";
      reasoning = "Red flags detected - conservative approach recommended";
    } else if (data.painRest >= 7 || data.painActivity >= 7) {
      riskLevel = "medium";
      reasoning = "Elevated pain levels - gentle progression recommended";
    }

    // Create onboarding profile (V2)
    const profile = await UserOnboardingProfile.create({
      userId: user.id,
      data: onboardingData,
      userDescription,
      areaOtherLabel: areaOtherLabel || null,
      aiPatternJson,
      modeSuggestion: "rehab", // Always rehab
      modeSelected: finalModeSelected,
      riskLevel,
      reasoning,
      onboardingVersion: 2, // V2
    });

    // Update user's current profile reference
    user.currentProfileId = profile.id;

    // Update user mode and injuryType
    user.mode = finalModeSelected;
    user.injuryType = data.area === "other" ? data.areaOtherLabel || "other" : data.area;
    user.modeStartedAt = DateTime.utc();

    await user.save();

    logger.info(
      {
        userId: user.id,
        profileId: profile.id,
        riskLevel,
        hasAiInsight: aiPatternJson !== null,
        onboardingVersion: 2,
      },
      "Onboarding V2 completed",
    );

    return response.created({
      profile: {
        id: profile.id,
        modeSuggestion: "rehab",
        modeSelected: finalModeSelected,
        riskLevel,
        reasoning,
        aiPatternJson, // Include AI insight in response
        onboardingVersion: 2,
      },
    });
  }

  /**
   * Get current user's onboarding profile
   * GET /api/onboarding/profile
   */
  async getProfile({ auth, response }: HttpContext) {
    const user = auth.user!;

    await user.load("currentProfile");

    if (!user.currentProfile) {
      return response.notFound({
        errors: [{ message: "No onboarding profile found" }],
      });
    }

    const profile = user.currentProfile;

    return response.ok({
      profile: {
        id: profile.id,
        modeSuggestion: profile.modeSuggestion,
        modeSelected: profile.modeSelected,
        riskLevel: profile.riskLevel,
        reasoning: profile.reasoning,
        data: profile.data,
        userDescription: profile.userDescription, // V2
        areaOtherLabel: profile.areaOtherLabel, // V2
        aiPatternJson: profile.aiPatternJson, // V2
        onboardingVersion: profile.onboardingVersion,
        createdAt: profile.createdAt,
      },
    });
  }

  /**
   * Create initial exercise plan from onboarding profile
   * POST /api/onboarding/create-initial-plan
   *
   * Creates Day 1 log + links initial plan (continuity update)
   */
  async createInitialPlan({ auth, response }: HttpContext) {
    const user = auth.user!;

    // Load current onboarding profile
    await user.load("currentProfile");

    if (!user.currentProfile) {
      return response.notFound({
        errors: [{ message: "No onboarding profile found. Complete onboarding first." }],
      });
    }

    const profile = user.currentProfile;

    // Validate AI pattern exists
    if (!profile.aiPatternJson) {
      return response.badRequest({
        errors: [
          {
            message: "AI pattern analysis required to generate initial plan",
          },
        ],
      });
    }

    // Find user's active rehab program
    const program = await RehabProgram.query()
      .where("user_id", user.id)
      .where("status", "active")
      .orderBy("created_at", "desc")
      .first();

    if (!program) {
      return response.notFound({
        errors: [{ message: "No active rehab program found. Please create a program first." }],
      });
    }

    // IDEMPOTENCY CHECK: Check if onboarding log already exists
    const existingLog = await RehabLog.query()
      .where("program_id", program.id)
      .where("is_onboarding", true)
      .first();

    if (existingLog) {
      // Load the plan for this log
      await existingLog.load("plan");

      logger.info(
        {
          userId: user.id,
          profileId: profile.id,
          logId: existingLog.id,
          planId: existingLog.plan?.id,
        },
        "Onboarding log already exists, returning existing log/plan",
      );

      return response.ok({
        log: existingLog,
        plan: existingLog.plan,
      });
    }

    try {
      // Get today's date in user's timezone
      const logDate = todayInTimezone(user.tz);

      // Create onboarding log using onboarding data
      const painAverage = Math.round((profile.data.painRest + profile.data.painActivity) / 2);

      // Build contextual notes
      const redFlagsText = profile.data.redFlags?.length
        ? profile.data.redFlags.join(", ")
        : "none";
      const notesText = `Pain described: ${profile.userDescription}. Onset: ${profile.data.onset}. Red flags: ${redFlagsText}.`;

      const log = await RehabLog.create({
        userId: user.id,
        programId: program.id,
        date: DateTime.fromISO(logDate),
        pain: painAverage,
        stiffness: profile.data.stiffness,
        swelling: null,
        activityLevel: null,
        notes: notesText,
        aggravators: profile.data.aggravators || [],
        isOnboarding: true,
      });

      logger.info(
        {
          userId: user.id,
          profileId: profile.id,
          logId: log.id,
          date: logDate,
        },
        "Onboarding log created (Day 1)",
      );

      // Generate initial plan using InitialPlanService
      const planService = new InitialPlanService();
      const { exercises, mappingResult } = await planService.generateInitialPlan(profile);

      // Build versioned AI context
      const aiContextJson = {
        version: "1.0",
        pattern: profile.aiPatternJson,
        mapping: mappingResult,
      };

      // Check if initial plan already exists for this profile (from previous implementation)
      let plan = await RehabPlan.query()
        .where("onboarding_profile_id", profile.id)
        .where("is_initial", true)
        .first();

      if (plan) {
        // Update existing plan with log ID
        plan.rehabLogId = log.id;
        await plan.save();

        logger.info(
          {
            userId: user.id,
            profileId: profile.id,
            planId: plan.id,
            logId: log.id,
          },
          "Linked existing initial plan to onboarding log",
        );
      } else {
        // Create new plan linked to log
        plan = await RehabPlan.create({
          rehabLogId: log.id,
          isInitial: true,
          onboardingProfileId: profile.id,
          planType: "ai", // Generated from AI pattern analysis
          shortlistJson: { exercises },
          aiOutputJson: null, // Initial plans don't use AI formatting
          aiStatus: "skipped", // No AI formatting needed
          aiError: null,
          aiContextJson,
          userContextJson: {
            area: profile.data.area,
            date: logDate,
          },
          generatedAt: DateTime.now(),
        });

        logger.info(
          {
            userId: user.id,
            profileId: profile.id,
            planId: plan.id,
            logId: log.id,
            buckets: mappingResult.buckets,
            exerciseCount: exercises.length,
            confidence: mappingResult.confidenceLevel,
          },
          "Initial plan created and linked to onboarding log",
        );
      }

      return response.created({
        log,
        plan,
      });
    } catch (error) {
      logger.error(
        {
          userId: user.id,
          profileId: profile.id,
          error: error.message,
          stack: error.stack,
        },
        "Failed to create onboarding log/plan",
      );

      return response.internalServerError({
        errors: [
          {
            message: "Failed to generate initial exercise plan. Please try again.",
          },
        ],
      });
    }
  }
}
