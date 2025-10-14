import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "users";

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum("mode", ["rehab", "maintenance", "general"], {
          useNative: true,
          enumName: "user_mode",
          existingType: false,
        })
        .defaultTo("general")
        .notNullable();
      table.string("injury_type", 255).nullable();
      table.timestamp("mode_started_at").nullable();
    });
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("mode");
      table.dropColumn("injury_type");
      table.dropColumn("mode_started_at");
    });
    this.schema.raw("DROP TYPE IF EXISTS user_mode");
  }
}
