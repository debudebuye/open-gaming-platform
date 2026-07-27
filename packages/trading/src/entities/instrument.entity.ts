import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@ogp/shared';
import { InstrumentStatus } from '../enums';

@Entity('instruments')
export class Instrument extends BaseEntity {
  @Column({ type: 'varchar', length: 20, unique: true })
  symbol!: string;

  @Column({ type: 'varchar', length: 10, name: 'base_currency' })
  baseCurrency!: string;

  @Column({ type: 'varchar', length: 10, name: 'quote_currency' })
  quoteCurrency!: string;

  @Column({ type: 'enum', enum: InstrumentStatus, default: InstrumentStatus.ACTIVE })
  status!: InstrumentStatus;
}
