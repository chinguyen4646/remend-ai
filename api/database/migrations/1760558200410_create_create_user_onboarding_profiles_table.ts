import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "user_onboarding_profiles";

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();

      table
        .integer("user_id")
        .unsigned()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE")
        .notNullable();

      // JSONB column for structured onboarding data
      table.jsonb("data").notNullable();

      // Computed fields
      table
        .enum("mode_suggestion", ["rehab", "maintenance"], {
          useNative: true,
          enumName: "mode_suggestion_enum",
          existingType: false,
        })
        .notNullable();

      table
        .enum("mode_selected", ["rehab", "maintenance"], {
          useNative: true,
          enumName: "mode_selected_enum",
          existingType: false,
        })
        .notNullable();

      table
        .enum("risk_level", ["low", "medium", "high"], {
          useNative: true,
          enumName: "risk_level_enum",
          existingType: false,
        })
        .notNullable();

      table.integer("onboarding_version").notNullable().defaultTo(1);

      table.timestamp("created_at").notNullable();
      table.timestamp("updated_at").notNullable();
    });

    // Add current_profile_id to users table
    this.schema.alterTable("users", (table) => {
      table
        .integer("current_profile_id")
        .unsigned()
        .references("id")
        .inTable("user_onboarding_profiles")
        .onDelete("SET NULL")
        .nullable();
    });
  }

  async down() {
    this.schema.alterTable("users", (table) => {
      table.dropColumn("current_profile_id");
    });

    this.schema.dropTable(this.tableName);
  }
}
