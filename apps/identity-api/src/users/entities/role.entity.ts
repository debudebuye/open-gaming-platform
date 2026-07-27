import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@ogp/shared';
import { RoleName } from './role-name.enum';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ type: 'enum', enum: RoleName, unique: true })
  name!: RoleName;

  @Column({ type: 'jsonb', default: '[]' })
  permissions!: string[];
}
