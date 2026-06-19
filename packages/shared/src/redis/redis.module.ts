import { DynamicModule, Global, Module } from '@nestjs/common';
import { createRedisClient, REDIS_CLIENT } from './redis.factory';
import { CacheService } from './cache.service';
import { LockService } from './lock.service';
import { BaseEnv } from '../config';

/**
 * Global Redis module — import once in AppModule, available everywhere.
 *
 * Usage:
 *   RedisModule.forRoot(config)
 */
@Global()
@Module({})
export class RedisModule {
  static forRoot(
    env: Pick<BaseEnv, 'REDIS_HOST' | 'REDIS_PORT' | 'REDIS_PASSWORD' | 'REDIS_DB'>,
  ): DynamicModule {
    const redisProvider = {
      provide: REDIS_CLIENT,
      useFactory: () => createRedisClient(env),
    };

    return {
      module: RedisModule,
      providers: [redisProvider, CacheService, LockService],
      exports: [REDIS_CLIENT, CacheService, LockService],
    };
  }
}
