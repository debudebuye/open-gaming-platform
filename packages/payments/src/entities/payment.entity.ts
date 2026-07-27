import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@ogp/shared';
import { PaymentStatus, PaymentType } from '../types';

@Entity('payments')
@Index(['userId', 'status'])
export class Payment extends BaseEntity {
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'enum', enum: PaymentType, name: 'type' })
  type!: PaymentType;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount!: number;

  @Column({ type: 'varchar', length: 10 })
  currency!: string;

  @Column({ type: 'varchar', length: 50, name: 'provider' })
  provider!: string;

  @Column({ type: 'varchar', length: 255, name: 'external_id' })
  externalId!: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ type: 'jsonb', default: '{}' })
  metadata!: Record<string, unknown>;
}
