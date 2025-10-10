import vine from "@vinejs/vine";

const rehabAreas = [
  "knee",
  "ankle",
  "foot",
  "achilles",
  "calf",
  "hamstring",
  "quadriceps",
  "hip",
  "groin",
  "glute",
  "lower_back",
  "mid_back",
  "upper_back",
  "neck",
  "shoulder",
  "elbow",
  "wrist",
  "hand",
  "other",
] as const;

export const createProgramValidator = vine.compile(
  vine.object({
    area: vine.enum(rehabAreas),
    areaOtherLabel: vine.string().optional(),
    side: vine.enum(["left", "right", "both", "na"]),
    startDate: vine.string().optional(), // ISO date string, transformed in controller
    status: vine.enum(["active", "completed", "paused"]).optional(),
  }),
);

export const updateProgramStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(["active", "completed", "paused"]),
  }),
);
