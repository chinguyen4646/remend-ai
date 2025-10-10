import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'wellness_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table
        .enum('mode', ['maintenance', 'general'], {
          useNative: true,
          enumName: 'wellness_mode',
          existingType: false,
        })
        .notNullable()
      table.date('date').notNullable()
      table.integer('pain').unsigned().nullable()
      table.integer('stiffness').unsigned().nullable()
      table.integer('tension').unsigned().nullable()
      table.integer('energy').unsigned().nullable()
      table.string('area_tag', 255).nullable()
      table.text('notes').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      // Unique constraint: one wellness log per day per user per mode
      table.unique(['user_id', 'mode', 'date'])

      // Index for efficient queries
      table.index(['user_id', 'mode', 'date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS wellness_mode')
  }
}
