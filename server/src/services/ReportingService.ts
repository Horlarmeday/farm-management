import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import { Repository } from 'typeorm';
import {
  AnimalStatus,
  BirdStatus,
  DeliveryChannel,
  FinanceTransactionType,
  NotificationType,
} from '../../../shared/src/types';
import { AppDataSource } from '../config/database';
import { Animal } from '../entities/Animal';
import { Asset } from '../entities/Asset';
import { BirdBatch } from '../entities/BirdBatch';
import { FinancialTransaction } from '../entities/FinancialTransaction';
import { InventoryItem } from '../entities/InventoryItem';
import { Pond } from '../entities/Pond';
import { Report, ReportStatus } from '../entities/Report';
import { ExportStatus, ReportExport } from '../entities/ReportExport';
import { ReportSchedule, ScheduleStatus } from '../entities/ReportSchedule';
import { ReportTemplate } from '../entities/ReportTemplate';
import { User } from '../entities/User';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { FinanceService } from './FinanceService';
import { InventoryService } from './InventoryService';
import { NotificationService } from './NotificationService';
import { ServiceFactory } from './ServiceFactory';
import { UserService } from './UserService';

export class ReportingService {
  private reportRepository: Repository<Report>;
  private reportTemplateRepository: Repository<ReportTemplate>;
  private reportScheduleRepository: Repository<ReportSchedule>;
  private reportExportRepository: Repository<ReportExport>;
  private birdBatchRepository: Repository<BirdBatch>;
  private animalRepository: Repository<Animal>;
  private pondRepository: Repository<Pond>;
  private assetRepository: Repository<Asset>;
  private inventoryItemRepository: Repository<InventoryItem>;
  private financialTransactionRepository: Repository<FinancialTransaction>;
  private userRepository: Repository<User>;
  private notificationService: NotificationService;
  private inventoryService: InventoryService;
  private financeService: FinanceService;
  private userService: UserService;

  constructor() {
    this.reportRepository = AppDataSource.getRepository(Report);
    this.reportTemplateRepository = AppDataSource.getRepository(ReportTemplate);
    this.reportScheduleRepository = AppDataSource.getRepository(ReportSchedule);
    this.reportExportRepository = AppDataSource.getRepository(ReportExport);
    this.birdBatchRepository = AppDataSource.getRepository(BirdBatch);
    this.animalRepository = AppDataSource.getRepository(Animal);
    this.pondRepository = AppDataSource.getRepository(Pond);
    this.assetRepository = AppDataSource.getRepository(Asset);
    this.inventoryItemRepository = AppDataSource.getRepository(InventoryItem);
    this.financialTransactionRepository = AppDataSource.getRepository(FinancialTransaction);
    this.userRepository = AppDataSource.getRepository(User);

    // Use ServiceFactory for dependency injection
    const serviceFactory = ServiceFactory.getInstance();
    this.notificationService = serviceFactory.getNotificationService();
    this.inventoryService = serviceFactory.getInventoryService();
    this.financeService = serviceFactory.getFinanceService();
    this.userService = serviceFactory.getUserService();
  }

  // Report Generation
  async generateReport(reportData: {
    reportType: 'dashboard' | 'production' | 'financial' | 'inventory' | 'hr' | 'custom';
    reportName: string;
    parameters: {
      startDate?: Date;
      endDate?: Date;
      moduleType?: 'poultry' | 'livestock' | 'fishery' | 'asset' | 'inventory' | 'finance' | 'hr';
      specificIds?: string[];
      groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
      includeCharts?: boolean;
      includeDetails?: boolean;
      filters?: Record<string, any>;
    };
    requestedById: string;
  }): Promise<Report> {
    const report = this.reportRepository.create({
      name: reportData.reportName,
      type: reportData.reportType,
      format: 'pdf' as any,
      status: ReportStatus.GENERATING,
      parameters: reportData.parameters,
      generatedAt: new Date(),
      generatedById: reportData.requestedById,
      createdById: reportData.requestedById,
    });

    const savedReport = await this.reportRepository.save(report);

    try {
      // Generate report data based on type
      let reportContent;
      switch (reportData.reportType) {
        case 'dashboard':
          reportContent = await this.generateDashboardReport(reportData.parameters);
          break;
        case 'production':
          reportContent = await this.generateProductionReport(reportData.parameters);
          break;
        case 'financial':
          reportContent = await this.generateFinancialReport(reportData.parameters);
          break;
        case 'inventory':
          reportContent = await this.generateInventoryReport(reportData.parameters);
          break;
        case 'hr':
          reportContent = await this.generateHRReport(reportData.parameters);
          break;
        case 'custom':
          reportContent = await this.generateCustomReport(reportData.parameters);
          break;
        default:
          throw new BadRequestError('Invalid report type');
      }

      // Update report with generated content
      savedReport.reportContent = JSON.stringify(reportContent);
      savedReport.status = ReportStatus.COMPLETED;
      savedReport.completedAt = new Date();

      await this.reportRepository.save(savedReport);

      // Send completion notification
      await this.notificationService.createNotification({
        title: 'Report Generated',
        message: `Your report "${reportData.reportName}" has been generated successfully`,
        type: NotificationType.REPORT_GENERATED,
        priority: 'medium',
        userId: reportData.requestedById,
        deliveryMethods: [DeliveryChannel.EMAIL, DeliveryChannel.IN_APP],
        referenceType: 'report',
        referenceId: savedReport.id,
        actionRequired: true,
        actionText: 'View Report',
        actionUrl: `/reports/${savedReport.id}`,
        createdById: reportData.requestedById,
      });

      return savedReport;
    } catch (error) {
      savedReport.status = ReportStatus.FAILED;
      savedReport.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.reportRepository.save(savedReport);
      throw error;
    }
  }

