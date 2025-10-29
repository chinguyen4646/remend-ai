import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "user_onboarding_profiles";

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add user description as dedicated TEXT column
      table.text("user_description").nullable();

      // Add AI pattern JSON with versioned structure
      table.jsonb("ai_pattern_json").nullable();

      // Add custom area label for "other" selections
      table.string("area_other_label", 100).nullable();
    });

    // Update default value for onboarding_version from 1 to 2
    // Note: This only affects new rows; existing rows keep version 1
    this.schema.raw(`
      ALTER TABLE user_onboarding_profiles
      ALTER COLUMN onboarding_version SET DEFAULT 2
    `);
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("user_description");
      table.dropColumn("ai_pattern_json");
      table.dropColumn("area_other_label");
    });

    // Restore original default
    this.schema.raw(`
      ALTER TABLE user_onboarding_profiles
      ALTER COLUMN onboarding_version SET DEFAULT 1
    `);
  }
}
