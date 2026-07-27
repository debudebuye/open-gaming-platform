import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Market, Selection, BetSlip, BetLine } from '@ogp/betting';
import { BettingService } from './betting.service';
import { BettingController } from './betting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Market, Selection, BetSlip, BetLine])],
  controllers: [BettingController],
  providers: [BettingService],
  exports: [BettingService],
})
export class BettingModule {}
