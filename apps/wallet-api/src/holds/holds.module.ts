import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet, LedgerEntry, Hold } from '@ogp/wallet';
import { LedgerService, HoldService } from '@ogp/wallet';
import { InternalHoldService } from './internal-hold.service';
import { InternalHoldController } from './internal-hold.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, LedgerEntry, Hold])],
  controllers: [InternalHoldController],
  providers: [LedgerService, HoldService, InternalHoldService],
  exports: [InternalHoldService],
})
export class HoldsModule {}
