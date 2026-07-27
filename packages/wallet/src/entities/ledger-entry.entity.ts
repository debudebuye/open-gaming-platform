import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@ogp/shared';
import { LedgerEntryType } from '../enums';
import { Wallet } from './wallet.entity';

@Entity('ledger_entries')
@Index(['walletId', 'createdAt'])
@Index(['referenceId', 'referenceType'], { unique: true })
export class LedgerEntry extends BaseEntity {
  @Column({ type: 'uuid', name: 'wallet_id' })
  walletId!: string;

  @ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet!: Wallet;

  @Column({ type: 'enum', enum: LedgerEntryType, name: 'type' })
  type!: LedgerEntryType;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount!: number;

  @Column({ type: 'varchar', length: 255, name: 'reference_id' })
  referenceId!: string;

  @Column({ type: 'varchar', length: 100, name: 'reference_type' })
  referenceType!: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'balance_after' })
  balanceAfter!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason?: string;
}
