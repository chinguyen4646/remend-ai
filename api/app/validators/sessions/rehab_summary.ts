import vine from "@vinejs/vine";

/**
 * Validator for POST /api/sessions/rehab-summary
 */
export const rehabSummaryValidator = vine.compile(
  vine.object({
    /**
     * Program ID to get feedback for
     * Must be a valid program ID that belongs to the authenticated user
     */
    programId: vine.number().positive(),

    /**
     * Date range for logs (defaults to last_14)
     * Currently only supports last_14 but keeping flexible for future
     */
    range: vine.string().trim().in(["last_14"]).optional(),
  }),
);
