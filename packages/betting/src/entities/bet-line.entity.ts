import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { BetSlip } from './bet-slip.entity';

@Entity('bet_lines')
export class BetLine {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'slip_id' })
  slipId!: string;

  @ManyToOne(() => BetSlip, (slip) => slip.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'slip_id' })
  slip!: BetSlip;

  @Column({ type: 'uuid', name: 'selection_id' })
  selectionId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, name: 'odds_at_placement' })
  oddsAtPlacement!: number;
}
