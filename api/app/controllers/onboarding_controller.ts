import type { HttpContext } from "@adonisjs/core/http";
import UserOnboardingProfile from "#models/user_onboarding_profile";
import { submitOnboardingValidator } from "#validators/onboarding";
import { computeModeSuggestion } from "#utils/onboarding_logic";
import logger from "@adonisjs/core/services/logger";
import { DateTime } from "luxon";

export default class OnboardingController {
  /**
   * Submit onboarding data and get mode suggestion
   * POST /api/onboarding/submit
   */
  async submit({ auth, request, response }: HttpContext) {
    const user = auth.user!;
    const data = await request.validateUsing(submitOnboardingValidator);

    // Extract mode selection and prepare onboarding data
    const { modeSelected, ...onboardingData } = data;

    // Compute mode suggestion and risk level
    const { modeSuggestion, riskLevel, reasoning } = computeModeSuggestion(onboardingData);

    // Create onboarding profile
    const profile = await UserOnboardingProfile.create({
      userId: user.id,
      data: onboardingData,
      modeSuggestion,
      modeSelected,
      riskLevel,
      reasoning,
      onboardingVersion: 1,
    });

    // Update user's current profile reference
    user.currentProfileId = profile.id;

    // Update user mode and injuryType (for backward compatibility)
    user.mode = modeSelected;
    user.injuryType =
      onboardingData.area === "other"
        ? onboardingData.areaOtherLabel || "other"
        : onboardingData.area;
    user.modeStartedAt = DateTime.utc();

    await user.save();

    logger.info(
      {
        userId: user.id,
        profileId: profile.id,
        modeSuggestion,
        modeSelected,
        riskLevel,
        wasOverridden: modeSuggestion !== modeSelected,
      },
      "Onboarding completed",
    );

    return response.created({
      profile: {
        id: profile.id,
        modeSuggestion,
        modeSelected,
        riskLevel,
        reasoning,
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
        onboardingVersion: profile.onboardingVersion,
        createdAt: profile.createdAt,
      },
    });
  }
}
