import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Report } from './Report';

export enum ExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

@Entity('report_exports')
export class ReportExport extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ExportFormat,
  })
  format: ExportFormat;

  @Column({
    type: 'enum',
    enum: ExportStatus,
    default: ExportStatus.PENDING,
  })
  status: ExportStatus;

  @Column({ type: 'text', nullable: true })
  filePath?: string;

  @Column({ type: 'int', nullable: true })
  fileSize?: number;

  @Column({ type: 'text', nullable: true })
  downloadUrl?: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @ManyToOne(() => Report)
  @JoinColumn({ name: 'report_id' })
  report: Report;

  @Column({ type: 'varchar', length: 255 })
  reportId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_by_id' })
  requestedBy: User;

  @Column({ type: 'varchar', length: 255 })
  requestedById: string;
}
