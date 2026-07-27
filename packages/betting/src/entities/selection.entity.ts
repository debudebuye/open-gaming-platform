import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@ogp/shared';
import { SelectionStatus } from '../enums';
import { Market } from './market.entity';

@Entity('selections')
@Index(['marketId', 'status'])
export class Selection extends BaseEntity {
  @Column({ type: 'uuid', name: 'market_id' })
  marketId!: string;

  @ManyToOne(() => Market, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'market_id' })
  market!: Market;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  odds!: number;

  @Column({ type: 'enum', enum: SelectionStatus, default: SelectionStatus.OPEN })
  status!: SelectionStatus;
}
