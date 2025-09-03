import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Task } from './Task';
import { User } from './User';

@Entity('task_checklist_items')
export class TaskChecklistItem extends BaseEntity {
  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'boolean', default: false })
  isCompleted!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'int' })
  order!: number;

  // Relationships
  @ManyToOne(() => Task, (task) => task.checklistItems)
  @JoinColumn({ name: 'taskId' })
  task!: Task;

  @Column({ type: 'varchar', length: 255 })
  taskId!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'completedById' })
  completedBy?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  completedById?: string;
}
