import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity('user_sessions')
export class UserSession extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  sessionToken!: string;

  @Column({ type: 'varchar', length: 255 })
  refreshToken!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceType?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt?: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 255 })
  userId!: string;
}
