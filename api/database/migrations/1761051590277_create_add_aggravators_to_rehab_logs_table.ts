import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "rehab_logs";

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.jsonb("aggravators").defaultTo("[]").notNullable();
    });

    // Add GIN index for efficient jsonb queries
    this.schema.raw(
      'CREATE INDEX "idx_rehab_logs_aggravators" ON "rehab_logs" USING GIN ("aggravators")',
    );
  }

  async down() {
    this.schema.raw('DROP INDEX IF EXISTS "idx_rehab_logs_aggravators"');

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("aggravators");
    });
  }
}
