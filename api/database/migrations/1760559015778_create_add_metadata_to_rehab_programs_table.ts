import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "rehab_programs";

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.jsonb("metadata").nullable();
    });
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("metadata");
    });
  }
}
