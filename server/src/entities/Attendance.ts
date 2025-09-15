import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { AttendanceStatus } from '../../../shared/src/types';

@Entity('attendance')
export class Attendance extends BaseEntity {
  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'timestamp' })
  clockIn: Date;

  @Column({ type: 'timestamp', nullable: true })
  clockOut?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  workLocation?: string;

  @Column({ type: 'int', nullable: true })
  hoursWorked?: number;

  @Column({ type: 'int', nullable: true })
  overtimeHours?: number;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
  })
  status: AttendanceStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  approvedById?: string;
}
