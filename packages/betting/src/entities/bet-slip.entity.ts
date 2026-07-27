import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@ogp/shared';
import { BetStatus, BetType } from '../enums';
import { BetLine } from './bet-line.entity';

@Entity('bet_slips')
@Index(['userId', 'status'])
export class BetSlip extends BaseEntity {
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'enum', enum: BetType, default: BetType.SINGLE })
  type!: BetType;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'total_stake' })
  totalStake!: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'potential_payout' })
  potentialPayout!: number;

  @Column({ type: 'enum', enum: BetStatus, default: BetStatus.PENDING })
  status!: BetStatus;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true, name: 'actual_payout' })
  actualPayout?: number;

  @Column({ type: 'timestamptz', nullable: true, name: 'settled_at' })
  settledAt?: Date;

  @OneToMany(() => BetLine, (line) => line.slip, { cascade: true })
  lines!: BetLine[];
}
