import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import logger from '@adonisjs/core/services/logger'

/**
 * HTTP Logger Middleware
 * Logs all incoming requests with method, path, status, duration, and user info
 * Uses hybrid logging: single line for success, detailed for errors/slow requests
 */
export default class HttpLoggerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response } = ctx
    const startTime = performance.now()
    let error: Error | null = null

    try {
      // Continue to next middleware/controller
      await next()
    } catch (err) {
      // Capture error but re-throw it for the error handler
      error = err as Error
      throw err
    } finally {
      // Calculate duration
      const duration = (performance.now() - startTime).toFixed(2)
      const status = response.getStatus()

      // Get user ID if authenticated (auth may not be initialized at this point)
      const userId = ctx.auth?.user?.id

      // Check if request is slow (over 1 second)
      const isSlow = Number.parseFloat(duration) > 1000

      // Single line message
      const logMessage = `[${request.method()}] ${request.url(true)} → ${status} (${duration}ms)${
        userId ? ` | user:${userId}` : ''
      }${error ? ` | ${error.message}` : ''}`

      // Detailed context (for errors and slow requests)
      const logContext = {
        method: request.method(),
        url: request.url(true),
        status,
        duration: `${duration}ms`,
        ...(userId && { userId }),
        ...(error && { error: error.message, stack: error.stack }),
      }

      // Hybrid logging strategy
      if (status >= 500) {
        // Server errors - always show details
        logger.error(logContext, logMessage)
      } else if (status >= 400) {
        // Client errors - show details to understand what went wrong
        logger.warn(logContext, logMessage)
      } else if (isSlow) {
        // Slow requests - show details to investigate performance
        logger.warn(logContext, `⚠️ SLOW: ${logMessage}`)
      } else {
        // Success - clean single line
        logger.info(logMessage)
      }
    }
  }
}
