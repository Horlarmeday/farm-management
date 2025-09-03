import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { ReportTemplate } from './ReportTemplate';

export enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum ScheduleStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  DISABLED = 'disabled',
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
}

@Entity('report_schedules')
export class ReportSchedule extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ScheduleFrequency,
  })
  frequency: ScheduleFrequency;

  @Column({ type: 'varchar', length: 100 })
  cronExpression: string;

  @Column({ type: 'timestamp' })
  nextRunTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastRunTime?: Date;

  @Column({
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.ACTIVE,
  })
  status: ScheduleStatus;

  @Column({ type: 'simple-json', nullable: true })
  parameters?: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  recipients?: string[];

  @Column({
    type: 'enum',
    enum: ReportFormat,
  })
  format: ReportFormat;

  @Column({ type: 'json', nullable: true })
  filters?: Record<string, any>;

  @ManyToOne(() => ReportTemplate)
  @JoinColumn({ name: 'template_id' })
  template: ReportTemplate;

  @Column({ type: 'varchar', length: 255 })
  templateId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'varchar', length: 255 })
  createdById: string;
}
