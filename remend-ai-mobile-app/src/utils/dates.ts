/**
 * Get today's date in device timezone as YYYY-MM-DD
 */
export const todayLocal = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Format YYYY-MM-DD calendar date for display
 *
 * @param isoDate - Date string in YYYY-MM-DD format
 * @returns Localized date string (e.g., "Oct 12, 2025" or "12/10/2025")
 */
export const formatCalendarDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
