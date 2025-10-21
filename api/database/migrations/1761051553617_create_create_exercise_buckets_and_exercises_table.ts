import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  async up() {
    // Create exercise_buckets table
    this.schema.createTable("exercise_buckets", (table) => {
      table.increments("id").primary();
      table.string("area", 50).notNullable(); // knee, shoulder, back, hip, ankle, etc.
      table.string("slug", 100).notNullable(); // mobility_knee, activation_quads, etc.
      table.string("label", 200).notNullable(); // Knee Mobility, Quad Activation, etc.
      table.boolean("is_active").defaultTo(true).notNullable();
      table.integer("sort_order").defaultTo(0).notNullable();

      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });

      // Unique constraint on slug
      table.unique(["slug"]);

      // Indexes for efficient queries
      table.index(["area", "is_active"]);
      table.index(["sort_order"]);
    });

    // Create exercises table
    this.schema.createTable("exercises", (table) => {
      table.increments("id").primary();
      table
        .integer("bucket_id")
        .unsigned()
        .references("id")
        .inTable("exercise_buckets")
        .onDelete("CASCADE")
        .notNullable();

      table.string("name", 200).notNullable();
      table.text("description").nullable();

      // Hybrid dosage format: JSON for logic, pre-formatted for history
      table.jsonb("dosage_low_json").notNullable();
      table.jsonb("dosage_mod_json").notNullable();

      table.text("safety_notes").nullable();
      table.boolean("is_active").defaultTo(true).notNullable();
      table.integer("sort_order").defaultTo(0).notNullable();

      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });

      // Unique constraint: bucket + name
      table.unique(["bucket_id", "name"]);

      // Indexes
      table.index(["bucket_id", "is_active", "sort_order"]);
    });
  }

  async down() {
    this.schema.dropTable("exercises");
    this.schema.dropTable("exercise_buckets");
  }
}