  // Dashboard Report
  private async generateDashboardReport(parameters: any): Promise<any> {
    const endDate = parameters.endDate || new Date();
    const startDate =
      parameters.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const farmId = parameters.farmId;

    if (!farmId) {
      throw new Error('Farm ID is required for dashboard report generation');
    }

    const [
      poultryOverview,
      livestockOverview,
      fisheryOverview,
      assetOverview,
      inventoryOverview,
      financeOverview,
      hrOverview,
    ] = await Promise.all([
      this.getPoultryOverview(startDate, endDate),
      this.getLivestockOverview(startDate, endDate),
      this.getFisheryOverview(startDate, endDate),
      this.getAssetOverview(startDate, endDate),
      this.inventoryService.getInventoryValuation(),
      this.financeService.getFinancialOverview(farmId, startDate, endDate),
      this.userService.getUserAnalytics(),
    ]);

    return {
      generatedAt: new Date(),
      period: { startDate, endDate },
      overview: {
        poultry: poultryOverview,
        livestock: livestockOverview,
        fishery: fisheryOverview,
        assets: assetOverview,
        inventory: inventoryOverview,
        finance: financeOverview,
        hr: hrOverview,
      },
      kpis: {
        totalRevenue: financeOverview.totalIncome,
        totalExpenses: financeOverview.totalExpenses,
        netProfit: financeOverview.netProfit,
        profitMargin: financeOverview.profitMargin,
        inventoryValue: inventoryOverview.totalValue,
        activeEmployees: hrOverview.activeUsers,
        criticalAlerts: await this.getCriticalAlertsCount(),
      },
      charts: parameters.includeCharts
        ? await this.generateDashboardCharts(startDate, endDate)
        : null,
    };
  }

  // Production Report
  private async generateProductionReport(parameters: any): Promise<any> {
    const moduleType = parameters.moduleType || 'poultry';
    const endDate = parameters.endDate || new Date();
    const startDate =
      parameters.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (moduleType) {
      case 'poultry':
        return this.generatePoultryProductionReport(startDate, endDate, parameters);
      case 'livestock':
        return this.generateLivestockProductionReport(startDate, endDate, parameters);
      case 'fishery':
        return this.generateFisheryProductionReport(startDate, endDate, parameters);
      case 'asset':
        return this.generateAssetProductionReport(startDate, endDate, parameters);
      default:
        throw new BadRequestError('Invalid module type for production report');
    }
  }

  // Financial Report
  private async generateFinancialReport(parameters: any): Promise<any> {
    const endDate = parameters.endDate || new Date();
    const startDate =
      parameters.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      profitLossData,
      cashFlowData,
      incomeByCategory,
      expensesByCategory,
      monthlyTrend,
      budgetComparison,
      topExpenses,
      topIncomes,
    ] = await Promise.all([
      this.generateProfitLossData(startDate, endDate),
      this.generateCashFlowData(startDate, endDate),
      this.getIncomeByCategory(startDate, endDate),
      this.getExpensesByCategory(startDate, endDate),
      this.getMonthlyFinancialTrend(startDate, endDate),
      this.getBudgetComparison(startDate, endDate),
      this.getTopExpenses(startDate, endDate),
      this.getTopIncomes(startDate, endDate),
    ]);

