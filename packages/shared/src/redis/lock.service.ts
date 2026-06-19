import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { randomBytes } from 'crypto';
import { REDIS_CLIENT } from './redis.factory';

/**
 * Distributed lock service using Redis SET NX PX (single-instance Redlock).
 *
 * Suitable for V1 (single Redis node). For V2 multi-node Redis, swap
 * this implementation for the `redlock` npm package without changing callers.
 *
 * Usage:
 *   await this.lock.withLock(`wallet:${userId}`, 5000, async () => {
 *     // critical section — guaranteed single execution
 *   });
 */
@Injectable()
export class LockService {
  private readonly logger = new Logger(LockService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /**
   * Acquires a lock, runs `fn`, then releases the lock.
   * Throws if the lock cannot be acquired within `timeoutMs`.
   */
  async withLock<T>(
    resource: string,
    ttlMs: number,
    fn: () => Promise<T>,
    timeoutMs = ttlMs,
  ): Promise<T> {
    const lockKey = `lock:${resource}`;
    const token = randomBytes(16).toString('hex');

    const acquired = await this.acquire(lockKey, token, ttlMs, timeoutMs);
    if (!acquired) {
      throw new Error(`Could not acquire lock on '${resource}' within ${timeoutMs}ms`);
    }

    try {
      return await fn();
    } finally {
      await this.release(lockKey, token);
    }
  }

  /** Attempt to acquire the lock, retrying until timeoutMs is exhausted */
  private async acquire(
    key: string,
    token: string,
    ttlMs: number,
    timeoutMs: number,
  ): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    const retryDelayMs = 50;

    while (Date.now() < deadline) {
      const result = await this.redis.set(key, token, 'PX', ttlMs, 'NX');
      if (result === 'OK') return true;
      await this.sleep(retryDelayMs);
    }

    return false;
  }

  /**
   * Release the lock only if we still own it.
   * Uses a Lua script to make the check-and-delete atomic.
   */
  private async release(key: string, token: string): Promise<void> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await this.redis.eval(script, 1, key, token);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
