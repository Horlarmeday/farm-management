import { BaseEntity } from './common.types';
import { User } from './user.types';

// Report enums
export enum ReportType {
  PRODUCTION = 'production',
  FINANCIAL = 'financial',
  INVENTORY = 'inventory',
  HR = 'hr',
  CUSTOM = 'custom',
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
  JSON = 'json',
}

export enum ExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

export enum TemplateType {
  PRODUCTION = 'production',
  FINANCIAL = 'financial',
  INVENTORY = 'inventory',
  HR = 'hr',
  CUSTOM = 'custom',
}

// Report interfaces
export interface Report extends BaseEntity {
  name: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  filePath?: string;
  parameters: Record<string, any>;
  generatedAt: Date;
  expiresAt?: Date;
  errorMessage?: string;
  completedAt?: Date;
  reportContent?: string;
  template?: ReportTemplate;
  templateId?: string;
  generatedBy: User;
  generatedById: string;
  filters?: Record<string, any>;
  columns?: string[];
  groupBy?: string[];
  sortBy?: string[];
  data?: Record<string, any>;
  createdBy: User;
  createdById: string;
}

export interface ReportTemplate extends BaseEntity {
  name: string;
  description?: string;
  type: TemplateType;
  subject: string;
  message: string;
  htmlContent?: string;
  parameters: Record<string, any>;
  isActive: boolean;
  variables?: string[];
  defaultData?: Record<string, any>;
  conditions?: Record<string, any>;
  scheduleType?: 'immediate' | 'delayed' | 'recurring';
  delayMinutes?: number;
  recurringPattern?: string;
  createdBy: User;
  createdById: string;
}

export interface ReportSchedule extends BaseEntity {
  name: string;
  description?: string;
  template: ReportTemplate;
  templateId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  cronExpression: string;
  nextRunTime: Date;
  lastRunTime?: Date;
  isActive: boolean;
  recipients?: string[];
  parameters?: Record<string, any>;
  createdBy: User;
  createdById: string;
}

export interface ReportExport extends BaseEntity {
  report: Report;
  reportId: string;
  format: ReportFormat;
  status: ExportStatus;
  expiresAt: Date;
  filePath?: string;
  fileSize?: number;
  downloadCount: number;
  lastDownloadedAt?: Date;
  createdBy: User;
  createdById: string;
}

// Request interfaces
export interface CreateReportRequest {
  name: string;
  type: ReportType;
  format: ReportFormat;
  templateId?: string;
  parameters?: Record<string, any>;
  filters?: Record<string, any>;
  columns?: string[];
  groupBy?: string[];
  sortBy?: string[];
}

export interface UpdateReportRequest {
  name?: string;
  status?: ReportStatus;
  parameters?: Record<string, any>;
  filters?: Record<string, any>;
  columns?: string[];
  groupBy?: string[];
  sortBy?: string[];
}

export interface CreateReportTemplateRequest {
  name: string;
  description?: string;
  type: TemplateType;
  subject: string;
  message: string;
  htmlContent?: string;
  parameters: Record<string, any>;
  variables?: string[];
  defaultData?: Record<string, any>;
  conditions?: Record<string, any>;
  scheduleType?: 'immediate' | 'delayed' | 'recurring';
  delayMinutes?: number;
  recurringPattern?: string;
}

export interface UpdateReportTemplateRequest {
  name?: string;
  description?: string;
  subject?: string;
  message?: string;
  htmlContent?: string;
  parameters?: Record<string, any>;
  isActive?: boolean;
  variables?: string[];
  defaultData?: Record<string, any>;
  conditions?: Record<string, any>;
  scheduleType?: 'immediate' | 'delayed' | 'recurring';
  delayMinutes?: number;
  recurringPattern?: string;
}

export interface CreateReportScheduleRequest {
  name: string;
  description?: string;
  templateId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  cronExpression: string;
  recipients?: string[];
  parameters?: Record<string, any>;
}

export interface UpdateReportScheduleRequest {
  name?: string;
  description?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  cronExpression?: string;
  isActive?: boolean;
  recipients?: string[];
  parameters?: Record<string, any>;
}

// Stats interfaces
export interface ReportStats {
  totalReports: number;
  reportsByType: Record<ReportType, number>;
  reportsByStatus: Record<ReportStatus, number>;
  reportsByFormat: Record<ReportFormat, number>;
  averageGenerationTime: number;
  totalTemplates: number;
  activeSchedules: number;
  recentReports: Report[];
}

export interface ReportTemplateStats {
  totalTemplates: number;
  templatesByType: Record<TemplateType, number>;
  activeTemplates: number;
  mostUsedTemplates: ReportTemplate[];
  averageUsageCount: number;
}
