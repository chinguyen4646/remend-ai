import { BaseCommand } from "@adonisjs/core/ace";
import { CommandOptions } from "@adonisjs/core/types/ace";
import User from "#models/user";
import RehabProgram from "#models/rehab_program";
import RehabLog from "#models/rehab_log";
import RehabPlan from "#models/rehab_plan";
import { DateTime } from "luxon";
import ShortlistService from "#services/exercises/shortlist_service";
import openaiProvider from "#services/ai/openai_provider";
import AdherenceService from "#services/rehab/adherence_service";
import WeeklySummaryFormatter from "#services/ai/weekly_summary_formatter";

export default class SeedAdherenceData extends BaseCommand {
  static commandName = "seed:adherence";
  static description = "Seed database with realistic adherence data for testing";

  static options: CommandOptions = {
    startApp: true, // This ensures the app is fully booted
  };

  async run() {
    this.logger.info("🌱 Starting adherence data seeding...");

    try {
      // 1. Create test user (delete existing if found)
      this.logger.info("Step 1: Creating test user...");
      const testEmail = "adherence-test@example.com";
      const plainPassword = "password123";
      let user = await User.findBy("email", testEmail);

      if (user) {
        this.logger.info(`✓ Found existing user, deleting for fresh start...`);
        await user.delete();
      }

      user = await User.create({
        email: testEmail,
        password: plainPassword,
        fullName: "Adherence Test User",
        mode: "rehab",
        tz: "America/Los_Angeles",
      });
      this.logger.info(`✓ Created new user: ${testEmail}`);

      // 2. Create rehab program (started 14 days ago)
      this.logger.info("\nStep 2: Creating rehab program...");
      const startDate = DateTime.now().minus({ days: 14 });

      // Delete any existing active programs for clean slate
      await RehabProgram.query().where("user_id", user.id).where("status", "active").delete();

      const program = await RehabProgram.create({
        userId: user.id,
        area: "knee",
        side: "left",
        startDate: startDate,
        status: "active",
        metadata: {
          goal: "Return to running",
          riskLevel: "moderate",
          onset: "gradual",
          painRest: 3,
          painActivity: 7,
        },
      });

      this.logger.info(`✓ Created program #${program.id} (started ${startDate.toISODate()})`);

      // 3. Seed logs with realistic progression
      this.logger.info("\nStep 3: Seeding rehab logs...");

      // Define log schedule: days with logs (0 = 14 days ago, 13 = yesterday)
      // Pattern: Log on days 0,1,3,4,5,7,8,10,11,12,13 (11 logs, gaps on days 2,6,9)
      const logDays = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12, 13];

      // Pain/stiffness progression (improving trend)
      const painLevels = [7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 3];
      const stiffnessLevels = [8, 8, 7, 7, 6, 5, 5, 4, 4, 3, 3];

      const notes = [
        "First day of rehab. Knee feels pretty stiff.",
        "Did the exercises slowly. Some discomfort but manageable.",
        "Skipped yesterday but feeling better today.",
        "Starting to get the hang of these exercises.",
        "Noticed less pain when going up stairs!",
        "Took a rest day, back at it now.",
        "Exercises are getting easier each day.",
        "Missed a couple days but consistency is improving.",
        "Pain is definitely decreasing. Feeling hopeful!",
        "Almost no pain at rest now. Great progress!",
        "Feeling strong and confident. Knee stability improving.",
      ];

      const logs: RehabLog[] = [];

      for (let i = 0; i < logDays.length; i++) {
        const daysAgo = 13 - logDays[i]; // Convert to days ago (0 = yesterday)
        const logDate = DateTime.now().minus({ days: daysAgo }).startOf("day");

        const log = await RehabLog.create({
          userId: user.id,
          programId: program.id,
          date: logDate,
          pain: painLevels[i],
          stiffness: stiffnessLevels[i],
          swelling: Math.max(0, 5 - i), // Decreasing swelling
          activityLevel: i < 3 ? "light" : i < 7 ? "moderate" : "heavy",
          notes: notes[i],
          aggravators: i < 5 ? ["stairs", "squatting"] : i < 8 ? ["stairs"] : [],
        });

        logs.push(log);
        this.logger.info(
          `  ✓ Log ${i + 1}/11: ${logDate.toISODate()} | Pain: ${painLevels[i]}, Stiffness: ${stiffnessLevels[i]}`,
        );
      }

      // 4. Generate exercise plans for each log
      this.logger.info("\nStep 4: Generating exercise plans...");

      for (let i = 0; i < logs.length; i++) {
        const log = logs[i];

        try {
          // Generate shortlist
          const shortlistService = new ShortlistService();
          const shortlist = await shortlistService.generateShortlist(log, program);

          if (shortlist.length === 0) {
            this.logger.warning(`  ⚠ No exercises found for log ${i + 1}, skipping...`);
            continue;
          }

          // Build user context
          const userContext = {
            notes: log.notes || "",
            aggravators: log.aggravators,
            trend_summary: i === 0 ? "First log entry" : "Progress trending positively",
          };

          // Format with AI (with fallback)
          let aiOutput = null;
          let aiStatus: "success" | "failed" = "success";
          let aiError: string | null = null;

          try {
            aiOutput = await openaiProvider.formatExercisePlan(shortlist, userContext);
          } catch (error) {
            aiStatus = "failed";
            aiError = (error as Error).message;
            aiOutput = {
              summary: "Here's your rehab plan for today.",
              bullets: shortlist.slice(0, 4).map((ex) => ({
                exercise_id: ex.id,
                exercise_name: ex.name,
                dosage_text: ex.dosage_text,
                coaching: "Focus on proper form.",
              })),
            };
          }

          // Save plan
          await RehabPlan.create({
            rehabLogId: log.id,
            isInitial: false,
            planType: aiStatus === "success" ? "ai" : "fallback",
            shortlistJson: { exercises: shortlist },
            aiOutputJson: aiOutput,
            aiStatus,
            aiError,
            userContextJson: userContext,
            generatedAt: log.date, // Use log date for realistic timing
          });

          this.logger.info(`  ✓ Plan ${i + 1}/11 generated (${aiStatus})`);
        } catch (error) {
          this.logger.warning(
            `  ⚠ Failed to generate plan for log ${i + 1}: ${(error as Error).message}`,
          );
        }
      }

      // 5. Calculate streaks for all logs
      this.logger.info("\nStep 5: Calculating streaks...");
      const adherenceService = new AdherenceService();

      for (const log of logs) {
        await adherenceService.calculateStreak(program.id, log.date);
      }

      await program.refresh();
      this.logger.info(
        `✓ Current streak: ${program.currentStreak} days | Longest: ${program.longestStreak} days`,
      );

      // 6. Force generate weekly summary
      this.logger.info("\nStep 6: Generating weekly summary...");

      const adherence = await adherenceService.calculateAdherence(program.id);
      const weeklyData = await adherenceService.getLastWeekSummary(program.id);

      const summaryFormatter = new WeeklySummaryFormatter();
      const summary = await summaryFormatter.generateSummary({
        adherenceRate: adherence.adherenceRate,
        currentStreak: adherence.currentStreak,
        avgPainChange: weeklyData.avgPainChange,
        avgStiffnessChange: weeklyData.avgStiffnessChange,
        logsThisWeek: weeklyData.logsThisWeek,
        trend: weeklyData.trend,
      });

      // Refresh program to get latest streak values before saving
      await program.refresh();

      program.lastSummaryJson = summary;
      program.lastSummaryGeneratedAt = DateTime.now();
      await program.save();

      this.logger.info(`✓ Weekly summary generated`);

      // 7. Output summary
      this.logger.success("\n🎉 Seeding completed successfully!\n");

      this.logger.info("📊 Summary:");
      this.logger.info(`  User: ${user.email}`);
      this.logger.info(`  Program ID: ${program.id}`);
      this.logger.info(`  Logs created: ${logs.length}`);
      this.logger.info(`  Current streak: ${program.currentStreak} days`);
      this.logger.info(`  Adherence rate: ${Math.round(adherence.adherenceRate * 100)}%`);
      this.logger.info(`  Pain change (week): ${weeklyData.avgPainChange.toFixed(1)}`);
      this.logger.info(`  Stiffness change (week): ${weeklyData.avgStiffnessChange.toFixed(1)}`);

      this.logger.info("\n💬 Weekly Summary:");
      this.logger.info(`  ${summary.emoji} ${summary.summary}`);
      this.logger.info(`  Highlights: ${summary.highlights.join(", ")}`);

      // Generate access token for testing
      const token = await User.accessTokens.create(user);

      this.logger.info("\n🧪 Test Commands:");
      this.logger.info(`\n# Login`);
      this.logger.info(`export TOKEN="${token.value!.release()}"`);

      this.logger.info(`\n# Get program summary`);
      this.logger.info(
        `curl -X GET "http://localhost:3333/api/rehab-programs/${program.id}/summary" \\`,
      );
      this.logger.info(`  -H "Authorization: Bearer $TOKEN" | jq`);

      this.logger.info(`\n# Get logs (last 14 days)`);
      this.logger.info(
        `curl -X GET "http://localhost:3333/api/rehab-logs?programId=${program.id}&range=last_14" \\`,
      );
      this.logger.info(`  -H "Authorization: Bearer $TOKEN" | jq`);

      this.logger.info("\n✅ Ready to test adherence features in the app!\n");
    } catch (error) {
      this.logger.error(`❌ Seeding failed: ${(error as Error).message}`);
      this.logger.error((error as Error).stack || "");
      this.exitCode = 1;
    }
  }
}
