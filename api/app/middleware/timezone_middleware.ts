import type { HttpContext } from "@adonisjs/core/http";
import type { NextFn } from "@adonisjs/core/types/http";
import logger from "@adonisjs/core/services/logger";
import { resolveTimezone } from "#utils/timezone";

/**
 * Timezone middleware resolves the request timezone from:
 * 1. X-Timezone header
 * 2. Authenticated user's tz field
 * 3. Default to 'UTC'
 *
 * Sets ctx.request.requestTz for use in controllers
 * Auto-updates user.tz if header differs from stored value
 *
 * NOTE: This middleware should be used AFTER auth middleware on protected routes
 * It expects auth.user to already be populated by the auth middleware
 */
export default class TimezoneMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, auth } = ctx;

    // Priority: X-Timezone header > user.tz > 'UTC'
    const headerTz = request.header("X-Timezone");
    const userTz = auth.user?.tz;

    (request as any).requestTz = resolveTimezone(headerTz, userTz || "UTC");

    // Auto-update user's timezone if:
    // 1. User is authenticated (auth.user exists)
    // 2. Header timezone is present
    // 3. Header timezone differs from stored value
    if (auth.user && headerTz && headerTz !== auth.user.tz) {
      logger.info(
        { userId: auth.user.id, oldTz: auth.user.tz, newTz: headerTz },
        "Updating user timezone",
      );
      auth.user.tz = headerTz;
      await auth.user.save();
    }

    await next();
  }
}
