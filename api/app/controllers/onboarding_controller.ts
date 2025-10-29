import type { HttpContext } from "@adonisjs/core/http";
import UserOnboardingProfile from "#models/user_onboarding_profile";
import { submitOnboardingValidator } from "#validators/onboarding";
import logger from "@adonisjs/core/services/logger";
import { DateTime } from "luxon";
import aiConfig from "#config/ai";
import aiProvider from "#services/ai/openai_provider";

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
}
