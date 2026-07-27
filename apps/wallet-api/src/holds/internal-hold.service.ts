import { Injectable } from '@nestjs/common';
import { HoldService } from '@ogp/wallet';
import { LedgerService } from '@ogp/wallet';
import { LedgerEntryType } from '@ogp/wallet';

@Injectable()
export class InternalHoldService {
  constructor(
    private readonly holdService: HoldService,
    private readonly ledgerService: LedgerService,
  ) {}

  async createHold(walletId: string, amount: number, referenceId: string, reason: string) {
    const hold = await this.holdService.create(walletId, amount, referenceId, reason);
    await this.ledgerService.debit(walletId, amount, referenceId, 'hold', LedgerEntryType.BET_HOLD, reason);
    return { holdId: hold.id, status: hold.status };
  }

  async settleHold(holdId: string, outcome: 'WIN' | 'LOSS' | 'CANCEL', payoutAmount: number) {
    const hold = await this.holdService.settle(holdId, outcome);

    if (outcome === 'WIN' && payoutAmount > 0) {
      await this.ledgerService.credit(hold.walletId, payoutAmount, `${holdId}-payout`, 'payout', 'Bet win');
    }

    return { holdId: hold.id, status: hold.status };
  }
}
