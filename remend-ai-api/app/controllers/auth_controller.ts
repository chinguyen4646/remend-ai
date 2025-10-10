import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

export default class AuthController {
  /**
   * Register a new user
   */
  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator)

    // Check if user already exists
    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      logger.warn({ email: data.email }, 'Registration attempt with existing email')
      return response.conflict({
        errors: [{ message: 'Email already registered' }],
      })
    }

    // Create user
    const user = await User.create(data)

    // Generate access token
    const token = await User.accessTokens.create(user)

    logger.info({ userId: user.id, email: user.email }, 'New user registered successfully')

    return response.created({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      token: {
        type: 'bearer',
        value: token.value!.release(),
      },
    })
  }

  /**
   * Login user
   */
  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      // Verify credentials
      const user = await User.verifyCredentials(email, password)

      // Generate access token
      const token = await User.accessTokens.create(user)

      logger.info({ userId: user.id, email: user.email }, 'User logged in successfully')

      return response.ok({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
        token: {
          type: 'bearer',
          value: token.value!.release(),
        },
      })
    } catch (error) {
      logger.error({ email }, 'Login failed: Invalid credentials')
      throw error
    }
  }

  /**
   * Get authenticated user
   */
  async me({ auth, response }: HttpContext) {
    const user = auth.user!

    return response.ok({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    })
  }

  /**
   * Logout user
   */
  async logout({ auth, response }: HttpContext) {
    const user = auth.user!
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return response.ok({
      message: 'Logged out successfully',
    })
  }
}
