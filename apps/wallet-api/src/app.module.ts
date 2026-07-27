import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { RedisModule } from '@ogp/shared';
import { AllExceptionsFilter, buildTypeOrmOptions, loadConfig } from '@ogp/shared';
import { Wallet, LedgerEntry, Hold } from '@ogp/wallet';
import { WalletEnvSchema } from './config';
import { WalletModule } from './wallet/wallet.module';
import { HoldsModule } from './holds/holds.module';

const rawEnv = loadConfig(WalletEnvSchema);
const env = rawEnv as typeof rawEnv & Record<string, unknown>;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: () => env }),
    TypeOrmModule.forRoot(
      buildTypeOrmOptions(env as any, {
        entities: [Wallet, LedgerEntry, Hold],
      }),
    ),
    RedisModule.forRoot(env as any),
    WalletModule,
    HoldsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
