import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { RedisModule, AllExceptionsFilter, buildTypeOrmOptions, loadConfig } from '@ogp/shared';
import { Order, Trade, Instrument, Position } from '@ogp/trading';
import { TradingEnvSchema } from './config';
import { OrdersModule } from './orders/orders.module';

const env = loadConfig(TradingEnvSchema);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: () => env }),
    TypeOrmModule.forRoot(
      buildTypeOrmOptions(env, {
        entities: [Order, Trade, Instrument, Position],
        schema: 'trading',
      }),
    ),
    RedisModule.forRoot(env),
    OrdersModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
