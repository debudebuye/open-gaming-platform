import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@ogp/shared';
import { KycStatus } from './kyc-status.enum';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'enum', enum: KycStatus, default: KycStatus.PENDING, name: 'kyc_status' })
  kycStatus!: KycStatus;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;
}
