import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@ogp/shared';
import { MarketStatus } from '../enums';

@Entity('markets')
@Index(['sport', 'status'])
export class Market extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  sport!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'enum', enum: MarketStatus, default: MarketStatus.OPEN })
  status!: MarketStatus;

  @Column({ type: 'timestamptz', name: 'starts_at' })
  startsAt!: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata!: Record<string, unknown>;
}
