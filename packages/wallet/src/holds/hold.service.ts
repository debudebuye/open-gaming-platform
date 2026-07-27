import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hold } from '../entities/hold.entity';
import { HoldStatus } from '../enums';
import { LedgerService } from '../ledger/ledger.service';
import { ConflictException_, ErrorCode } from '@ogp/shared';

@Injectable()
export class HoldService {
  constructor(
    @InjectRepository(Hold) private readonly holdRepo: Repository<Hold>,
    private readonly ledgerService: LedgerService,
  ) {}

  async create(walletId: string, amount: number, referenceId: string, reason: string): Promise<Hold> {
    const activeHolds = await this.getActiveHoldsTotal(walletId);
    const balance = await this.ledgerService.getBalance(walletId);
    const available = balance - activeHolds;

    if (available < amount) {
      throw new ConflictException_(ErrorCode.WALLET_INSUFFICIENT_FUNDS, 'Insufficient available balance');
    }

    const hold = this.holdRepo.create({
      walletId,
      amount,
      referenceId,
      reason,
      status: HoldStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h default
    });

    return this.holdRepo.save(hold);
  }

  async settle(holdId: string, outcome: 'WIN' | 'LOSS' | 'CANCEL'): Promise<Hold> {
    const hold = await this.holdRepo.findOne({ where: { id: holdId } });
    if (!hold) {
      throw new ConflictException_(ErrorCode.WALLET_HOLD_NOT_FOUND, 'Hold not found');
    }

    if (hold.status !== HoldStatus.ACTIVE) {
      throw new ConflictException_(ErrorCode.CONFLICT, 'Hold already settled');
    }

    hold.status = outcome === 'CANCEL' ? HoldStatus.RELEASED : HoldStatus.SETTLED;
    return this.holdRepo.save(hold);
  }

  async releaseExpired(): Promise<number> {
    const result = await this.holdRepo
      .createQueryBuilder()
      .update(Hold)
      .set({ status: HoldStatus.EXPIRED })
      .where('status = :status', { status: HoldStatus.ACTIVE })
      .andWhere('expires_at < :now', { now: new Date() })
      .execute();

    return result.affected ?? 0;
  }

  async getActiveHoldsTotal(walletId: string): Promise<number> {
    const result = await this.holdRepo
      .createQueryBuilder('hold')
      .select('COALESCE(SUM(hold.amount), 0)', 'total')
      .where('hold.wallet_id = :walletId', { walletId })
      .andWhere('hold.status = :status', { status: HoldStatus.ACTIVE })
      .getRawOne<{ total: string }>();

    return parseFloat(result?.total ?? '0');
  }

  async getActiveHolds(walletId: string): Promise<Hold[]> {
    return this.holdRepo.find({
      where: { walletId, status: HoldStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }
}
