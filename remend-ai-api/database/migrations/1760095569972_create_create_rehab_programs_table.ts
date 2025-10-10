import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rehab_programs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table
        .enum(
          'area',
          [
            'knee',
            'ankle',
            'foot',
            'achilles',
            'calf',
            'hamstring',
            'quadriceps',
            'hip',
            'groin',
            'glute',
            'lower_back',
            'mid_back',
            'upper_back',
            'neck',
            'shoulder',
            'elbow',
            'wrist',
            'hand',
            'other',
          ],
          {
            useNative: true,
            enumName: 'rehab_area',
            existingType: false,
          }
        )
        .notNullable()
      table.string('area_other_label', 255).nullable()
      table
        .enum('side', ['left', 'right', 'both', 'na'], {
          useNative: true,
          enumName: 'rehab_side',
          existingType: false,
        })
        .notNullable()
      table.date('start_date').notNullable()
      table
        .enum('status', ['active', 'completed', 'paused'], {
          useNative: true,
          enumName: 'rehab_status',
          existingType: false,
        })
        .defaultTo('active')
        .notNullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      // Indexes
      table.index(['user_id', 'status'])

      // Partial unique index for one active program per user (PostgreSQL)
      this.schema.raw(
        "CREATE UNIQUE INDEX rehab_programs_user_id_active_unique ON rehab_programs (user_id) WHERE status = 'active'"
      )
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS rehab_area')
    this.schema.raw('DROP TYPE IF EXISTS rehab_side')
    this.schema.raw('DROP TYPE IF EXISTS rehab_status')
  }
}