    return {
      generatedAt: new Date(),
      period: { startDate, endDate },
      profitLoss: profitLossData,
      cashFlow: cashFlowData,
      analysis: {
        incomeByCategory,
        expensesByCategory,
        monthlyTrend,
        budgetComparison,
        topExpenses,
        topIncomes,
      },
      summary: {
        totalRevenue: profitLossData.totalIncome,
        totalExpenses: profitLossData.totalExpenses,
        netProfit: profitLossData.netProfit,
        profitMargin: profitLossData.profitMargin,
        avgDailyRevenue: profitLossData.totalIncome / this.getDaysBetween(startDate, endDate),
        avgDailyExpenses: profitLossData.totalExpenses / this.getDaysBetween(startDate, endDate),
      },
    };
  }

  // Inventory Report
  private async generateInventoryReport(parameters: any): Promise<any> {
    const [
      valuation,
      stockMovement,
      reorderReport,
      expiringItems,
      lowStockItems,
      supplierAnalysis,
    ] = await Promise.all([
      this.inventoryService.getInventoryValuation(),
      this.inventoryService.getStockMovementReport(
        parameters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        parameters.endDate || new Date(),
      ),
      this.inventoryService.generateReorderReport(),
      this.inventoryService.checkExpiringItems(30),
      this.inventoryService.getInventoryItems({ lowStock: true }),
      this.getSupplierAnalysis(),
    ]);

    return {
      generatedAt: new Date(),
      period: {
        startDate: parameters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: parameters.endDate || new Date(),
      },
      valuation,
      stockMovement,
      reorderReport,
      alerts: {
        expiringItems,
        lowStockItems,
        criticalStockCount: lowStockItems.length,
        expiringItemsCount: expiringItems.length,
      },
      supplierAnalysis,
      recommendations: this.generateInventoryRecommendations(
        valuation,
        stockMovement,
        reorderReport,
      ),
    };
  }

  // HR Report
  private async generateHRReport(parameters: any): Promise<any> {
    const endDate = parameters.endDate || new Date();
    const startDate =
      parameters.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [userAnalytics, attendanceData, payrollData, leaveData, performanceData] =
      await Promise.all([
        this.userService.getUserAnalytics(),
        this.getAttendanceAnalytics(startDate, endDate),
        this.getPayrollAnalytics(startDate, endDate),
        this.getLeaveAnalytics(startDate, endDate),
        this.getPerformanceAnalytics(startDate, endDate),
      ]);

    return {
      generatedAt: new Date(),
      period: { startDate, endDate },
      overview: userAnalytics,
      attendance: attendanceData,
      payroll: payrollData,
      leave: leaveData,
      performance: performanceData,
      insights: this.generateHRInsights(userAnalytics, attendanceData, payrollData, leaveData),
    };
  }

  // Custom Report
  private async generateCustomReport(parameters: any): Promise<any> {
    // This would allow users to create custom reports with specific queries
    const customQuery = parameters.customQuery;
    const filters = parameters.filters || {};

    // Basic implementation - can be extended based on requirements
    return {
      generatedAt: new Date(),
      customQuery,
      filters,
      data: await this.executeCustomQuery(customQuery, filters),
    };
  }

  // Report Templates
  async createReportTemplate(templateData: {
    name: string;
    description?: string;
    reportType: string;
    parameters: any;
    schedule?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    isActive?: boolean;
    createdById: string;
  }): Promise<ReportTemplate> {
    const template = this.reportTemplateRepository.create({
      name: templateData.name,
      description: templateData.description,
      reportType: templateData.reportType,
      queryTemplate: JSON.stringify(templateData.parameters),
      defaultParameters: templateData.parameters,
      isActive: templateData.isActive !== false,
      createdById: templateData.createdById,
    });

    return this.reportTemplateRepository.save(template);
  }

  async getReportTemplates(filters?: {
    reportType?: string;
    isActive?: boolean;
    createdById?: string;
  }): Promise<ReportTemplate[]> {
    const query = this.reportTemplateRepository.createQueryBuilder('template');

    if (filters?.reportType) {
      query.andWhere('template.reportType = :reportType', { reportType: filters.reportType });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('template.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.createdById) {
      query.andWhere('template.createdById = :createdById', { createdById: filters.createdById });
    }

    return query.orderBy('template.name', 'ASC').getMany();
  }

  // Report Scheduling
  async scheduleReport(scheduleData: {
    templateId: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    nextRun: Date;
    recipients: string[];
    isActive?: boolean;
    createdById: string;
  }): Promise<ReportSchedule> {
    const schedule = this.reportScheduleRepository.create({
      name: `Scheduled Report - ${new Date().toISOString()}`,
      frequency: scheduleData.frequency as any,
      cronExpression: this.generateCronExpression(scheduleData.frequency),
      nextRunTime: scheduleData.nextRun,
      status: ScheduleStatus.ACTIVE,
      parameters: {},
      recipients: scheduleData.recipients,
      format: 'PDF' as any,
      templateId: scheduleData.templateId,
      createdById: scheduleData.createdById,
    });

    return this.reportScheduleRepository.save(schedule);
  }

  async processScheduledReports(): Promise<void> {
    const dueSchedules = await this.reportScheduleRepository.find({
      where: {
        status: ScheduleStatus.ACTIVE,
        nextRunTime: { $lte: new Date() } as any,
      },
      relations: ['template'],
    });

    for (const schedule of dueSchedules) {
      try {
        // Generate report
        const report = await this.generateReport({
          reportType: schedule.template.reportType as any,
          reportName: `${schedule.template.name} - ${new Date().toDateString()}`,
          parameters: schedule.template.defaultParameters || {},
          requestedById: schedule.createdById,
        });

        // Send to recipients
        if (schedule.recipients) {
          for (const recipientId of schedule.recipients) {
            await this.notificationService.createNotification({
              title: 'Scheduled Report Ready',
              message: `Your scheduled report "${schedule.template.name}" is ready`,
              type: NotificationType.REPORT_GENERATED,
              priority: 'medium',
              userId: recipientId,
              deliveryMethods: [DeliveryChannel.EMAIL, DeliveryChannel.IN_APP],
              referenceType: 'report',
              referenceId: report.id,
              actionRequired: true,
              actionText: 'View Report',
              actionUrl: `/reports/${report.id}`,
              createdById: schedule.createdById,
            });
          }
        }

        // Update next run time
        schedule.nextRunTime = this.calculateNextRun(schedule.frequency, schedule.nextRunTime);
        schedule.lastRunTime = new Date();
        await this.reportScheduleRepository.save(schedule);
      } catch (error) {
        console.error(`Error processing scheduled report ${schedule.id}:`, error);
      }
    }
  }

  // Report Export
  async exportReportToPDF(reportId: string, requestedById: string): Promise<ReportExport> {
    const report = await this.reportRepository.findOneBy({ id: reportId });
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    const exportFileName = `${report.name}_${new Date().toISOString().split('T')[0]}.pdf`;
    const exportPath = path.join(process.cwd(), 'exports', exportFileName);

    // Generate PDF
    await this.generatePDFReport(report, exportPath);

    const reportExport = this.reportExportRepository.create({
      format: 'pdf' as any,
      status: ExportStatus.COMPLETED,
      filePath: exportPath,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      reportId,
      requestedById,
    });

    return this.reportExportRepository.save(reportExport);
  }

  async exportReportToExcel(reportId: string, requestedById: string): Promise<ReportExport> {
    const report = await this.reportRepository.findOneBy({ id: reportId });
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    const exportFileName = `${report.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
    const exportPath = path.join(process.cwd(), 'exports', exportFileName);

    // Generate Excel
    await this.generateExcelReport(report, exportPath);

    const reportExport = this.reportExportRepository.create({
      format: 'excel' as any,
      status: ExportStatus.COMPLETED,
      filePath: exportPath,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      reportId,
      requestedById,
    });

    return this.reportExportRepository.save(reportExport);
  }

  // Helper Methods
  private async getPoultryOverview(startDate: Date, endDate: Date): Promise<any> {
    const batches = await this.birdBatchRepository.find();
    const activeBatches = batches.filter((b) => b.status === 'active');

    return {
      totalBatches: batches.length,
      activeBatches: activeBatches.length,
      totalBirds: activeBatches.reduce((sum, b) => sum + (b.currentQuantity || 0), 0),
      // Add more poultry metrics
    };
  }

  private async getLivestockOverview(startDate: Date, endDate: Date): Promise<any> {
    const animals = await this.animalRepository.find();
    const activeAnimals = animals.filter((a) => a.status === 'alive');

    return {
      totalAnimals: animals.length,
      activeAnimals: activeAnimals.length,
      // Add more livestock metrics
    };
  }

  private async getFisheryOverview(startDate: Date, endDate: Date): Promise<any> {
    const ponds = await this.pondRepository.find();
    const activePonds = ponds.filter((p) => p.status === 'active');

    return {
      totalPonds: ponds.length,
      activePonds: activePonds.length,
      // Add more fishery metrics
    };
  }

  private async getAssetOverview(startDate: Date, endDate: Date): Promise<any> {
    const assets = await this.assetRepository.find();
    const activeAssets = assets.filter((a) => a.status === 'active');

    return {
      totalAssets: assets.length,
      activeAssets: activeAssets.length,
      totalValue: assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0),
      // Add more asset metrics
    };
  }

  private async getCriticalAlertsCount(): Promise<number> {
    // This would get count from alerts table
    return 0; // Placeholder
  }

  private async generateDashboardCharts(startDate: Date, endDate: Date): Promise<any> {
    // Generate chart data for dashboard
    return {
      revenueChart: await this.getRevenueChartData(startDate, endDate),
      expenseChart: await this.getExpenseChartData(startDate, endDate),
      productionChart: await this.getProductionChartData(startDate, endDate),
    };
  }

  private async generatePDFReport(report: Report, filePath: string): Promise<void> {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text(report.name, { align: 'center' });
    doc.fontSize(12).text(`Generated on: ${new Date().toDateString()}`);
    doc.text(`Report Type: ${report.type}`);

    // Add report content
    if (report.reportContent) {
      doc.text(JSON.stringify(JSON.parse(report.reportContent), null, 2));
    }

    doc.end();
  }

  private async generateExcelReport(report: Report, filePath: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    // Add headers
    worksheet.addRow(['Report Name', report.name]);
    worksheet.addRow(['Generated On', new Date().toDateString()]);
    worksheet.addRow(['Report Type', report.type]);
    worksheet.addRow([]);

    // Add data (simplified)
    if (report.reportContent) {
      const data = JSON.parse(report.reportContent);
      if (data && typeof data === 'object') {
        Object.entries(data).forEach(([key, value]) => {
          worksheet.addRow([key, JSON.stringify(value)]);
        });
      }
    }

    await workbook.xlsx.writeFile(filePath);
  }

  private calculateNextRun(frequency: string, lastRun: Date): Date {
    const nextRun = new Date(lastRun);

    switch (frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
      case 'quarterly':
        nextRun.setMonth(nextRun.getMonth() + 3);
        break;
      case 'yearly':
        nextRun.setFullYear(nextRun.getFullYear() + 1);
        break;
    }

    return nextRun;
  }

  private generateCronExpression(frequency: string): string {
    switch (frequency) {
      case 'daily':
        return '0 0 * * *';
      case 'weekly':
        return '0 0 * * 0';
      case 'monthly':
        return '0 0 1 * *';
      case 'quarterly':
        return '0 0 1 */3 *';
      case 'yearly':
        return '0 0 1 1 *';
      default:
        return '0 0 * * *';
    }
  }

  private getDaysBetween(startDate: Date, endDate: Date): number {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  // Placeholder methods for analytics functions
  private async generatePoultryProductionReport(
    startDate: Date,
    endDate: Date,
    parameters: any,
  ): Promise<any> {
    return { type: 'poultry', startDate, endDate, parameters };
  }

  private async generateLivestockProductionReport(
    startDate: Date,
    endDate: Date,
    parameters: any,
  ): Promise<any> {
    return { type: 'livestock', startDate, endDate, parameters };
  }

  private async generateFisheryProductionReport(
    startDate: Date,
    endDate: Date,
    parameters: any,
  ): Promise<any> {
    return { type: 'fishery', startDate, endDate, parameters };
  }

  private async generateAssetProductionReport(
    startDate: Date,
    endDate: Date,
    parameters: any,
  ): Promise<any> {
    return { type: 'asset', startDate, endDate, parameters };
  }

  private async generateProfitLossData(startDate: Date, endDate: Date): Promise<any> {
    return { totalIncome: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0 };
  }

  private async generateCashFlowData(startDate: Date, endDate: Date): Promise<any> {
    return { openingBalance: 0, closingBalance: 0, cashInflow: 0, cashOutflow: 0 };
  }

  private async getIncomeByCategory(startDate: Date, endDate: Date): Promise<any> {
    return {};
  }

  private async getExpensesByCategory(startDate: Date, endDate: Date): Promise<any> {
    return {};
  }

  private async getMonthlyFinancialTrend(startDate: Date, endDate: Date): Promise<any> {
    return [];
  }

  private async getBudgetComparison(startDate: Date, endDate: Date): Promise<any> {
    return {};
  }

  private async getTopExpenses(startDate: Date, endDate: Date): Promise<any> {
    return [];
  }

  private async getTopIncomes(startDate: Date, endDate: Date): Promise<any> {
    return [];
  }

  private async getSupplierAnalysis(): Promise<any> {
    return {};
  }

  private generateInventoryRecommendations(
    valuation: any,
    stockMovement: any,
    reorderReport: any,
  ): string[] {
    const recommendations = [];

    if (valuation.lowStockItems > 0) {
      recommendations.push(
        `You have ${valuation.lowStockItems} items with low stock levels. Consider reordering.`,
      );
    }

    if (valuation.expiringItems > 0) {
      recommendations.push(
        `${valuation.expiringItems} items are expiring soon. Plan usage or disposal.`,
      );
    }

    return recommendations;
  }

  private async getAttendanceAnalytics(startDate: Date, endDate: Date): Promise<any> {
    return {};
  }

  private async getPayrollAnalytics(startDate: Date, endDate: Date): Promise<any> {
    return {};
  }

  private async getLeaveAnalytics(startDate: Date, endDate: Date): Promise<any> {
    return {};
  }

  private async getPerformanceAnalytics(startDate: Date, endDate: Date): Promise<any> {
    return {};
  }

  private generateHRInsights(
    userAnalytics: any,
    attendanceData: any,
    payrollData: any,
    leaveData: any,
  ): string[] {
    return [];
  }

  private async executeCustomQuery(query: string, filters: any): Promise<any> {
    // Placeholder for custom query execution
    return {};
  }

  private async getRevenueChartData(startDate: Date, endDate: Date): Promise<any> {
    return {};
  }

  private async getExpenseChartData(startDate: Date, endDate: Date): Promise<any> {
    return {};
  }

  private async getProductionChartData(startDate: Date, endDate: Date): Promise<any> {
    return {};
  }

  // Public methods for getting reports
  async getReports(filters?: {
    reportType?: string;
    status?: string;
    requestedById?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Report[]> {
    const query = this.reportRepository.createQueryBuilder('report');

    if (filters?.reportType) {
      query.andWhere('report.type = :reportType', { reportType: filters.reportType });
    }

    if (filters?.status) {
      query.andWhere('report.status = :status', { status: filters.status });
    }

    if (filters?.requestedById) {
      query.andWhere('report.generatedById = :requestedById', {
        requestedById: filters.requestedById,
      });
    }

    if (filters?.startDate) {
      query.andWhere('report.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('report.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return query.orderBy('report.createdAt', 'DESC').getMany();
  }

  async getReportById(id: string): Promise<Report> {
    const report = await this.reportRepository.findOneBy({ id });

    if (!report) {
      throw new NotFoundError('Report not found');
    }

    return report;
  }

  async deleteReport(id: string): Promise<void> {
    const report = await this.getReportById(id);
    await this.reportRepository.remove(report);
  }

  // Additional methods needed by ReportingController
  async getDashboardOverview(params: any): Promise<any> {
    return this.generateDashboardReport(params);
  }

  async getDashboardKPIs(params: any): Promise<any> {
    const overview = await this.generateDashboardReport(params);
    return overview.kpis;
  }

  async getDashboardCharts(params: any): Promise<any> {
    const endDate = params.endDate || new Date();
    const startDate = params.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    return this.generateDashboardCharts(startDate, endDate);
  }

  async getPoultryAnalytics(params: any): Promise<any> {
    return this.generatePoultryProductionReport(
      params.startDate || new Date(),
      params.endDate || new Date(),
      params,
    );
  }

  async getLivestockAnalytics(params: any): Promise<any> {
    return this.generateLivestockProductionReport(
      params.startDate || new Date(),
      params.endDate || new Date(),
      params,
    );
  }

  async getFisheryAnalytics(params: any): Promise<any> {
    return this.generateFisheryProductionReport(
      params.startDate || new Date(),
      params.endDate || new Date(),
      params,
    );
  }

  async getInventoryAnalytics(params: any): Promise<any> {
    return this.inventoryService.getInventoryValuation();
  }

  async getFinanceAnalytics(params: any): Promise<any> {
    const endDate = params.endDate || new Date();
    const startDate = params.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    return this.financeService.getFinancialOverview(startDate, endDate);
  }

  async getAssetAnalytics(params: any): Promise<any> {
    const endDate = params.endDate || new Date();
    const startDate = params.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    return this.getAssetOverview(startDate, endDate);
  }

  async getUserAnalytics(params: any): Promise<any> {
    return this.userService.getUserAnalytics();
  }

  async getComparisonAnalytics(params: any): Promise<any> {
    return { message: 'Comparison analytics not implemented yet' };
  }

  async getTrendAnalytics(params: any): Promise<any> {
    return { message: 'Trend analytics not implemented yet' };
  }

  async createExport(params: any): Promise<any> {
    const { reportId, format } = params;
    if (format === 'pdf') {
      return this.exportReportToPDF(reportId, params.requestedById);
    } else {
      return this.exportReportToExcel(reportId, params.requestedById);
    }
  }

  async getExports(params: any): Promise<any> {
    return this.reportExportRepository.find({
      where: { requestedById: params.requestedBy },
    });
  }

  async getExportById(id: string): Promise<any> {
    const exportData = await this.reportExportRepository.findOneBy({ id });
    if (!exportData) {
      throw new NotFoundError('Export not found');
    }
    return exportData;
  }

  async downloadExport(id: string): Promise<any> {
    const exportData = await this.getExportById(id);
    return { downloadUrl: exportData.downloadUrl };
  }

  async createSchedule(params: any): Promise<any> {
    return this.scheduleReport(params);
  }

  async getSchedules(params: any): Promise<any> {
    return this.reportScheduleRepository.find({
      where: { createdById: params.createdBy },
    });
  }

  async getScheduleById(id: string): Promise<any> {
    const schedule = await this.reportScheduleRepository.findOneBy({ id });
    if (!schedule) {
      throw new NotFoundError('Schedule not found');
    }
    return schedule;
  }

  async updateSchedule(id: string, params: any): Promise<any> {
    const schedule = await this.getScheduleById(id);
    Object.assign(schedule, params);
    return this.reportScheduleRepository.save(schedule);
  }

  async getReportTemplateById(id: string): Promise<any> {
    const template = await this.reportTemplateRepository.findOneBy({ id });
    if (!template) {
      throw new NotFoundError('Report template not found');
    }
    return template;
  }

  async updateReportTemplate(id: string, params: any): Promise<any> {
    const template = await this.getReportTemplateById(id);
    Object.assign(template, params);
    return this.reportTemplateRepository.save(template);
  }

  async getScheduledReports(params: any): Promise<any> {
    return this.reportScheduleRepository.find({
      where: { createdById: params.createdBy },
    });
  }

  async updateScheduledReport(id: string, params: any): Promise<any> {
    return this.updateSchedule(id, params);
  }

  async exportReport(id: string, params: any): Promise<any> {
    const { format } = params;
    if (format === 'pdf') {
      return this.exportReportToPDF(id, params.requestedById);
    } else {
      return this.exportReportToExcel(id, params.requestedById);
    }
  }

  async getDashboardData(params: any): Promise<any> {
    return this.generateDashboardReport(params);
  }

  async getDashboardModules(params: any): Promise<any> {
    const modules = [
      {
        id: 'poultry',
        name: 'Poultry Management',
        status: 'active',
        totalBatches: await this.birdBatchRepository.count(),
        activeBatches: await this.birdBatchRepository.count({
          where: { status: BirdStatus.ACTIVE },
        }),
        totalBirds: await this.birdBatchRepository
          .createQueryBuilder('batch')
          .select('SUM(batch.currentQuantity)', 'total')
          .getRawOne()
          .then((result) => parseInt(result.total) || 0),
      },
      {
        id: 'livestock',
        name: 'Livestock Management',
        status: 'active',
        totalAnimals: await this.animalRepository.count(),
        activeAnimals: await this.animalRepository.count({
          where: { status: AnimalStatus.ACTIVE },
        }),
      },
      {
        id: 'fishery',
        name: 'Fishery Management',
        status: 'active',
        totalPonds: await this.pondRepository.count(),
        activePonds: await this.pondRepository.count(),
      },
      {
        id: 'inventory',
        name: 'Inventory Management',
        status: 'active',
        totalItems: await this.inventoryItemRepository.count(),
        lowStockItems: 0, // Simplified for now
      },
    ];
    return modules;
  }

  async getRevenueTrend(params: any): Promise<any> {
    const { startDate, endDate } = params;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const revenueData = await this.financialTransactionRepository
      .createQueryBuilder('transaction')
      .select('DATE(transaction.transactionDate)', 'date')
      .addSelect(
        "SUM(CASE WHEN transaction.type = 'INCOME' THEN transaction.amount ELSE 0 END)",
        'revenue',
      )
      .where('transaction.transactionDate BETWEEN :start AND :end', { start, end })
      .groupBy('DATE(transaction.transactionDate)')
      .orderBy('DATE(transaction.transactionDate)', 'ASC')
      .getRawMany();

    return revenueData.map((item) => ({
      date: item.date,
      revenue: parseFloat(item.revenue) || 0,
    }));
  }

  async getProductionDistribution(params: any): Promise<any> {
    const poultryCount = await this.birdBatchRepository.count();
    const livestockCount = await this.animalRepository.count();
    const fisheryCount = await this.pondRepository.count();

    const total = poultryCount + livestockCount + fisheryCount;

    return [
      {
        module: 'Poultry',
        count: poultryCount,
        percentage: total > 0 ? Math.round((poultryCount / total) * 100) : 0,
      },
      {
        module: 'Livestock',
        count: livestockCount,
        percentage: total > 0 ? Math.round((livestockCount / total) * 100) : 0,
      },
      {
        module: 'Fishery',
        count: fisheryCount,
        percentage: total > 0 ? Math.round((fisheryCount / total) * 100) : 0,
      },
    ];
  }

  async getQuickStats(params: any): Promise<any> {
    const totalRevenue = await this.financialTransactionRepository
      .createQueryBuilder('transaction')
      .select(
        "SUM(CASE WHEN transaction.type = 'INCOME' THEN transaction.amount ELSE 0 END)",
        'total',
      )
      .getRawOne()
      .then((result) => parseFloat(result.total) || 0);

    const totalExpenses = await this.financialTransactionRepository
      .createQueryBuilder('transaction')
      .select(
        "SUM(CASE WHEN transaction.type = 'EXPENSE' THEN transaction.amount ELSE 0 END)",
        'total',
      )
      .getRawOne()
      .then((result) => parseFloat(result.total) || 0);

    const totalAssets = await this.assetRepository.count();
    const activeUsers = await this.userRepository.count();

    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      totalAssets,
      activeUsers,
    };
  }

  async getRecentActivities(params: any): Promise<any> {
    const recentTransactions = await this.financialTransactionRepository.find({
      order: { createdAt: 'DESC' },
      take: 10,
      relations: ['user'],
    });

    return recentTransactions.map((transaction) => ({
      id: transaction.id,
      type: 'financial',
      description: `${transaction.type === FinanceTransactionType.INCOME ? 'Income' : 'Expense'}: ${transaction.description}`,
      amount: transaction.amount,
      date: transaction.transactionDate,
      user: transaction.user?.firstName + ' ' + transaction.user?.lastName,
    }));
  }

  async getRealTimeAnalytics(params: any): Promise<any> {
    return { message: 'Real-time analytics not implemented yet' };
  }

  async generateCustomAnalytics(params: any): Promise<any> {
    return this.executeCustomQuery(params.dataSource, params.filters);
  }

  async getComprehensiveAnalytics(params: any): Promise<any> {
    return { message: 'Comprehensive analytics not implemented yet' };
  }

  async updateReport(id: string, params: any): Promise<any> {
    const report = await this.getReportById(id);
    Object.assign(report, params);
    return this.reportRepository.save(report);
  }

  async downloadReport(id: string, format: string): Promise<any> {
    if (format === 'pdf') {
      return this.exportReportToPDF(id, 'system');
    } else {
      return this.exportReportToExcel(id, 'system');
    }
  }

  async getDashboardAlerts(limit?: number): Promise<any> {
    // Get critical alerts for dashboard
    const alertLimit = limit || 10;

    const alerts = [];

    // Check for low inventory items
    const lowInventoryItems = await this.inventoryItemRepository
      .createQueryBuilder('item')
      .where('item.currentStock <= item.reorderPoint')
      .limit(alertLimit)
      .getMany();

    lowInventoryItems.forEach((item) => {
      alerts.push({
        id: `inventory-${item.id}`,
        type: 'warning',
        title: 'Low Inventory Alert',
        message: `${item.name} is running low (${item.currentStock} remaining)`,
        timestamp: new Date(),
        module: 'inventory',
      });
    });

    // Check for overdue tasks (placeholder)
    const overdueTasks = 5; // This would come from a task management system
    if (overdueTasks > 0) {
      alerts.push({
        id: 'tasks-overdue',
        type: 'error',
        title: 'Overdue Tasks',
        message: `You have ${overdueTasks} overdue tasks`,
        timestamp: new Date(),
        module: 'tasks',
      });
    }

    return alerts.slice(0, alertLimit);
  }

  async getDashboardTasks(): Promise<any[]> {
    // Get pending tasks for dashboard
    const tasks: any[] = [];

    // Check for birds/animals needing attention
    const birdBatches = await this.birdBatchRepository
      .createQueryBuilder('batch')
      .where('batch.status = :status', { status: BirdStatus.ACTIVE })
      .limit(5)
      .getMany();

    birdBatches.forEach((batch) => {
      tasks.push({
        id: `bird-check-${batch.id}`,
        title: 'Daily Bird Check',
        description: `Check batch ${batch.batchCode} health and feeding`,
        priority: 'medium',
        dueDate: new Date(),
        module: 'poultry',
        status: 'pending',
      });
    });

    // Check for financial transactions needing review
    const pendingTransactions = await this.financialTransactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.status = :status', { status: 'pending' })
      .limit(3)
      .getMany();

    pendingTransactions.forEach((transaction) => {
      tasks.push({
        id: `transaction-review-${transaction.id}`,
        title: 'Review Transaction',
        description: `Review ${transaction.type} transaction of $${transaction.amount}`,
        priority: 'high',
        dueDate: new Date(),
        module: 'finance',
        status: 'pending',
      });
    });

    return tasks;
  }

  async createFinancialReport(params: any): Promise<Report> {
    const { startDate, endDate, includeCharts = true } = params;

    const reportData = {
      reportType: 'financial' as const,
      reportName: 'Financial Report',
      parameters: {
        startDate: startDate
          ? new Date(startDate)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate) : new Date(),
        includeCharts,
        includeDetails: true,
      },
      requestedById: params.userId || 'system',
    };

    return this.generateReport(reportData);
  }
}
