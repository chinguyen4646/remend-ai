/**
 * Resolves timezone from X-Timezone header with fallback to default
 *
 * @param headerTz - Timezone from X-Timezone header (optional)
 * @param fallback - Default timezone if header is not provided (default: "UTC")
 * @returns Resolved timezone string
 */
export function resolveTimezone(headerTz: string | undefined, fallback = "UTC"): string {
  return headerTz || fallback;
}
