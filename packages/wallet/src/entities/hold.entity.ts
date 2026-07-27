import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@ogp/shared';
import { HoldStatus } from '../enums';
import { Wallet } from './wallet.entity';

@Entity('holds')
@Index(['walletId', 'status'])
@Index(['referenceId'], { unique: true })
export class Hold extends BaseEntity {
  @Column({ type: 'uuid', name: 'wallet_id' })
  walletId!: string;

  @ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet!: Wallet;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount!: number;

  @Column({ type: 'varchar', length: 255 })
  reason!: string;

  @Column({ type: 'varchar', length: 255, name: 'reference_id' })
  referenceId!: string;

  @Column({ type: 'enum', enum: HoldStatus, default: HoldStatus.ACTIVE })
  status!: HoldStatus;

  @Column({ type: 'timestamptz', nullable: true, name: 'expires_at' })
  expiresAt?: Date;
}
