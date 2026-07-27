import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@ogp/shared';
import { User } from './user.entity';

@Entity('sessions')
@Index(['userId'])
@Index(['expiresAt'])
export class Session extends BaseEntity {
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 255, name: 'refresh_token_hash' })
  refreshTokenHash!: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'device_info' })
  deviceInfo?: string;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt!: Date;
}
