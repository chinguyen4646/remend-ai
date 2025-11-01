import type { HttpContext } from "@adonisjs/core/http";
import RehabPlan from "#models/rehab_plan";
import logger from "@adonisjs/core/services/logger";

export default class PlansController {
  /**
   * GET /api/rehab-plans/:id
   * Fetch a single rehab plan by ID
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!;
    const planId = params.id;

    try {
      const plan = await RehabPlan.query().where("id", planId).firstOrFail();

      // Handle ownership verification differently for initial vs regular plans
      if (plan.isInitial) {
        // Initial plans: verify ownership via onboarding profile
        await plan.load("onboardingProfile");

        if (plan.onboardingProfile.userId !== user.id) {
          return response.forbidden({
            errors: [{ message: "Unauthorized" }],
          });
        }
      } else {
        // Regular plans: verify ownership via log
        await plan.load("log", (logQuery) => {
          logQuery.preload("program");
        });

        if (plan.log.userId !== user.id) {
          return response.forbidden({
            errors: [{ message: "Unauthorized" }],
          });
        }
      }

      logger.info({ userId: user.id, planId, isInitial: plan.isInitial }, "Rehab plan fetched");

      return response.ok({ plan });
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.notFound({
          errors: [{ message: "Plan not found" }],
        });
      }
      throw error;
    }
  }
}
