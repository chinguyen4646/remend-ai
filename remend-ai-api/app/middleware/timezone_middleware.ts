import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Timezone middleware resolves the request timezone from:
 * 1. X-Timezone header
 * 2. Authenticated user's tz field
 * 3. Default to 'UTC'
 *
 * Sets ctx.request.requestTz for use in controllers
 */
export default class TimezoneMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, auth } = ctx

    // Extend Request type to include requestTz
    // Priority: X-Timezone header > user.tz > 'UTC'
    const headerTz = request.header('X-Timezone')
    const userTz = auth.user?.tz

    ;(request as any).requestTz = headerTz || userTz || 'UTC'

    await next()
  }
}
