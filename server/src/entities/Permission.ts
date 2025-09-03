import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Role } from './Role';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100 })
  module!: string; // e.g., 'poultry', 'livestock', 'fishery', 'inventory', etc.

  @Column({ type: 'varchar', length: 50 })
  action!: string; // e.g., 'create', 'read', 'update', 'delete', 'manage'

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // Relationships
  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];
}
