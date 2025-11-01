import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "rehab_plans";

  async up() {
    // Alter rehab_plans table to support initial onboarding plans
    this.schema.alterTable(this.tableName, (table) => {
      // Make rehab_log_id nullable (initial plans don't have a log yet)
      table.integer("rehab_log_id").unsigned().nullable().alter();

      // Flag to identify initial onboarding plans
      table.boolean("is_initial").defaultTo(false).notNullable();

      // Link to onboarding profile (for initial plans only)
      table
        .integer("onboarding_profile_id")
        .unsigned()
        .nullable()
        .references("id")
        .inTable("user_onboarding_profiles")
        .onDelete("SET NULL");

      // Store versioned AI context (pattern + mapping)
      table.jsonb("ai_context_json").nullable();
    });

    // Add performance index for exercise lookups
    this.schema.raw(`
      CREATE INDEX IF NOT EXISTS idx_exercises_bucket_active
      ON exercises (bucket_id, is_active)
    `);

    // Add index for initial plan queries
    this.schema.alterTable(this.tableName, (table) => {
      table.index(["is_initial", "onboarding_profile_id"]);
    });
  }

  async down() {
    // Remove performance index
    this.schema.raw(`DROP INDEX IF EXISTS idx_exercises_bucket_active`);

    // Revert rehab_plans changes
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(["is_initial", "onboarding_profile_id"]);
      table.dropColumn("ai_context_json");
      table.dropColumn("onboarding_profile_id");
      table.dropColumn("is_initial");

      // Make rehab_log_id NOT NULL again
      table.integer("rehab_log_id").unsigned().notNullable().alter();
    });
  }
}
