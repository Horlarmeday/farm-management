import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { ReportTemplate } from './ReportTemplate';
import { User } from './User';

export enum ReportType {
  PRODUCTION = 'PRODUCTION',
  FINANCIAL = 'FINANCIAL',
  INVENTORY = 'INVENTORY',
  HR = 'HR',
  CUSTOM = 'CUSTOM',
}

export enum ReportStatus {
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}

@Entity('reports')
export class Report extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({
    type: 'enum',
    enum: ReportFormat,
  })
  format: ReportFormat;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.GENERATING,
  })
  status: ReportStatus;

  @Column({ type: 'text', nullable: true })
  filePath?: string;

  @Column({ type: 'simple-json' })
  parameters: Record<string, any>;

  @Column({ type: 'timestamp' })
  generatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'longtext', nullable: true })
  reportContent?: string;

  @ManyToOne(() => ReportTemplate, { nullable: true })
  @JoinColumn({ name: 'template_id' })
  template?: ReportTemplate;

  @Column({ type: 'varchar', length: 255, nullable: true })
  templateId?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'generated_by_id' })
  generatedBy: User;

  @Column({ type: 'varchar', length: 255 })
  generatedById: string;

  @Column({ type: 'json', nullable: true })
  filters?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  columns?: string[];

  @Column({ type: 'json', nullable: true })
  groupBy?: string[];

  @Column({ type: 'json', nullable: true })
  sortBy?: string[];

  @Column({ type: 'json', nullable: true })
  data?: Record<string, any>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'varchar', length: 255 })
  createdById: string;

  // Aliases for service compatibility
  get reportName(): string {
    return this.name;
  }

  set reportName(value: string) {
    this.name = value;
  }

  get reportType(): string {
    return this.type;
  }

  set reportType(value: string) {
    this.type = value;
  }
}
