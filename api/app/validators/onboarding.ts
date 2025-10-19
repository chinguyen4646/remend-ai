import vine from "@vinejs/vine";

export const submitOnboardingValidator = vine.compile(
  vine.object({
    // Baseline fields
    area: vine.enum(["knee", "shoulder", "back", "hip", "ankle", "wrist", "elbow", "other"]),
    areaOtherLabel: vine.string().optional(),
    onset: vine.enum(["recent", "ongoing", "chronic"]),
    painRest: vine.number().min(0).max(10),
    painActivity: vine.number().min(0).max(10),
    stiffness: vine.number().min(0).max(10),
    timing: vine.array(vine.enum(["before", "during", "after"])).minLength(0),
    aggravators: vine.array(vine.string()).minLength(0),
    easers: vine.array(vine.string()).minLength(0),
    activityLevel: vine.enum(["low", "moderate", "high"]),

    // Goal
    goal: vine.enum(["return_to_sport", "walk_pain_free", "reduce_stiffness", "maintain_mobility"]),

    // Safety (red flags)
    redFlags: vine
      .array(vine.enum(["night_pain", "numbness", "trauma", "fever", "locking"]))
      .minLength(0),

    // Mode selection (sent after user confirms/overrides)
    modeSelected: vine.enum(["rehab", "maintenance"]),
  }),
);
