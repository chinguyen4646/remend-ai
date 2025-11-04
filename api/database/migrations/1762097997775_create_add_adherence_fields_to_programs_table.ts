import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "rehab_programs";

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Streak tracking
      table.integer("current_streak").defaultTo(0).notNullable();
      table.integer("longest_streak").defaultTo(0).notNullable();

      // Log tracking
      table.timestamp("last_logged_at").nullable();

      // Weekly summary tracking
      table.timestamp("last_summary_generated_at").nullable();
      table.jsonb("last_summary_json").nullable();
    });
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("last_summary_json");
      table.dropColumn("last_summary_generated_at");
      table.dropColumn("last_logged_at");
      table.dropColumn("longest_streak");
      table.dropColumn("current_streak");
    });
  }
}
