/**
 * Feature flags for controlling app functionality
 */
export const features = {
  /**
   * Enable/disable maintenance mode in the app
   * When false, maintenance mode is hidden from UI and mode switching is blocked
   */
  maintenanceModeEnabled: false,

  /**
   * Enable/disable general mode in the app
   * When false, general mode is hidden from UI and users are prompted to choose rehab only
   */
  generalModeEnabled: false,
} as const;
