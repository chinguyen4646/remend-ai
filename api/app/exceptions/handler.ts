import app from "@adonisjs/core/services/app";
import { HttpContext, ExceptionHandler } from "@adonisjs/core/http";
import logger from "@adonisjs/core/services/logger";

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction;

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    return super.handle(error, ctx);
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    // Log server errors (5xx) with stack traces
    if (error instanceof Error) {
      const statusCode = "status" in error ? (error as any).status : 500;

      if (statusCode >= 500) {
        logger.error(
          {
            method: ctx.request.method(),
            url: ctx.request.url(true),
            statusCode,
            errorMessage: error.message,
            stack: error.stack,
          },
          `Server error: ${error.message}`,
        );
      }
    }

    return super.report(error, ctx);
  }
}
