import env from "#start/env";

const featuresConfig = {
  /**
   * Feature flag to enable/disable maintenance mode
   * Set via ENABLE_MAINTENANCE_MODE environment variable
   * When false, users cannot switch to or access maintenance mode
   */
  maintenanceModeEnabled: env.get("ENABLE_MAINTENANCE_MODE", false),

  /**
   * Feature flag to enable/disable general mode
   * Set via ENABLE_GENERAL_MODE environment variable
   * When false, users cannot switch to or access general mode
   */
  generalModeEnabled: env.get("ENABLE_GENERAL_MODE", false),
};

export default featuresConfig;
