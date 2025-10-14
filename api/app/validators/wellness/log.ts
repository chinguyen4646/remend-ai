import vine from "@vinejs/vine";

export const createWellnessLogValidator = vine.compile(
  vine.object({
    mode: vine.enum(["maintenance", "general"]),
    date: vine.string().optional(), // ISO date string, transformed in controller
    pain: vine.number().min(0).max(10).optional(),
    stiffness: vine.number().min(0).max(10).optional(),
    tension: vine.number().min(0).max(10).optional(),
    energy: vine.number().min(0).max(10).optional(),
    areaTag: vine.string().optional(),
    notes: vine.string().optional(),
  }),
);

export const getWellnessLogsValidator = vine.compile(
  vine.object({
    mode: vine.enum(["maintenance", "general"]),
    range: vine.enum(["last_7", "last_30"]).optional(),
  }),
);
