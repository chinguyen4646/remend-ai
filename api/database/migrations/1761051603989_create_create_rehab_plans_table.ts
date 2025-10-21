import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "rehab_plans";

  async up() {
    // Create enum for plan_type
    this.schema.raw(`
      CREATE TYPE plan_type AS ENUM ('ai', 'fallback', 'manual');
    `);

    // Create enum for ai_status
    this.schema.raw(`
      CREATE TYPE ai_status AS ENUM ('pending', 'success', 'failed', 'skipped');
    `);

    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();

      table
        .integer("rehab_log_id")
        .unsigned()
        .references("id")
        .inTable("rehab_logs")
        .onDelete("CASCADE")
        .notNullable();

      // Plan type for analytics tracking
      table.specificType("plan_type", "plan_type").defaultTo("ai").notNullable();

      // Deterministic shortlist from DB rules
      table.jsonb("shortlist_json").notNullable();

      // AI-formatted output (nullable if AI failed)
      table.jsonb("ai_output_json").nullable();

      // AI status tracking
      table.specificType("ai_status", "ai_status").defaultTo("pending").notNullable();

      table.text("ai_error").nullable();

      // User context for transparency (notes, aggravators, trend)
      table.jsonb("user_context_json").notNullable();

      table.timestamp("generated_at", { useTz: true }).notNullable();
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });

      // Unique constraint: 1 plan per log
      table.unique(["rehab_log_id"]);

      // Indexes for analytics queries
      table.index(["plan_type", "ai_status"]);
      table.index(["generated_at"]);
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);

    // Drop enums
    this.schema.raw("DROP TYPE IF EXISTS ai_status");
    this.schema.raw("DROP TYPE IF EXISTS plan_type");
  }
}
