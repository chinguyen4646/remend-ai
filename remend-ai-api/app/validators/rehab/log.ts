import vine from '@vinejs/vine'

export const createRehabLogValidator = vine.compile(
  vine.object({
    programId: vine.number(),
    date: vine.string().optional(), // ISO date string, transformed in controller
    pain: vine.number().min(0).max(10),
    stiffness: vine.number().min(0).max(10),
    swelling: vine.number().min(0).max(10).optional(),
    activityLevel: vine.enum(['rest', 'light', 'moderate', 'heavy']).optional(),
    notes: vine.string().optional(),
  })
)

export const getRehabLogsValidator = vine.compile(
  vine.object({
    programId: vine.string().optional(), // Can be 'active' or a number
    range: vine.enum(['last_7', 'last_14', 'last_30']).optional(),
  })
)
