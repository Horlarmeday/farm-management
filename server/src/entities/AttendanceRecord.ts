import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { AttendanceStatus } from '@kuyash/shared';

@Entity('attendance_records')
export class AttendanceRecord extends BaseEntity {
  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'time', nullable: true })
  clockIn?: string;

  @Column({ type: 'time', nullable: true })
  clockOut?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hoursWorked?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  regularHours?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  overtimeHours?: number;

  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  status!: AttendanceStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude?: number;

  @Column({ type: 'boolean', default: false })
  isApproved!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.attendanceRecords)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 255 })
  userId!: string;
}
