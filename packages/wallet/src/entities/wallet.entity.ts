import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@ogp/shared';

@Entity('wallets')
@Index(['userId', 'currency'], { unique: true })
export class Wallet extends BaseEntity {
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', length: 10 })
  currency!: string;

  @Column({ type: 'boolean', default: false, name: 'is_default' })
  isDefault!: boolean;
}
