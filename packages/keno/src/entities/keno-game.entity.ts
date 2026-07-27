import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@ogp/shared';

@Entity('keno_games')
export class KenoGame extends BaseEntity {
  @Column({ type: 'int', name: 'draw_number' })
  drawNumber!: number;

  @Column({ type: 'simple-array', name: 'drawn_numbers', nullable: true })
  drawnNumbers?: number[];

  @Column({ type: 'varchar', length: 20, default: 'OPEN' })
  status!: 'OPEN' | 'DRAWING' | 'DRAWN';

  @Column({ type: 'timestamptz', nullable: true, name: 'drawn_at' })
  drawnAt?: Date;
}
