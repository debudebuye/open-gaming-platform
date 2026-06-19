import Redis, { RedisOptions } from 'ioredis';
import { BaseEnv } from '../config';

/**
 * Creates an ioredis client from validated env config.
 * lazyConnect: true — the connection is established on first command,
 * not at construction time, which plays well with NestJS lifecycle.
 */
export function createRedisClient(
  env: Pick<BaseEnv, 'REDIS_HOST' | 'REDIS_PORT' | 'REDIS_PASSWORD' | 'REDIS_DB'>,
  overrides: Partial<RedisOptions> = {},
): Redis {
  return new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
    lazyConnect: true,
    // Retry up to 3 times with 200ms delay — fail fast in test
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => (times >= 3 ? null : Math.min(times * 200, 2000)),
    ...overrides,
  });
}

/** Token used to inject the Redis client in NestJS DI */
export const REDIS_CLIENT = Symbol('REDIS_CLIENT');
