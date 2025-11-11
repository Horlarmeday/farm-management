import { apiClient } from './api';
import {
  Report,
  ReportTemplate,
  ReportSchedule,
  ReportExport,
  CreateReportRequest,
  UpdateReportRequest,
  CreateReportTemplateRequest,
  UpdateReportTemplateRequest,
  CreateReportScheduleRequest,
  UpdateReportScheduleRequest,
  ReportStats,
  ReportTemplateStats,
  ReportType,
  ReportFormat,
  TemplateType,
} from '../../../shared/src/types/reporting.types';

const prefix = '/api/reports';
export class ReportsService {
  // Report CRUD operations
  static async getReports(): Promise<Report[]> {
    const response = await apiClient.get(`${prefix}`);
    return response.data;
  }

  static async getReportById(id: string): Promise<Report> {
    const response = await apiClient.get(`${prefix}/${id}`);
    return response.data;
  }

  static async createReport(data: CreateReportRequest): Promise<Report> {
    const response = await apiClient.post(`${prefix}`, data);
    return response.data;
  }

  static async updateReport(id: string, data: UpdateReportRequest): Promise<Report> {
    const response = await apiClient.put(`${prefix}/${id}`, data);
    return response.data;
  }

  static async deleteReport(id: string): Promise<void> {
    await apiClient.delete(`${prefix}/${id}`);
  }

  static async generateReport(id: string): Promise<Report> {
    const response = await apiClient.post(`${prefix}/${id}/generate`);
    return response.data;
  }

  static async downloadReport(id: string): Promise<Blob> {
    const response = await apiClient.get(`${prefix}/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Report Template operations
  static async getReportTemplates(): Promise<ReportTemplate[]> {
    const response = await apiClient.get(`${prefix}/templates`);
    return response.data;
  }

  static async getReportTemplateById(id: string): Promise<ReportTemplate> {
    const response = await apiClient.get(`${prefix}/templates/${id}`);
    return response.data;
  }

  static async createReportTemplate(data: CreateReportTemplateRequest): Promise<ReportTemplate> {
    const response = await apiClient.post(`${prefix}/templates`, data);
    return response.data;
  }

  static async updateReportTemplate(id: string, data: UpdateReportTemplateRequest): Promise<ReportTemplate> {
    const response = await apiClient.put(`${prefix}/templates/${id}`, data);
    return response.data;
  }

  static async deleteReportTemplate(id: string): Promise<void> {
    await apiClient.delete(`${prefix}/templates/${id}`);
  }

  static async duplicateReportTemplate(id: string): Promise<ReportTemplate> {
    const response = await apiClient.post(`${prefix}/templates/${id}/duplicate`);
    return response.data;
  }

  // Report Schedule operations
  static async getReportSchedules(): Promise<ReportSchedule[]> {
    const response = await apiClient.get(`${prefix}/schedules`);
    return response.data;
  }

  static async getReportScheduleById(id: string): Promise<ReportSchedule> {
    const response = await apiClient.get(`${prefix}/schedules/${id}`);
    return response.data;
  }

  static async createReportSchedule(data: CreateReportScheduleRequest): Promise<ReportSchedule> {
    const response = await apiClient.post(`${prefix}/schedules`, data);
    return response.data;
  }

  static async updateReportSchedule(id: string, data: UpdateReportScheduleRequest): Promise<ReportSchedule> {
    const response = await apiClient.put(`${prefix}/schedules/${id}`, data);
    return response.data;
  }

  static async deleteReportSchedule(id: string): Promise<void> {
    await apiClient.delete(`${prefix}/schedules/${id}`);
  }

  static async toggleReportSchedule(id: string): Promise<ReportSchedule> {
    const response = await apiClient.patch(`${prefix}/schedules/${id}/toggle`);
    return response.data;
  }

  static async runReportSchedule(id: string): Promise<Report> {
    const response = await apiClient.post(`${prefix}/schedules/${id}/run`);
    return response.data;
  }

  // Report Export operations
  static async getReportExports(): Promise<ReportExport[]> {
    const response = await apiClient.get(`${prefix}/exports`);
    return response.data;
  }

  static async getReportExportById(id: string): Promise<ReportExport> {
    const response = await apiClient.get(`${prefix}/exports/${id}`);
    return response.data;
  }

  static async createReportExport(reportId: string, format: ReportFormat): Promise<ReportExport> {
    const response = await apiClient.post(`${prefix}/exports`, { reportId, format });
    return response.data;
  }

  static async downloadReportExport(id: string): Promise<Blob> {
    const response = await apiClient.get(`${prefix}/exports/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  static async deleteReportExport(id: string): Promise<void> {
    await apiClient.delete(`${prefix}/exports/${id}`);
  }

  // Analytics and Statistics
  static async getReportStats(): Promise<ReportStats> {
    const response = await apiClient.get(`${prefix}/stats`);
    return response.data;
  }

  static async getReportTemplateStats(): Promise<ReportTemplateStats> {
    const response = await apiClient.get(`${prefix}/templates/stats`);
    return response.data;
  }

  static async getReportsByType(type: ReportType): Promise<Report[]> {
    const response = await apiClient.get(`${prefix}/by-type/${type}`);
    return response.data;
  }

  static async getReportsByTemplate(templateId: string): Promise<Report[]> {
    const response = await apiClient.get(`${prefix}/by-template/${templateId}`);
    return response.data;
  }

  static async getTemplatesByType(type: TemplateType): Promise<ReportTemplate[]> {
    const response = await apiClient.get(`${prefix}/templates/by-type/${type}`);
    return response.data;
  }

  // Search and filtering
  static async searchReports(query: string): Promise<Report[]> {
    const response = await apiClient.get(`${prefix}/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  static async searchReportTemplates(query: string): Promise<ReportTemplate[]> {
    const response = await apiClient.get(`${prefix}/templates/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Bulk operations
  static async bulkDeleteReports(ids: string[]): Promise<void> {
    await apiClient.request(`${prefix}/bulk`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  static async bulkDeleteReportTemplates(ids: string[]): Promise<void> {
    await apiClient.request(`${prefix}/templates/bulk`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  static async bulkDeleteReportSchedules(ids: string[]): Promise<void> {
    await apiClient.request(`${prefix}/schedules/bulk`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Utility methods
  static async validateReportTemplate(data: CreateReportTemplateRequest): Promise<{ valid: boolean; errors?: string[] }> {
    const response = await apiClient.post(`${prefix}/templates/validate`, data);
    return response.data;
  }

  static async previewReportTemplate(id: string, data?: Record<string, any>): Promise<{ preview: string }> {
    const response = await apiClient.post(`${prefix}/templates/${id}/preview`, { data });
    return response.data;
  }

  static async getReportProgress(id: string): Promise<{ progress: number; status: string }> {
    const response = await apiClient.get(`${prefix}/${id}/progress`);
    return response.data;
  }
}