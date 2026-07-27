import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LedgerEntry } from '../entities/ledger-entry.entity';
import { LedgerEntryType } from '../enums';
import { InsufficientFundsException, ConflictException_, ErrorCode } from '@ogp/shared';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(LedgerEntry) private readonly ledgerRepo: Repository<LedgerEntry>,
    private readonly dataSource: DataSource,
  ) {}

  async getBalance(walletId: string): Promise<number> {
    const result = await this.ledgerRepo
      .createQueryBuilder('entry')
      .select('COALESCE(SUM(CASE WHEN entry.type IN (:creditTypes) THEN entry.amount ELSE 0 END) - SUM(CASE WHEN entry.type IN (:debitTypes) THEN entry.amount ELSE 0 END), 0)', 'balance')
      .setParameters({
        creditTypes: [LedgerEntryType.DEPOSIT, LedgerEntryType.BET_WIN_CREDIT, LedgerEntryType.BONUS_CREDIT, LedgerEntryType.ADJUSTMENT],
        debitTypes: [LedgerEntryType.WITHDRAWAL, LedgerEntryType.BET_DEBIT, LedgerEntryType.TRADE_SETTLEMENT, LedgerEntryType.FEE_DEBIT],
      })
      .where('entry.wallet_id = :walletId', { walletId })
      .getRawOne<{ balance: string }>();

    return parseFloat(result?.balance ?? '0');
  }

  async credit(walletId: string, amount: number, referenceId: string, referenceType: string, reason?: string): Promise<LedgerEntry> {
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(LedgerEntry, { where: { referenceId, referenceType } });
      if (existing) {
        throw new ConflictException_(ErrorCode.WALLET_DUPLICATE_REFERENCE, 'Duplicate reference');
      }

      const currentBalance = await this.computeBalanceInTx(manager, walletId);
      const newBalance = currentBalance + amount;

      const entry = manager.create(LedgerEntry, {
        walletId,
        type: LedgerEntryType.DEPOSIT,
        amount,
        referenceId,
        referenceType,
        balanceAfter: newBalance,
        reason,
      });

      return manager.save(entry);
    });
  }

  async debit(walletId: string, amount: number, referenceId: string, referenceType: string, type: LedgerEntryType, reason?: string): Promise<LedgerEntry> {
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(LedgerEntry, { where: { referenceId, referenceType } });
      if (existing) {
        throw new ConflictException_(ErrorCode.WALLET_DUPLICATE_REFERENCE, 'Duplicate reference');
      }

      const currentBalance = await this.computeBalanceInTx(manager, walletId);
      if (currentBalance < amount) {
        throw new InsufficientFundsException();
      }

      const newBalance = currentBalance - amount;

      const entry = manager.create(LedgerEntry, {
        walletId,
        type,
        amount,
        referenceId,
        referenceType,
        balanceAfter: newBalance,
        reason,
      });

      return manager.save(entry);
    });
  }

  async getEntries(walletId: string, skip = 0, limit = 20): Promise<[LedgerEntry[], number]> {
    return this.ledgerRepo.findAndCount({
      where: { walletId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
  }

  private async computeBalanceInTx(manager: Repository<LedgerEntry>['manager'], walletId: string): Promise<number> {
    const result = await manager
      .createQueryBuilder(LedgerEntry, 'entry')
      .select("COALESCE(SUM(CASE WHEN entry.type IN ('DEPOSIT','BET_WIN_CREDIT','BONUS_CREDIT','ADJUSTMENT') THEN entry.amount ELSE 0 END) - SUM(CASE WHEN entry.type IN ('WITHDRAWAL','BET_DEBIT','TRADE_SETTLEMENT','FEE_DEBIT') THEN entry.amount ELSE 0 END), 0)", 'balance')
      .where('entry.wallet_id = :walletId', { walletId })
      .getRawOne<{ balance: string }>();

    return parseFloat(result?.balance ?? '0');
  }
}
