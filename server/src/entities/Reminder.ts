import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { TaskPriority } from '@kuyash/shared';

export enum ReminderType {
  TASK = 'task',
  APPOINTMENT = 'appointment',
  DEADLINE = 'deadline',
  MAINTENANCE = 'maintenance',
  FEEDING = 'feeding',
  VACCINATION = 'vaccination',
}

export enum ReminderStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  SNOOZED = 'snoozed',
}

@Entity('reminders')
export class Reminder extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ReminderType,
  })
  type: ReminderType;

  @Column({ type: 'timestamp' })
  reminderTime: Date;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({
    type: 'enum',
    enum: ReminderStatus,
    default: ReminderStatus.ACTIVE,
  })
  status: ReminderStatus;

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  recurringPattern?: string;

  @Column({ type: 'timestamp', nullable: true })
  nextReminderTime?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceType?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceId?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'varchar', length: 255 })
  createdById: string;
}
