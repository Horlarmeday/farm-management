import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { ReportsService } from '@/services/reports.service';
import { queryKeys } from '@/lib/queryKeys';
import type {
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

// Reports Query Hooks
export const useReports = () => {
  return useQuery({
    queryKey: queryKeys.reports.all,
    queryFn: () => ReportsService.getReports(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useReport = (id: string) => {
  return useQuery({
    queryKey: [...queryKeys.reports.all, 'detail', id],
    queryFn: () => ReportsService.getReportById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useReportsByType = (type: ReportType) => {
  return useQuery({
    queryKey: [...queryKeys.reports.all, 'by-type', type],
    queryFn: () => ReportsService.getReportsByType(type),
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
  });
};

// Report Templates Query Hooks
export const useReportTemplates = () => {
  return useQuery({
    queryKey: [...queryKeys.reports.all, 'templates'],
    queryFn: () => ReportsService.getReportTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useReportTemplate = (id: string) => {
  return useQuery({
    queryKey: [...queryKeys.reports.all, 'template', id],
    queryFn: () => ReportsService.getReportTemplateById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

export const useTemplatesByType = (type: TemplateType) => {
  return useQuery({
    queryKey: [...queryKeys.reports.all, 'templates-by-type', type],
    queryFn: () => ReportsService.getTemplatesByType(type),
    enabled: !!type,
    staleTime: 10 * 60 * 1000,
  });
};

// Report Schedules Query Hooks
export const useReportSchedules = () => {
  return useQuery({
    queryKey: [...queryKeys.reports.all, 'schedules'],
    queryFn: () => ReportsService.getReportSchedules(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useReportSchedule = (id: string) => {
  return useQuery({
    queryKey: [...queryKeys.reports.all, 'schedule', id],
    queryFn: () => ReportsService.getReportScheduleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Report Exports Query Hooks
export const useReportExports = () => {
  return useQuery({
    queryKey: [...queryKeys.reports.all, 'exports'],
    queryFn: () => ReportsService.getReportExports(),
    staleTime: 5 * 60 * 1000,
  });
};

// Stats Query Hooks
export const useReportStats = () => {
  return useQuery({
    queryKey: [...queryKeys.reports.all, 'stats'],
    queryFn: () => ReportsService.getReportStats(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useReportTemplateStats = () => {
  return useQuery({
    queryKey: [...queryKeys.reports.all, 'template-stats'],
    queryFn: () => ReportsService.getReportTemplateStats(),
    staleTime: 10 * 60 * 1000,
  });
};

// Report CRUD Mutation Hooks
export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReportRequest) => ReportsService.createReport(data),
    onSuccess: (response) => {
      toast({
        title: 'Report Created',
        description: `Report "${response.name}" has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
    onError: (error: any) => {
      toast({
        title: 'Report Creation Failed',
        description: error.response?.data?.message || 'Failed to create report. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReportRequest }) => 
      ReportsService.updateReport(id, data),
    onSuccess: (response) => {
      toast({
        title: 'Report Updated',
        description: `Report "${response.name}" has been updated successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
    onError: (error: any) => {
      toast({
        title: 'Report Update Failed',
        description: error.response?.data?.message || 'Failed to update report. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ReportsService.generateReport(id),
    onSuccess: (response) => {
      toast({
        title: 'Report Generation Started',
        description: `Report "${response.name}" is being generated. You will be notified when it's ready.`,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
    onError: (error: any) => {
      toast({
        title: 'Report Generation Failed',
        description: error.response?.data?.message || 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDownloadReport = () => {
  return useMutation({
    mutationFn: (reportId: string) => ReportsService.downloadReport(reportId),
    onSuccess: (blob, reportId) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Report Downloaded',
        description: 'Report has been downloaded successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Download Failed',
        description: error.response?.data?.message || 'Failed to download report. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => ReportsService.deleteReport(reportId),
    onSuccess: () => {
      toast({
        title: 'Report Deleted',
        description: 'Report has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.response?.data?.message || 'Failed to delete report. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

// Report Template Mutation Hooks
export const useCreateReportTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReportTemplateRequest) => ReportsService.createReportTemplate(data),
    onSuccess: (response) => {
      toast({
        title: 'Template Created',
        description: `Template "${response.name}" has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.reports.all, 'templates'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Template Creation Failed',
        description: error.response?.data?.message || 'Failed to create template. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateReportTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReportTemplateRequest }) => 
      ReportsService.updateReportTemplate(id, data),
    onSuccess: (response) => {
      toast({
        title: 'Template Updated',
        description: `Template "${response.name}" has been updated successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.reports.all, 'templates'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Template Update Failed',
        description: error.response?.data?.message || 'Failed to update template. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteReportTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => ReportsService.deleteReportTemplate(templateId),
    onSuccess: () => {
      toast({
        title: 'Template Deleted',
        description: 'Template has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.reports.all, 'templates'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.response?.data?.message || 'Failed to delete template. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

// Report Schedule Mutation Hooks
export const useCreateReportSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReportScheduleRequest) => ReportsService.createReportSchedule(data),
    onSuccess: () => {
      toast({
        title: 'Report Scheduled',
        description: 'Report has been scheduled successfully.',
      });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.reports.all, 'schedules'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Scheduling Failed',
        description: error.response?.data?.message || 'Failed to schedule report. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateReportSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReportScheduleRequest }) => 
      ReportsService.updateReportSchedule(id, data),
    onSuccess: () => {
      toast({
        title: 'Schedule Updated',
        description: 'Report schedule has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.reports.all, 'schedules'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update schedule. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteReportSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: string) => ReportsService.deleteReportSchedule(scheduleId),
    onSuccess: () => {
      toast({
        title: 'Schedule Deleted',
        description: 'Report schedule has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.reports.all, 'schedules'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.response?.data?.message || 'Failed to delete schedule. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useToggleReportSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: string) => ReportsService.toggleReportSchedule(scheduleId),
    onSuccess: () => {
      toast({
        title: 'Schedule Updated',
        description: 'Report schedule status has been updated.',
      });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.reports.all, 'schedules'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update schedule status. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

// Combined hook for reports dashboard data
export const useReportsData = () => {
  const reportsQuery = useReports();
  const templatesQuery = useReportTemplates();
  const schedulesQuery = useReportSchedules();
  const statsQuery = useReportStats();

  return {
    reports: reportsQuery.data,
    templates: templatesQuery.data,
    schedules: schedulesQuery.data,
    stats: statsQuery.data,
    isLoading: reportsQuery.isLoading || templatesQuery.isLoading || schedulesQuery.isLoading || statsQuery.isLoading,
    error: reportsQuery.error || templatesQuery.error || schedulesQuery.error || statsQuery.error,
    refetch: () => {
      reportsQuery.refetch();
      templatesQuery.refetch();
      schedulesQuery.refetch();
      statsQuery.refetch();
    },
  };
};

// Export all hooks for easy importing
export default {
  useReports,
  useReport,
  useReportsByType,
  useReportTemplates,
  useReportTemplate,
  useTemplatesByType,
  useReportSchedules,
  useReportSchedule,
  useReportExports,
  useReportStats,
  useReportTemplateStats,
  useCreateReport,
  useUpdateReport,
  useGenerateReport,
  useDownloadReport,
  useDeleteReport,
  useCreateReportTemplate,
  useUpdateReportTemplate,
  useDeleteReportTemplate,
  useCreateReportSchedule,
  useUpdateReportSchedule,
  useDeleteReportSchedule,
  useToggleReportSchedule,
  useReportsData,
};