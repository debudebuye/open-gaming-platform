import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { RedisModule, AllExceptionsFilter, buildTypeOrmOptions, loadConfig } from '@ogp/shared';
import { Market, Selection, BetSlip, BetLine } from '@ogp/betting';
import { KenoGame, KenoTicket } from '@ogp/keno';
import { GamingEnvSchema } from './config';
import { BettingModule } from './betting/betting.module';
import { KenoModule } from './keno/keno.module';
import { CasinoModule } from './casino/casino.module';

const rawEnv = loadConfig(GamingEnvSchema);
const env = rawEnv as typeof rawEnv & Record<string, unknown>;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: () => env }),
    TypeOrmModule.forRoot(
      buildTypeOrmOptions(env as any, {
        entities: [Market, Selection, BetSlip, BetLine, KenoGame, KenoTicket],
      }),
    ),
    RedisModule.forRoot(env as any),
    BettingModule,
    KenoModule,
    CasinoModule.forPlugins([]),
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
