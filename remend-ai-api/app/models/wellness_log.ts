import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class WellnessLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare mode: 'maintenance' | 'general'

  @column.date({
    serialize: (value: DateTime | null) => value?.toISODate() ?? null,
  })
  declare date: DateTime

  @column()
  declare pain: number | null

  @column()
  declare stiffness: number | null

  @column()
  declare tension: number | null

  @column()
  declare energy: number | null

  @column()
  declare areaTag: string | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
