/**
 * Feature flags for controlling app functionality
 */
export const features = {
  /**
   * Enable/disable general mode in the app
   * When false, general mode is hidden from UI and users are prompted to choose rehab/maintenance
   */
  generalModeEnabled: false,
} as const;
