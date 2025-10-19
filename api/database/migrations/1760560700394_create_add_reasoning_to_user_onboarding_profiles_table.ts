import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "user_onboarding_profiles";

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text("reasoning").notNullable();
    });
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("reasoning");
    });
  }
}
