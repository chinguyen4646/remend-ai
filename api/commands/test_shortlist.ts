import { BaseCommand } from "@adonisjs/core/ace";
import { CommandOptions } from "@adonisjs/core/types/ace";
import RehabProgram from "#models/rehab_program";
import RehabLog from "#models/rehab_log";
import ShortlistService from "#services/exercises/shortlist_service";
import openaiProvider from "#services/ai/openai_provider";
import type {
  ShortlistExercise,
  UserContextJson,
  AIOutputJson,
} from "#services/ai/provider_interface";
import { DateTime } from "luxon";

export default class TestShortlist extends BaseCommand {
  static commandName = "test:shortlist";
  static description = "Test shortlist generation for a user's rehab program";

  static options: CommandOptions = {
    startApp: true, // Start the app to access database
  };

  async run() {
    this.logger.info("🧪 Testing shortlist generation...");

    try {
      // Find first active rehab program
      const program = await RehabProgram.query().where("id", 15).preload("rehabLogs").firstOrFail();

      this.logger.info(`Found program: ${program.area} (user_id: ${program.userId})`);

      // Create a mock log for testing
      const mockLog = new RehabLog();
      mockLog.userId = program.userId;
      mockLog.programId = program.id;
      mockLog.date = DateTime.now();
      mockLog.pain = 5;
      mockLog.stiffness = 4;
      mockLog.swelling = 3;
      mockLog.activityLevel = "moderate";
      mockLog.notes = "Knee felt better today after rest";
      mockLog.aggravators = ["stairs", "squatting"];

      this.logger.info("Created mock log with pain=5, aggravators=['stairs', 'squatting']");

      // Generate shortlist
      const shortlistService = new ShortlistService();
      const shortlist = await shortlistService.generateShortlist(mockLog, program);

      this.logger.info(`✅ Shortlist generated with ${shortlist.length} exercises:`);
      shortlist.forEach((ex, idx) => {
        this.logger.info(`  ${idx + 1}. ${ex.name} (${ex.bucket})`);
        this.logger.info(`     Dosage: ${ex.dosage_text}`);
        if (ex.safety_notes) {
          this.logger.info(`     Safety: ${ex.safety_notes}`);
        }
      });

      // Test plan formatter
      this.logger.info("\n🎨 Testing AI plan formatter...");

      const userContext: UserContextJson = {
        notes: mockLog.notes || "",
        aggravators: mockLog.aggravators,
        trend_summary: "Pain down 1.5 pts vs 7-day avg",
      };

      // Test fallback first (no AI call)
      const fallbackPlan = this.generateFallbackPlan(shortlist, userContext);
      this.logger.info("✅ Fallback plan generated:");
      this.logger.info(`  Summary: ${fallbackPlan.summary}`);
      this.logger.info(`  Bullets: ${fallbackPlan.bullets.length}`);

      // Test AI formatting (only if AI_ENABLED=true)
      const aiEnabled = process.env.AI_ENABLED === "true";
      if (aiEnabled && process.env.OPENAI_API_KEY) {
        this.logger.info("\n🤖 Testing with actual AI...");
        const aiPlan = await openaiProvider.formatExercisePlan(shortlist, userContext);
        this.logger.info("✅ AI plan generated:");
        this.logger.info(`  Summary: ${aiPlan.summary}`);
        aiPlan.bullets.forEach((bullet, idx) => {
          this.logger.info(`  ${idx + 1}. ${bullet.exercise_name}`);
          this.logger.info(`     ${bullet.dosage_text}`);
          this.logger.info(`     💡 ${bullet.coaching}`);
        });
        if (aiPlan.caution) {
          this.logger.info(`  ⚠️  Caution: ${aiPlan.caution}`);
        }
      } else {
        this.logger.warning("⚠️  Skipping AI test (AI_ENABLED=false or no API key)");
      }

      this.logger.success("\n✨ All tests passed!");
    } catch (error) {
      this.logger.error("❌ Test failed:");
      this.logger.error(error.message);
      if (error.stack) {
        this.logger.error(error.stack);
      }
      process.exit(1);
    }
  }

  /**
   * Generate fallback plan (no AI)
   */
  private generateFallbackPlan(
    shortlist: ShortlistExercise[],
    userContext: UserContextJson,
  ): AIOutputJson {
    const summary =
      userContext.trend_summary === "First log entry"
        ? "Great job starting your rehab journey! Here's your plan for today."
        : `Your pain trend: ${userContext.trend_summary}. Here's your personalized plan.`;

    const bullets = shortlist.map((ex) => ({
      exercise_id: ex.id,
      exercise_name: ex.name,
      dosage_text: ex.dosage_text,
      coaching: "Focus on proper form and listen to your body.",
    }));

    return {
      summary,
      bullets,
      caution: undefined,
    };
  }
}
