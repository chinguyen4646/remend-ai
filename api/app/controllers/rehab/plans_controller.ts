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
      const plan = await RehabPlan.query()
        .where("id", planId)
        .preload("log", (logQuery) => {
          logQuery.preload("program");
        })
        .firstOrFail();

      // Verify ownership via log.userId
      if (plan.log.userId !== user.id) {
        return response.forbidden({
          errors: [{ message: "Unauthorized" }],
        });
      }

      logger.info({ userId: user.id, planId }, "Rehab plan fetched");

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
