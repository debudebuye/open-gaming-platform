import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@ogp/shared';
import { Instrument } from './instrument.entity';

@Entity('positions')
@Index(['userId', 'instrumentId'], { unique: true })
export class Position extends BaseEntity {
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'instrument_id' })
  instrumentId!: string;

  @ManyToOne(() => Instrument)
  @JoinColumn({ name: 'instrument_id' })
  instrument!: Instrument;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'avg_entry_price' })
  avgEntryPrice!: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, name: 'unrealized_pnl', default: 0 })
  unrealizedPnl!: number;
}
