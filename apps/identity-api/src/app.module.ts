import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { RedisModule } from '@ogp/shared';
import { AllExceptionsFilter } from '@ogp/shared';
import { JwtAuthModule, JwtAuthGuard, JwtStrategy, PasswordService, RefreshTokenService } from '@ogp/auth';

import { buildTypeOrmOptions, loadConfig } from '@ogp/shared';
import { IdentityEnvSchema } from './config';
import { User, Session, Role, UserRole } from './users/entities';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './sessions/sessions.module';
import Redis from 'ioredis';

const rawEnv = loadConfig(IdentityEnvSchema);
const env = rawEnv as typeof rawEnv & Record<string, unknown>;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: () => env }),
    TypeOrmModule.forRoot(
      buildTypeOrmOptions(env as any, {
        entities: [User, Session, Role, UserRole],
        schema: 'identity',
      }),
    ),
    RedisModule.forRoot(env as any),
    JwtAuthModule.forRoot({
      secret: env.JWT_SECRET,
      accessTtl: '15m',
      refreshTtlDays: 7,
    }),
    UsersModule,
    AuthModule,
    SessionsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    JwtStrategy,
    PasswordService,
    {
      provide: RefreshTokenService,
      useFactory: (redis: Redis) => new RefreshTokenService(redis, 7 * 24 * 60 * 60 * 1000),
      inject: ['REDIS_CLIENT'],
    },
  ],
})
export class AppModule {}
