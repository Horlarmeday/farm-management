import { LeaveStatus, LeaveType } from '@kuyash/shared';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity('leaves')
export class Leave extends BaseEntity {
  @Column({
    type: 'enum',
    enum: LeaveType,
  })
  leaveType: LeaveType;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'int' })
  daysRequested: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'date' })
  appliedDate: Date;

  @Column({
    type: 'enum',
    enum: LeaveStatus,
    default: LeaveStatus.PENDING,
  })
  status: LeaveStatus;

  @Column({ type: 'text', nullable: true })
  reviewNotes?: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'covering_person_id' })
  coveringPerson?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  coveringPersonId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reviewedById?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'processed_by_id' })
  processedBy?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  processedById?: string;

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ type: 'text', nullable: true })
  comments?: string;
}
