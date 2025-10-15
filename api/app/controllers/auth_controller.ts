import User from "#models/user";
import { loginValidator, registerValidator } from "#validators/auth";
import type { HttpContext } from "@adonisjs/core/http";
import logger from "@adonisjs/core/services/logger";
import { resolveTimezone } from "#utils/timezone";

export default class AuthController {
  /**
   * Register a new user
   */
  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator);

    // Check if user already exists
    const existingUser = await User.findBy("email", data.email);
    if (existingUser) {
      logger.warn({ email: data.email }, "Registration attempt with existing email");
      return response.conflict({
        errors: [{ message: "Email already registered" }],
      });
    }

    // Resolve timezone from X-Timezone header
    const headerTz = request.header("X-Timezone");
    const tz = resolveTimezone(headerTz);

    // Create user with timezone
    const user = await User.create({ ...data, tz });

    // Generate access token
    const token = await User.accessTokens.create(user);

    logger.info(
      { userId: user.id, email: user.email, tz: user.tz },
      "New user registered successfully",
    );

    return response.created({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        mode: user.mode,
        injuryType: user.injuryType,
        modeStartedAt: user.modeStartedAt,
      },
      token: {
        type: "bearer",
        value: token.value!.release(),
      },
    });
  }

  /**
   * Login user
   */
  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator);

    try {
      // Verify credentials
      const user = await User.verifyCredentials(email, password);

      // Update timezone from X-Timezone header if provided
      const headerTz = request.header("X-Timezone");
      if (headerTz && headerTz !== user.tz) {
        const tz = resolveTimezone(headerTz);
        logger.info(
          { userId: user.id, oldTz: user.tz, newTz: tz },
          "Updating user timezone on login",
        );
        user.tz = tz;
        await user.save();
      }

      // Generate access token
      const token = await User.accessTokens.create(user);

      logger.info({ userId: user.id, email: user.email }, "User logged in successfully");

      return response.ok({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          mode: user.mode,
          injuryType: user.injuryType,
          modeStartedAt: user.modeStartedAt,
        },
        token: {
          type: "bearer",
          value: token.value!.release(),
        },
      });
    } catch (error) {
      logger.error({ email }, "Login failed: Invalid credentials");
      throw error;
    }
  }

  /**
   * Get authenticated user
   */
  async me({ auth, response }: HttpContext) {
    const user = auth.user!;

    return response.ok({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        mode: user.mode,
        injuryType: user.injuryType,
        modeStartedAt: user.modeStartedAt,
      },
    });
  }

  /**
   * Logout user
   */
  async logout({ auth, response }: HttpContext) {
    const user = auth.user!;
    await User.accessTokens.delete(user, user.currentAccessToken.identifier);

    return response.ok({
      message: "Logged out successfully",
    });
  }
}
