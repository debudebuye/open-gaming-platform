import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { RedisModule, AllExceptionsFilter, loadConfig } from '@ogp/shared';
import { AdminEnvSchema } from './config';
import { AdminModule } from './admin/admin.module';

const rawEnv = loadConfig(AdminEnvSchema);
const env = rawEnv as typeof rawEnv & Record<string, unknown>;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: () => env }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      username: env.DB_USER,
      password: env.DB_PASSWORD,
      schema: 'admin',
      synchronize: false,
    }),
    RedisModule.forRoot(env as any),
    AdminModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
