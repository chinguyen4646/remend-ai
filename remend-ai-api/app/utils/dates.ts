import { DateTime } from "luxon";

/**
 * Returns ISO date string (YYYY-MM-DD) for today in the given timezone
 *
 * @param tz - IANA timezone string (e.g., 'America/New_York')
 * @returns ISO date string in YYYY-MM-DD format
 *
 * @example
 * todayInTimezone('America/New_York')
 * // Returns: '2025-01-15'
 */
export const todayInTimezone = (tz: string): string => {
  return DateTime.now().setZone(tz).toISODate()!;
};

/**
 * Converts a date-only string (YYYY-MM-DD) in the given timezone
 * to UTC start-of-day DateTime
 *
 * @param isoDate - Date string in ISO format (YYYY-MM-DD)
 * @param tz - IANA timezone string (e.g., 'America/New_York', 'Europe/London')
 * @returns Luxon DateTime at UTC start of the local day
 *
 * @example
 * toUtcStartOfLocalDay('2025-01-15', 'America/New_York')
 * // Returns: 2025-01-15T05:00:00.000Z (start of Jan 15 in NYC = 5am UTC)
 */
export const toUtcStartOfLocalDay = (isoDate: string, tz: string): DateTime => {
  return DateTime.fromISO(isoDate, { zone: tz }).startOf("day").toUTC();
};

/**
 * Returns UTC DateTime for the start of today in the given timezone
 *
 * @param tz - IANA timezone string
 * @returns Luxon DateTime at UTC start of today in the local timezone
 *
 * @example
 * // If it's Jan 15 2025 10:30 PM in NYC (UTC 3:30 AM Jan 16)
 * todayUtcFromLocal('America/New_York')
 * // Returns: 2025-01-15T05:00:00.000Z (start of Jan 15 in NYC)
 */
export const todayUtcFromLocal = (tz: string): DateTime => {
  return DateTime.now().setZone(tz).startOf("day").toUTC();
};

/**
 * Returns date range for the last N days in the given timezone as ISO strings
 * Inclusive of today and the last N-1 days
 *
 * @param n - Number of days to include (e.g., 7 for last week)
 * @param tz - IANA timezone string
 * @returns Object with start and end date strings in YYYY-MM-DD format
 *
 * @example
 * // If today is Jan 15 in NYC
 * rangeLastNDays(7, 'America/New_York')
 * // Returns:
 * // { start: '2025-01-09', end: '2025-01-15' }
 */
export const rangeLastNDays = (n: number, tz: string): { start: string; end: string } => {
  const now = DateTime.now().setZone(tz);
  const end = now.toISODate()!;
  const start = now.minus({ days: n - 1 }).toISODate()!;
  return { start, end };
};

/**
 * @deprecated Use rangeLastNDays instead - returns strings for calendar dates
 */
export const rangeLastNDaysUtc = (n: number, tz: string): { start: DateTime; end: DateTime } => {
  const end = todayUtcFromLocal(tz);
  const start = end.minus({ days: n - 1 }).startOf("day");
  return { start, end };
};

/**
 * Validates that a string is a valid ISO date (YYYY-MM-DD)
 *
 * @param dateStr - String to validate
 * @returns true if valid ISO date, false otherwise
 */
export const isValidIsoDate = (dateStr: string): boolean => {
  const dt = DateTime.fromISO(dateStr);
  return dt.isValid && /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
};
