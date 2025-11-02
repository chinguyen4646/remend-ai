import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "rehab_plans";

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Parent plan ID for progression chain (self-referencing FK)
      table
        .integer("parent_plan_id")
        .unsigned()
        .nullable()
        .references("id")
        .inTable("rehab_plans")
        .onDelete("SET NULL");

      // Trend classification for adaptive plans
      table.string("trend", 20).nullable();

      // AI-generated coaching feedback (GPT-4o-mini output)
      table.jsonb("ai_feedback_json").nullable();
    });

    // Performance index for latest plan queries
    this.schema.raw(`
      CREATE INDEX IF NOT EXISTS idx_plans_generated_at
      ON rehab_plans (generated_at DESC)
    `);
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("ai_feedback_json");
      table.dropColumn("trend");
      table.dropColumn("parent_plan_id");
    });

    this.schema.raw(`DROP INDEX IF EXISTS idx_plans_generated_at`);
  }
}
