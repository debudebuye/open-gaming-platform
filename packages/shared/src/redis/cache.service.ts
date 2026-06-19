import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.factory';

/**
 * Generic cache helper backed by Redis.
 *
 * All keys are namespaced:  cache:{namespace}:{key}
 *
 * Usage:
 *   const user = await this.cache.getOrSet('user', userId, 300, () =>
 *     this.usersRepo.findOneOrFail(userId)
 *   );
 */
@Injectable()
export class CacheService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /**
   * Returns cached value if present, otherwise calls `factory`,
   * stores the result, and returns it.
   */
  async getOrSet<T>(
    namespace: string,
    key: string,
    ttlSeconds: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    const cacheKey = this.buildKey(namespace, key);
    const cached = await this.redis.get(cacheKey);

    if (cached !== null) {
      return JSON.parse(cached) as T;
    }

    const fresh = await factory();
    await this.redis.setex(cacheKey, ttlSeconds, JSON.stringify(fresh));
    return fresh;
  }

  /** Fetch raw cached value — returns null on miss */
  async get<T>(namespace: string, key: string): Promise<T | null> {
    const raw = await this.redis.get(this.buildKey(namespace, key));
    return raw !== null ? (JSON.parse(raw) as T) : null;
  }

  /** Store a value with a TTL */
  async set(namespace: string, key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.redis.setex(this.buildKey(namespace, key), ttlSeconds, JSON.stringify(value));
  }

  /** Invalidate a single key */
  async del(namespace: string, key: string): Promise<void> {
    await this.redis.del(this.buildKey(namespace, key));
  }

  /** Invalidate all keys in a namespace (use sparingly — SCAN based) */
  async delNamespace(namespace: string): Promise<void> {
    const pattern = `cache:${namespace}:*`;
    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) await this.redis.del(...keys);
    } while (cursor !== '0');
  }

  private buildKey(namespace: string, key: string): string {
    return `cache:${namespace}:${key}`;
  }
}
