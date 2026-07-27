import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@ogp/shared';
import { Order } from './order.entity';

@Entity('trades')
export class Trade extends BaseEntity {
  @Column({ type: 'uuid', name: 'buy_order_id' })
  buyOrderId!: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'buy_order_id' })
  buyOrder!: Order;

  @Column({ type: 'uuid', name: 'sell_order_id' })
  sellOrderId!: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'sell_order_id' })
  sellOrder!: Order;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  price!: number;

  @Column({ type: 'timestamptz', name: 'executed_at' })
  executedAt!: Date;
}
