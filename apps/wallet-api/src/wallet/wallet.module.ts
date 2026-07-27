import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet, Hold } from '@ogp/wallet';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { BalanceCalculator } from '@ogp/wallet';
import { LedgerService } from '@ogp/wallet';
import { LedgerEntry } from '@ogp/wallet';
import { HoldService } from '@ogp/wallet';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, LedgerEntry, Hold])],
  controllers: [WalletController],
  providers: [WalletService, LedgerService, HoldService, BalanceCalculator],
  exports: [WalletService],
})
export class WalletModule {}
