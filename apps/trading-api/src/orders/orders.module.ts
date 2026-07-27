import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, Trade, Instrument, Position, OrderBookService, RiskService, PositionService } from '@ogp/trading';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Trade, Instrument, Position])],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    {
      provide: OrderBookService,
      useFactory: (redis: import('ioredis').default) => new OrderBookService(redis),
      inject: ['REDIS_CLIENT'],
    },
    {
      provide: RiskService,
      useFactory: (redis: import('ioredis').default) => new RiskService(redis),
      inject: ['REDIS_CLIENT'],
    },
    PositionService,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
