import { Controller, Post, Body } from '@nestjs/common';
import { InternalHoldService } from './internal-hold.service';
import { LedgerService } from '@ogp/wallet';

@Controller('internal/wallet')
export class InternalHoldController {
  constructor(
    private readonly internalHoldService: InternalHoldService,
    private readonly ledgerService: LedgerService,
  ) {}

  @Post('hold')
  async hold(@Body() body: { walletId: string; amount: number; referenceId: string; reason: string }) {
    return this.internalHoldService.createHold(body.walletId, body.amount, body.referenceId, body.reason);
  }

  @Post('settle')
  async settle(@Body() body: { holdId: string; outcome: 'WIN' | 'LOSS' | 'CANCEL'; payoutAmount: number }) {
    return this.internalHoldService.settleHold(body.holdId, body.outcome, body.payoutAmount);
  }

  @Post('credit')
  async credit(@Body() body: { walletId: string; amount: number; referenceId: string; reason?: string }) {
    await this.ledgerService.credit(body.walletId, body.amount, body.referenceId, 'direct', body.reason);
    return { success: true };
  }
}
