import { z } from 'zod';

/**
 * Root environment schema shared by all apps.
 * Each app extends this with domain-specific variables using:
 *
 *   export const MyEnvSchema = BaseEnvSchema.extend({ ... });
 *
 * Variables validated at startup via loadConfig(). Any missing or
 * invalid variable throws with a clear message listing every problem.
 */
export const BaseEnvSchema = z.object({
  // ── Runtime ──────────────────────────────────────────────────────────────
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  // ── HTTP ─────────────────────────────────────────────────────────────────
  PORT: z.coerce.number().int().positive().default(3000),

  // ── PostgreSQL ───────────────────────────────────────────────────────────
  DB_HOST:     z.string().min(1),
  DB_PORT:     z.coerce.number().int().positive().default(5432),
  DB_NAME:     z.string().min(1),
  DB_USER:     z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_SCHEMA:   z.string().min(1),

  // DB_SYNC=true auto-creates tables (development only — never production)
  DB_SYNC:    z.coerce.boolean().default(false),
  // DB_LOGGING=true prints SQL queries to console
  DB_LOGGING: z.coerce.boolean().default(false),

  // ── Redis ─────────────────────────────────────────────────────────────────
  // Individual fields — used by RedisModule.forRoot()
  REDIS_HOST:     z.string().min(1).default('localhost'),
  REDIS_PORT:     z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB:       z.coerce.number().int().min(0).default(0),
});

export type BaseEnv = z.infer<typeof BaseEnvSchema>;
