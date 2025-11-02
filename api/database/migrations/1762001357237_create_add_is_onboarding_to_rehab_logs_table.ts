import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "rehab_logs";

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Flag to identify logs created during onboarding
      table.boolean("is_onboarding").defaultTo(false).notNullable();
    });
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("is_onboarding");
    });
  }
}
