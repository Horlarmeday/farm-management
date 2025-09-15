import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { FarmRole } from '../../../shared/src/types';
import { BaseEntity } from './BaseEntity';
import { Farm } from './Farm';
import { User } from './User';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

@Entity('farm_invitations')
@Index(['farmId', 'inviteeEmail'], { unique: true })
export class FarmInvitation extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  inviteeEmail!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  inviteeName?: string;

  @Column({ type: 'enum', enum: FarmRole })
  role!: FarmRole;

  @Column({ type: 'enum', enum: InvitationStatus, default: InvitationStatus.PENDING })
  status!: InvitationStatus;

  @Column({ type: 'varchar', length: 255 })
  token!: string; // Unique token for invitation link

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt?: Date;

  @Column({ type: 'text', nullable: true })
  message?: string;

  // Relationships
  @ManyToOne(() => Farm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farmId' })
  farm!: Farm;

  @Column({ type: 'varchar', length: 255 })
  farmId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invitedById' })
  invitedBy!: User;

  @Column({ type: 'varchar', length: 255 })
  invitedById!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'acceptedById' })
  acceptedBy?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  acceptedById?: string;
}