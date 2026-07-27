import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@ogp/shared';
import { OrderSide, OrderType, OrderStatus } from '../enums';
import { Instrument } from './instrument.entity';

@Entity('orders')
@Index(['userId', 'status'])
@Index(['instrumentId', 'side', 'status'])
export class Order extends BaseEntity {
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'instrument_id' })
  instrumentId!: string;

  @ManyToOne(() => Instrument)
  @JoinColumn({ name: 'instrument_id' })
  instrument!: Instrument;

  @Column({ type: 'enum', enum: OrderSide })
  side!: OrderSide;

  @Column({ type: 'enum', enum: OrderType })
  type!: OrderType;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  price?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true, name: 'stop_price' })
  stopPrice?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0, name: 'filled_quantity' })
  filledQuantity!: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;
}
