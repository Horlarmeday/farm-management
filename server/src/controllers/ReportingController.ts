import { ApiResponse } from '@kuyash/shared';
import { NextFunction, Request, Response } from 'express';
import { ReportingService } from '../services/ReportingService';
import { ServiceFactory } from '../services/ServiceFactory';

export class ReportingController {
  private reportingService: ReportingService;

  constructor() {
    const serviceFactory = ServiceFactory.getInstance();
    this.reportingService = serviceFactory.getReportingService();
  }

  // Report Generation
  generateReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await this.reportingService.generateReport({
        ...req.body,
        requestedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Report generated successfully',
        data: report,
      } as ApiResponse<typeof report>);
    } catch (error) {
      next(error);
    }
  };

  getReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { reportType, status, generatedBy, startDate, endDate, search } = req.query;

      const reports = await this.reportingService.getReports({
        reportType: reportType as any,
        status: status as string,
        requestedById: generatedBy as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        message: 'Reports retrieved successfully',
        data: reports,
      } as ApiResponse<typeof reports>);
    } catch (error) {
      next(error);
    }
  };

  getReportById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const report = await this.reportingService.getReportById(id);

      res.json({
        success: true,
        message: 'Report retrieved successfully',
        data: report,
      } as ApiResponse<typeof report>);
    } catch (error) {
      next(error);
    }
  };

  downloadReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { format = 'pdf' } = req.query;

      const downloadResult = await this.reportingService.downloadReport(id, format as string);

      res.json({
        success: true,
        message: 'Report download initiated successfully',
        data: downloadResult,
      } as ApiResponse<typeof downloadResult>);
    } catch (error) {
      next(error);
    }
  };

  updateReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const report = await this.reportingService.updateReport(id, req.body);

      res.json({
        success: true,
        message: 'Report updated successfully',
        data: report,
      } as ApiResponse<typeof report>);
    } catch (error) {
      next(error);
    }
  };

  deleteReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.reportingService.deleteReport(id);

      res.json({
        success: true,
        message: 'Report deleted successfully',
        data: null,
      } as ApiResponse<null>);
    } catch (error) {
      next(error);
    }
  };

  // Dashboard Analytics
  getDashboardOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, modules } = req.query;

      const overview = await this.reportingService.getDashboardOverview({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        modules: modules as string[],
      });

      res.json({
        success: true,
        message: 'Dashboard overview retrieved successfully',
        data: overview,
      } as ApiResponse<typeof overview>);
    } catch (error) {
      next(error);
    }
  };

  getDashboardKPIs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, modules } = req.query;

      const kpis = await this.reportingService.getDashboardKPIs({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        modules: modules as string[],
      });

      res.json({
        success: true,
        message: 'Dashboard KPIs retrieved successfully',
        data: kpis,
      } as ApiResponse<typeof kpis>);
    } catch (error) {
      next(error);
    }
  };

  getDashboardCharts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, modules, chartTypes } = req.query;

      const charts = await this.reportingService.getDashboardCharts({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        modules: modules as string[],
        chartTypes: chartTypes as string[],
      });

      res.json({
        success: true,
        message: 'Dashboard charts retrieved successfully',
        data: charts,
      } as ApiResponse<typeof charts>);
    } catch (error) {
      next(error);
    }
  };

  getDashboardModules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const modules = await this.reportingService.getDashboardModules(req.query);

      res.json({
        success: true,
        message: 'Dashboard modules retrieved successfully',
        data: modules,
      } as ApiResponse<typeof modules>);
    } catch (error) {
      next(error);
    }
  };

  getRevenueTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { period = 'month' } = req.query;
      const trend = await this.reportingService.getRevenueTrend(period as string);

      res.json({
        success: true,
        message: 'Revenue trend retrieved successfully',
        data: trend,
      } as ApiResponse<typeof trend>);
    } catch (error) {
      next(error);
    }
  };

  getProductionDistribution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const distribution = await this.reportingService.getProductionDistribution(req.query);

      res.json({
        success: true,
        message: 'Production distribution retrieved successfully',
        data: distribution,
      } as ApiResponse<typeof distribution>);
    } catch (error) {
      next(error);
    }
  };

  getQuickStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.reportingService.getQuickStats(req.query);

      res.json({
        success: true,
        message: 'Quick stats retrieved successfully',
        data: stats,
      } as ApiResponse<typeof stats>);
    } catch (error) {
      next(error);
    }
  };

  getRecentActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit = 10 } = req.query;
      const activities = await this.reportingService.getRecentActivities(Number(limit));

      res.json({
        success: true,
        message: 'Recent activities retrieved successfully',
        data: activities,
      } as ApiResponse<typeof activities>);
    } catch (error) {
      next(error);
    }
  };

  getDashboardAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit = 10 } = req.query;
      const alerts = await this.reportingService.getDashboardAlerts(limit ? Number(limit) : undefined);

      res.json({
        success: true,
        message: 'Dashboard alerts retrieved successfully',
        data: alerts,
      } as ApiResponse<typeof alerts>);
    } catch (error) {
      next(error);
    }
  };

  getDashboardTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = await this.reportingService.getDashboardTasks();

      res.json({
        success: true,
        message: 'Dashboard tasks retrieved successfully',
        data: tasks,
      } as ApiResponse<typeof tasks>);
    } catch (error) {
      next(error);
    }
  };

  // Module-specific Analytics
  getPoultryAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, batchId, metrics } = req.query;

      const analytics = await this.reportingService.getPoultryAnalytics({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        batchId: batchId as string,
        metrics: metrics as string[],
      });

      res.json({
        success: true,
        message: 'Poultry analytics retrieved successfully',
        data: analytics,
      } as ApiResponse<typeof analytics>);
    } catch (error) {
      next(error);
    }
  };

  getLivestockAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { startDate, endDate, animalType, metrics } = req.query;

      const analytics = await this.reportingService.getLivestockAnalytics({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        animalType: animalType as string,
        metrics: metrics as string[],
      });

      res.json({
        success: true,
        message: 'Livestock analytics retrieved successfully',
        data: analytics,
      } as ApiResponse<typeof analytics>);
    } catch (error) {
      next(error);
    }
  };

  getFisheryAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, pondId, metrics } = req.query;

      const analytics = await this.reportingService.getFisheryAnalytics({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        pondId: pondId as string,
        metrics: metrics as string[],
      });

      res.json({
        success: true,
        message: 'Fishery analytics retrieved successfully',
        data: analytics,
      } as ApiResponse<typeof analytics>);
    } catch (error) {
      next(error);
    }
  };

  getInventoryAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { startDate, endDate, category, metrics } = req.query;

      const analytics = await this.reportingService.getInventoryAnalytics({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        category: category as string,
        metrics: metrics as string[],
      });

      res.json({
        success: true,
        message: 'Inventory analytics retrieved successfully',
        data: analytics,
      } as ApiResponse<typeof analytics>);
    } catch (error) {
      next(error);
    }
  };

  getFinanceAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, accountType, metrics } = req.query;

      const analytics = await this.reportingService.getFinanceAnalytics({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        accountType: accountType as string,
        metrics: metrics as string[],
      });

      res.json({
        success: true,
        message: 'Finance analytics retrieved successfully',
        data: analytics,
      } as ApiResponse<typeof analytics>);
    } catch (error) {
      next(error);
    }
  };

  getAssetAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, assetType, metrics } = req.query;

      const analytics = await this.reportingService.getAssetAnalytics({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        assetType: assetType as string,
        metrics: metrics as string[],
      });

      res.json({
        success: true,
        message: 'Asset analytics retrieved successfully',
        data: analytics,
      } as ApiResponse<typeof analytics>);
    } catch (error) {
      next(error);
    }
  };

  getUserAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, department, metrics } = req.query;

      const analytics = await this.reportingService.getUserAnalytics({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        department: department as string,
        metrics: metrics as string[],
      });

      res.json({
        success: true,
        message: 'User analytics retrieved successfully',
        data: analytics,
      } as ApiResponse<typeof analytics>);
    } catch (error) {
      next(error);
    }
  };

  // Comparative Analytics
  getComparisonAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { startDate, endDate, compareWith, modules, metrics } = req.query;

      const analytics = await this.reportingService.getComparisonAnalytics({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        compareWith: compareWith as string,
        modules: modules as string[],
        metrics: metrics as string[],
      });

      res.json({
        success: true,
        message: 'Comparison analytics retrieved successfully',
        data: analytics,
      } as ApiResponse<typeof analytics>);
    } catch (error) {
      next(error);
    }
  };

  getTrendAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, modules, metrics, period } = req.query;

      const analytics = await this.reportingService.getTrendAnalytics({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        modules: modules as string[],
        metrics: metrics as string[],
        period: period as string,
      });

      res.json({
        success: true,
        message: 'Trend analytics retrieved successfully',
        data: analytics,
      } as ApiResponse<typeof analytics>);
    } catch (error) {
      next(error);
    }
  };

  // Export Management
  createExport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exportData = await this.reportingService.createExport({
        ...req.body,
        requestedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Export created successfully',
        data: exportData,
      } as ApiResponse<typeof exportData>);
    } catch (error) {
      next(error);
    }
  };

  getExports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, format, requestedBy, startDate, endDate } = req.query;

      const exports = await this.reportingService.getExports({
        status: status as string,
        format: format as string,
        requestedBy: requestedBy as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        message: 'Exports retrieved successfully',
        data: exports,
      } as ApiResponse<typeof exports>);
    } catch (error) {
      next(error);
    }
  };

  getExportById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const exportData = await this.reportingService.getExportById(id);

      res.json({
        success: true,
        message: 'Export retrieved successfully',
        data: exportData,
      } as ApiResponse<typeof exportData>);
    } catch (error) {
      next(error);
    }
  };

  downloadExport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const downloadResult = await this.reportingService.downloadExport(id);

      res.json({
        success: true,
        message: 'Export download initiated successfully',
        data: downloadResult,
      } as ApiResponse<typeof downloadResult>);
    } catch (error) {
      next(error);
    }
  };

  // Schedule Management
  createSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schedule = await this.reportingService.createSchedule({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Schedule created successfully',
        data: schedule,
      } as ApiResponse<typeof schedule>);
    } catch (error) {
      next(error);
    }
  };

  getSchedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, frequency, createdBy, templateId } = req.query;

      const schedules = await this.reportingService.getSchedules({
        status: status as string,
        frequency: frequency as string,
        createdBy: createdBy as string,
        templateId: templateId as string,
      });

      res.json({
        success: true,
        message: 'Schedules retrieved successfully',
        data: schedules,
      } as ApiResponse<typeof schedules>);
    } catch (error) {
      next(error);
    }
  };

  getScheduleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const schedule = await this.reportingService.getScheduleById(id);

      res.json({
        success: true,
        message: 'Schedule retrieved successfully',
        data: schedule,
      } as ApiResponse<typeof schedule>);
    } catch (error) {
      next(error);
    }
  };

  updateSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const schedule = await this.reportingService.updateSchedule(id, req.body);

      res.json({
        success: true,
        message: 'Schedule updated successfully',
        data: schedule,
      } as ApiResponse<typeof schedule>);
    } catch (error) {
      next(error);
    }
  };

  // Report Templates
  createReportTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const template = await this.reportingService.createReportTemplate({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Report template created successfully',
        data: template,
      } as ApiResponse<typeof template>);
    } catch (error) {
      next(error);
    }
  };

  getReportTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { reportType, isActive, createdBy, search } = req.query;

      const templates = await this.reportingService.getReportTemplates({
        reportType: reportType as any,
        isActive: isActive === 'true',
        createdById: createdBy as string,
      });

      res.json({
        success: true,
        message: 'Report templates retrieved successfully',
        data: templates,
      } as ApiResponse<typeof templates>);
    } catch (error) {
      next(error);
    }
  };

  getReportTemplateById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const template = await this.reportingService.getReportTemplateById(id);

      res.json({
        success: true,
        message: 'Report template retrieved successfully',
        data: template,
      } as ApiResponse<typeof template>);
    } catch (error) {
      next(error);
    }
  };

  updateReportTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const template = await this.reportingService.updateReportTemplate(id, req.body);

      res.json({
        success: true,
        message: 'Report template updated successfully',
        data: template,
      } as ApiResponse<typeof template>);
    } catch (error) {
      next(error);
    }
  };

  // Scheduled Reports
  scheduleReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const scheduleData = req.body;

      const schedule = await this.reportingService.scheduleReport({
        ...scheduleData,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Report scheduled successfully',
        data: schedule,
      } as ApiResponse<typeof schedule>);
    } catch (error) {
      next(error);
    }
  };

  getScheduledReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { isActive, nextRunDate, reportTemplateId } = req.query;

      const schedules = await this.reportingService.getScheduledReports({
        isActive: isActive === 'true',
        nextRunDate: nextRunDate ? new Date(nextRunDate as string) : undefined,
        reportTemplateId: reportTemplateId as string,
      });

      res.json({
        success: true,
        message: 'Scheduled reports retrieved successfully',
        data: schedules,
      } as ApiResponse<typeof schedules>);
    } catch (error) {
      next(error);
    }
  };

  updateScheduledReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const schedule = await this.reportingService.updateScheduledReport(id, req.body);

      res.json({
        success: true,
        message: 'Scheduled report updated successfully',
        data: schedule,
      } as ApiResponse<typeof schedule>);
    } catch (error) {
      next(error);
    }
  };

  exportReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { format, includeCharts, includeFilters } = req.body;

      const exportResult = await this.reportingService.exportReport(id, {
        format,
        includeCharts,
        includeFilters,
        requestedById: req.user!.id,
      });

      res.json({
        success: true,
        message: 'Report export initiated successfully',
        data: exportResult,
      } as ApiResponse<typeof exportResult>);
    } catch (error) {
      next(error);
    }
  };

  getDashboardData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { modules, dateRange, startDate, endDate } = req.query;

      const dashboardData = await this.reportingService.getDashboardData({
        modules: modules as string[],
        dateRange: dateRange as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: dashboardData,
      } as ApiResponse<typeof dashboardData>);
    } catch (error) {
      next(error);
    }
  };

  getRealTimeAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { modules, metrics } = req.query;

      const analytics = await this.reportingService.getRealTimeAnalytics({
        modules: modules as string[],
        metrics: metrics as string[],
      });

      res.json({
        success: true,
        message: 'Real-time analytics retrieved successfully',
        data: analytics,
      } as ApiResponse<typeof analytics>);
    } catch (error) {
      next(error);
    }
  };

  generateCustomAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { dataSource, metrics, dimensions, filters, dateRange } = req.body;

      const analytics = await this.reportingService.generateCustomAnalytics({
        dataSource,
        metrics,
        dimensions,
        filters,
        dateRange,
      });

      res.json({
        success: true,
        message: 'Custom analytics generated successfully',
        data: analytics,
      } as ApiResponse<typeof analytics>);
    } catch (error) {
      next(error);
    }
  };

  generateProductionReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { moduleType, startDate, endDate, groupBy, includeCharts, includeDetails } = req.body;

      const report = await this.reportingService.generateReport({
        reportType: 'production',
        reportName: 'Production Report',
        parameters: {
          moduleType,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          groupBy,
          includeCharts,
          includeDetails,
        },
        requestedById: req.user!.id,
      });

      res.json({
        success: true,
        message: 'Production report generated successfully',
        data: report,
      } as ApiResponse<typeof report>);
    } catch (error) {
      next(error);
    }
  };

  generateFinancialReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { startDate, endDate, groupBy, includeCharts, includeDetails } = req.body;

      const report = await this.reportingService.createFinancialReport({
        startDate,
        endDate,
        groupBy,
        includeCharts,
        includeDetails,
        userId: req.user!.id,
      });

      res.json({
        success: true,
        message: 'Financial report generated successfully',
        data: report,
      } as ApiResponse<typeof report>);
    } catch (error) {
      next(error);
    }
  };

  generateInventoryReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { startDate, endDate, groupBy, includeCharts, includeDetails, filters } = req.body;

      const report = await this.reportingService.generateReport({
        reportType: 'inventory',
        reportName: 'Inventory Report',
        parameters: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          groupBy,
          includeCharts,
          includeDetails,
          filters,
        },
        requestedById: req.user!.id,
      });

      res.json({
        success: true,
        message: 'Inventory report generated successfully',
        data: report,
      } as ApiResponse<typeof report>);
    } catch (error) {
      next(error);
    }
  };

  generateHRReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, groupBy, includeCharts, includeDetails, filters } = req.body;

      const report = await this.reportingService.generateReport({
        reportType: 'hr',
        reportName: 'HR Report',
        parameters: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          groupBy,
          includeCharts,
          includeDetails,
          filters,
        },
        requestedById: req.user!.id,
      });

      res.json({
        success: true,
        message: 'HR report generated successfully',
        data: report,
      } as ApiResponse<typeof report>);
    } catch (error) {
      next(error);
    }
  };

  getComprehensiveAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { startDate, endDate, modules, includeComparisons, includeForecasts } = req.query;

      const analytics = await this.reportingService.getComprehensiveAnalytics({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        modules: modules as string[],
        includeComparisons: includeComparisons === 'true',
        includeForecasts: includeForecasts === 'true',
      });

      res.json({
        success: true,
        message: 'Comprehensive analytics retrieved successfully',
        data: analytics,
      } as ApiResponse<typeof analytics>);
    } catch (error) {
      next(error);
    }
  };
}
