/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also casts values
| to JavaScript data types.
|
*/

import { Env } from "@adonisjs/core/env";

export default await Env.create(new URL("../", import.meta.url), {
  /*
  |--------------------------------------------------------------------------
  | Core app config
  |--------------------------------------------------------------------------
  */
  NODE_ENV: Env.schema.enum(["development", "production", "test"] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: "host" }),
  LOG_LEVEL: Env.schema.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),

  /*
  |--------------------------------------------------------------------------
  | Database config
  |--------------------------------------------------------------------------
  */
  DB_HOST: Env.schema.string({ format: "host" }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  /*
  |--------------------------------------------------------------------------
  | AI config
  |--------------------------------------------------------------------------
  |
  | These variables control the optional AI feedback feature.
  | If AI_ENABLED is false or missing, related functionality
  | will remain disabled.
  |
  */
  AI_ENABLED: Env.schema.boolean.optional(),
  OPENAI_API_KEY: Env.schema.string.optional(),
});
