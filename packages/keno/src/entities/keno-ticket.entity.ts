import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@ogp/shared';
import { KenoGame } from './keno-game.entity';

export type TicketStatus = 'PENDING' | 'WON' | 'LOST';

@Entity('keno_tickets')
export class KenoTicket extends BaseEntity {
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'game_id' })
  gameId!: string;

  @ManyToOne(() => KenoGame)
  @JoinColumn({ name: 'game_id' })
  game!: KenoGame;

  @Column({ type: 'simple-array', name: 'selected_numbers' })
  selectedNumbers!: number[];

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  stake!: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  payout?: number;

  @Column({ type: 'varchar', length: 10, default: 'PENDING' })
  status!: TicketStatus;

  @Column({ type: 'int', nullable: true, name: 'matches_count' })
  matchesCount?: number;
}
