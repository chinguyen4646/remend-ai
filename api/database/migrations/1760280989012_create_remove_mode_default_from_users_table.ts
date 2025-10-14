import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "users";

  async up() {
    // Remove NOT NULL constraint and default value
    this.schema.raw("ALTER TABLE users ALTER COLUMN mode DROP NOT NULL");
    this.schema.raw("ALTER TABLE users ALTER COLUMN mode DROP DEFAULT");
  }

  async down() {
    // Restore NOT NULL and default value
    this.schema.raw("ALTER TABLE users ALTER COLUMN mode SET DEFAULT 'general'");
    this.schema.raw("ALTER TABLE users ALTER COLUMN mode SET NOT NULL");
  }
}
