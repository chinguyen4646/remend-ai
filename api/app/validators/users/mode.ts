import vine from "@vinejs/vine";

export const updateModeValidator = vine.compile(
  vine.object({
    mode: vine.enum(["rehab", "maintenance", "general"]),
    injuryType: vine.string().optional(),
  }),
);
