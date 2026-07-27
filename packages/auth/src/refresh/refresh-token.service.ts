import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { ErrorCode } from '@ogp/shared';

@Injectable()
export class RefreshTokenService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly ttlMs: number,
  ) {}

  private key(userId: string, tokenId: string): string {
    return `session:${userId}:${tokenId}`;
  }

  async create(userId: string, tokenId: string, deviceInfo?: string): Promise<void> {
    const ttlSec = Math.ceil(this.ttlMs / 1000);
    const data = JSON.stringify({ userId, tokenId, deviceInfo: deviceInfo ?? null, createdAt: Date.now() });
    await this.redis.set(this.key(userId, tokenId), data, 'EX', ttlSec);
  }

  async validate(userId: string, tokenId: string): Promise<boolean> {
    const exists = await this.redis.exists(this.key(userId, tokenId));
    return exists === 1;
  }

  async rotate(userId: string, oldTokenId: string, newTokenId: string, deviceInfo?: string): Promise<void> {
    await this.redis.del(this.key(userId, oldTokenId));
    await this.create(userId, newTokenId, deviceInfo);
  }

  async revoke(userId: string, tokenId: string): Promise<void> {
    await this.redis.del(this.key(userId, tokenId));
  }

  async revokeAllForUser(userId: string): Promise<void> {
    const pattern = `session:${userId}:*`;
    const keys = await this.scanKeys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  private async scanKeys(pattern: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';
    do {
      const [nextCursor, batch] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      keys.push(...batch);
    } while (cursor !== '0');
    return keys;
  }
}
