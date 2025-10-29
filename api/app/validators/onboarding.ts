import vine from "@vinejs/vine";

// Onboarding V2 Validator
export const submitOnboardingValidator = vine.compile(
  vine.object({
    // Screen 1: Area
    area: vine.enum([
      "knee",
      "shoulder",
      "lower_back",
      "upper_back",
      "hip",
      "ankle",
      "wrist",
      "elbow",
      "other",
    ]),
    areaOtherLabel: vine.string().trim().maxLength(50).optional(),

    // Screen 2: Description
    userDescription: vine.string().trim().minLength(10).maxLength(2000),
    redFlags: vine
      .array(vine.enum(["night_pain", "numbness", "trauma", "fever", "locking"]))
      .minLength(0),

    // Screen 3: Duration & Intensity
    onset: vine.enum(["recent", "1-3months", "3plus", "incident"]),
    painRest: vine.number().min(0).max(10),
    painActivity: vine.number().min(0).max(10),
    stiffness: vine.number().min(0).max(10),

    // Screen 4: Aggravators & Easers
    aggravators: vine.array(vine.string().trim().maxLength(100)).minLength(0),
    easers: vine.array(vine.string().trim().maxLength(100)).minLength(0),

    // Mode selection (hardcoded to rehab in controller, but validate anyway)
    modeSelected: vine.enum(["rehab", "maintenance"]),
  }),
);
