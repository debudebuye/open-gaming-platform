import { Injectable } from '@nestjs/common';
import { LedgerService } from '../ledger/ledger.service';
import { HoldService } from '../holds/hold.service';

@Injectable()
export class BalanceCalculator {
  constructor(
    private readonly ledgerService: LedgerService,
    private readonly holdService: HoldService,
  ) {}

  async getAvailableBalance(walletId: string): Promise<number> {
    const totalBalance = await this.ledgerService.getBalance(walletId);
    const activeHolds = await this.holdService.getActiveHoldsTotal(walletId);
    return totalBalance - activeHolds;
  }

  async getTotalBalance(walletId: string): Promise<number> {
    return this.ledgerService.getBalance(walletId);
  }

  async getHeldAmount(walletId: string): Promise<number> {
    return this.holdService.getActiveHoldsTotal(walletId);
  }
}
