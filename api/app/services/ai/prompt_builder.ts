import type RehabLog from "#models/rehab_log";

/**
 * Build system prompt for early snapshot (1-2 logs)
 * No trend analysis, just conservative observations and 1-2 actions
 */
export function buildEarlySnapshotPrompt(logs: RehabLog[]): string {
  const logData = logs
    .map(
      (log) => `
<log>
  <date>${log.date.toISODate()}</date>
  <pain>${log.pain}</pain>
  <stiffness>${log.stiffness}</stiffness>
  <swelling>${log.swelling || "not recorded"}</swelling>
  <activity>${log.activityLevel || "not recorded"}</activity>
  <notes>${log.notes || "none"}</notes>
</log>`,
    )
    .join("\n");

  return `You are a physical therapy assistant providing early feedback to a user tracking their rehab progress.

IMPORTANT RULES:
- This is an EARLY SNAPSHOT (only ${logs.length} log${logs.length > 1 ? "s" : ""} available)
- DO NOT attempt trend analysis with limited data
- Provide 1-2 conservative, actionable suggestions
- NO medical diagnoses or specific treatments
- NO caution warnings (not enough data)
- Output ONLY valid JSON matching this exact schema:

{
  "summary": "Brief 1-2 sentence observation about current state (no trend claims)",
  "actions": ["action 1", "action 2"],
  "caution": ""
}

User's rehab logs (most recent first):
${logData}

Provide encouraging, safe, actionable feedback in JSON format:`;
}

/**
 * Build system prompt for full feedback (3+ logs)
 * Includes trend analysis, 3 specific actions, optional caution if worsening
 */
export function buildFullFeedbackPrompt(logs: RehabLog[]): string {
  const logData = logs
    .map(
      (log) => `
<log>
  <date>${log.date.toISODate()}</date>
  <pain>${log.pain}</pain>
  <stiffness>${log.stiffness}</stiffness>
  <swelling>${log.swelling || "not recorded"}</swelling>
  <activity>${log.activityLevel || "not recorded"}</activity>
  <notes>${log.notes || "none"}</notes>
</log>`,
    )
    .join("\n");

  const oldest = logs[logs.length - 1];
  const newest = logs[0];
  const painTrend = newest.pain - oldest.pain;
  const trendContext =
    painTrend > 1 ? "pain is increasing" : painTrend < -1 ? "pain is decreasing" : "stable";

  return `You are a physical therapy assistant analyzing ${logs.length} days of rehab progress.

IMPORTANT RULES:
- Analyze the TREND over time (${trendContext})
- Provide EXACTLY 3 specific, actionable recommendations
- Include a "caution" note ONLY if pain/symptoms are clearly worsening (increase >2 points)
- NO medical diagnoses or prescriptions
- Focus on practical next steps user can take
- Output ONLY valid JSON matching this exact schema:

{
  "summary": "2-3 sentence trend analysis with specific observations",
  "actions": ["specific action 1", "specific action 2", "specific action 3"],
  "caution": "warning message if worsening, empty string otherwise"
}

User's rehab logs (most recent first):
${logData}

Analyze the trend and provide actionable feedback in JSON format:`;
}
