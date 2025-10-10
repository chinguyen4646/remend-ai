import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rehab_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table
        .integer('program_id')
        .unsigned()
        .references('id')
        .inTable('rehab_programs')
        .onDelete('CASCADE')
      table.date('date').notNullable()
      table.integer('pain').unsigned().notNullable()
      table.integer('stiffness').unsigned().notNullable()
      table.integer('swelling').unsigned().nullable()
      table
        .enum('activity_level', ['rest', 'light', 'moderate', 'heavy'], {
          useNative: true,
          enumName: 'activity_level',
          existingType: false,
        })
        .nullable()
      table.text('notes').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      // Unique constraint: one log per day per program
      table.unique(['program_id', 'date'])

      // Indexes for efficient queries
      table.index(['user_id', 'date'])
      table.index(['program_id', 'date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS activity_level')
  }
}
