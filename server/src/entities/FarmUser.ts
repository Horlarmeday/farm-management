import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { FarmRole } from '../../../shared/src/types';
import { BaseEntity } from './BaseEntity';
import { Farm } from './Farm';
import { User } from './User';

@Entity('farm_users')
@Index(['farmId', 'userId'], { unique: true })
export class FarmUser extends BaseEntity {
  @Column({ type: 'enum', enum: FarmRole })
  role!: FarmRole;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  joinedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  invitedBy?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => Farm, (farm) => farm.farmUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farmId' })
  farm!: Farm;

  @Column({ type: 'varchar', length: 255 })
  farmId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 255 })
  userId!: string;
}