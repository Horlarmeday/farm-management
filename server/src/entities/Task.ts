import { TaskPriority, TaskStatus } from '@kuyash/shared';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Farm } from './Farm';
import { Notification } from './Notification';
import { TaskChecklistItem } from './TaskChecklistItem';
import { User } from './User';

@Entity('tasks')
export class Task extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status!: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority!: TaskPriority;

  @Column({
    type: 'enum',
    enum: [
      'feeding',
      'vaccination',
      'maintenance',
      'harvest',
      'cleaning',
      'inspection',
      'treatment',
      'custom',
    ],
    default: 'custom',
  })
  type!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'text', nullable: true })
  completionNotes?: string;

  @Column({ type: 'simple-json', nullable: true })
  completionImages?: string[];

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  isRecurring!: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  recurringPattern?: string; // daily, weekly, monthly

  @Column({ type: 'date', nullable: true })
  nextDueDate?: Date;

  @Column({ type: 'int', nullable: true })
  estimatedDuration?: number; // in minutes

  @Column({ type: 'int', nullable: true })
  actualDuration?: number; // in minutes

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceType?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  taskNumber?: string;

  // Relationships
  @ManyToOne(() => User, (user) => user.assignedTasks)
  @JoinColumn({ name: 'assignedUserId' })
  assignedUser?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  assignedUserId?: string;

  @ManyToOne(() => User, (user) => user.createdTasks)
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  @Column({ type: 'varchar', length: 255 })
  createdById!: string;

  @OneToMany(() => Notification, (notification) => notification.task)
  notifications!: Notification[];

  @OneToMany(() => TaskChecklistItem, (item) => item.task)
  checklistItems!: TaskChecklistItem[];

  @ManyToOne(() => Farm, { nullable: false })
  @JoinColumn({ name: 'farmId' })
  farm!: Farm;

  @Column({ type: 'varchar', length: 255 })
  farmId!: string;
}
