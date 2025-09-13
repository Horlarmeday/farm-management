import { Request, Response } from 'express';
import { ReportsService, PLReportFilters } from '../services/reports.service';
import { validationResult } from 'express-validator';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class ReportsController {
  private reportsService: ReportsService;

  constructor() {
    this.reportsService = new ReportsService();
  }

  /**
   * Get P&L calculation for a specific date range
   * GET /api/reports/profit-loss
   */
  async getProfitLoss(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { startDate, endDate, categoryIds, includeSubcategories, groupBy } = req.query;
      const farmId = (req as any).user?.farmId;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
        return;
      }

      const filters: PLReportFilters = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        categoryIds: categoryIds ? (categoryIds as string).split(',') : undefined,
        includeSubcategories: includeSubcategories === 'true',
        groupBy: groupBy as 'month' | 'quarter' | 'year' | undefined,
      };

      const profitLoss = await this.reportsService.calculateProfitLoss(farmId, filters);

      res.json({
        success: true,
        data: profitLoss,
      });
    } catch (error) {
      console.error('Error getting P&L report:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate P&L report',
      });
    }
  }

  /**
   * Get monthly P&L summary for a specific year
   * GET /api/reports/monthly-summary/:year
   */
  async getMonthlyPLSummary(req: Request, res: Response): Promise<void> {
    try {
      const { year } = req.params;
      const farmId = (req as any).user?.farmId;

      if (!year || isNaN(Number(year))) {
        res.status(400).json({
          success: false,
          message: 'Valid year is required',
        });
        return;
      }

      const monthlySummary = await this.reportsService.getMonthlyPLSummary(
        farmId,
        Number(year)
      );

      res.json({
        success: true,
        data: monthlySummary,
      });
    } catch (error) {
      console.error('Error getting monthly P&L summary:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get monthly P&L summary',
      });
    }
  }

  /**
   * Get quarterly P&L summary for a specific year
   * GET /api/reports/quarterly-summary/:year
   */
  async getQuarterlyPLSummary(req: Request, res: Response): Promise<void> {
    try {
      const { year } = req.params;
      const farmId = (req as any).user?.farmId;

      if (!year || isNaN(Number(year))) {
        res.status(400).json({
          success: false,
          message: 'Valid year is required',
        });
        return;
      }

      const quarterlySummary = await this.reportsService.getQuarterlyPLSummary(
        farmId,
        Number(year)
      );

      res.json({
        success: true,
        data: quarterlySummary,
      });
    } catch (error) {
      console.error('Error getting quarterly P&L summary:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get quarterly P&L summary',
      });
    }
  }

  /**
   * Get detailed category breakdown for P&L
   * GET /api/reports/category-breakdown
   */
  async getCategoryBreakdown(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { startDate, endDate, categoryIds } = req.query;
      const farmId = (req as any).user?.farmId;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
        return;
      }

      const filters: PLReportFilters = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        categoryIds: categoryIds ? (categoryIds as string).split(',') : undefined,
      };

      const categoryBreakdown = await this.reportsService.getCategoryBreakdown(farmId, filters);

      res.json({
        success: true,
        data: categoryBreakdown,
      });
    } catch (error) {
      console.error('Error getting category breakdown:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get category breakdown',
      });
    }
  }

  /**
   * Export P&L report in different formats
   * GET /api/reports/export
   */
  async exportPLReport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, format = 'json', categoryIds } = req.query;
      const farmId = (req as any).user?.farmId;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
        return;
      }

      const filters: PLReportFilters = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        categoryIds: categoryIds ? (categoryIds as string).split(',') : undefined,
      };

      const exportData = await this.reportsService.exportPLReport(
        farmId,
        filters,
        format as 'json' | 'csv'
      );

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="pl-report-${startDate}-${endDate}.csv"`
        );
        res.send(exportData);
      } else {
        res.json({
          success: true,
          data: exportData,
        });
      }
    } catch (error) {
      console.error('Error exporting P&L report:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to export P&L report',
      });
    }
  }

  /**
   * Compare P&L between two periods
   * GET /api/reports/compare-periods
   */
  async comparePLPeriods(req: Request, res: Response): Promise<void> {
    try {
      const {
        currentStartDate,
        currentEndDate,
        previousStartDate,
        previousEndDate,
      } = req.query;
      const farmId = (req as any).user?.farmId;

      if (!currentStartDate || !currentEndDate || !previousStartDate || !previousEndDate) {
        res.status(400).json({
          success: false,
          message: 'All date parameters are required for comparison',
        });
        return;
      }

      const comparison = await this.reportsService.comparePLPeriods(
        farmId,
        {
          startDate: new Date(currentStartDate as string),
          endDate: new Date(currentEndDate as string),
        },
        {
          startDate: new Date(previousStartDate as string),
          endDate: new Date(previousEndDate as string),
        }
      );

      res.json({
        success: true,
        data: comparison,
      });
    } catch (error) {
      console.error('Error comparing P&L periods:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to compare P&L periods',
      });
    }
  }

  /**
   * Get performance metrics for dashboard
   * GET /api/reports/performance-metrics
   */
  async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'month' } = req.query;
      const farmId = (req as any).user?.farmId;

      if (!['month', 'quarter', 'year'].includes(period as string)) {
        res.status(400).json({
          success: false,
          message: 'Period must be one of: month, quarter, year',
        });
        return;
      }

      const metrics = await this.reportsService.getPerformanceMetrics(
        farmId,
        period as 'month' | 'quarter' | 'year'
      );

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get performance metrics',
      });
    }
  }

  /**
   * Get P&L trends over time
   * GET /api/reports/trends
   */
  async getPLTrends(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'month', periods = '12' } = req.query;
      const farmId = (req as any).user?.farmId;

      if (!['month', 'quarter', 'year'].includes(period as string)) {
        res.status(400).json({
          success: false,
          message: 'Period must be one of: month, quarter, year',
        });
        return;
      }

      const periodsCount = parseInt(periods as string) || 12;
      if (periodsCount < 1 || periodsCount > 60) {
        res.status(400).json({
          success: false,
          message: 'Periods count must be between 1 and 60',
        });
        return;
      }

      const now = new Date();
      const trends = [];

      for (let i = periodsCount - 1; i >= 0; i--) {
        let startDate: Date, endDate: Date;

        if (period === 'month') {
          startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        } else if (period === 'quarter') {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const targetQuarter = currentQuarter - i;
          const year = now.getFullYear() + Math.floor(targetQuarter / 4);
          const quarter = ((targetQuarter % 4) + 4) % 4;
          startDate = new Date(year, quarter * 3, 1);
          endDate = new Date(year, (quarter + 1) * 3, 0, 23, 59, 59);
        } else {
          // year
          startDate = new Date(now.getFullYear() - i, 0, 1);
          endDate = new Date(now.getFullYear() - i, 11, 31, 23, 59, 59);
        }

        const plData = await this.reportsService.calculateProfitLoss(farmId, {
          startDate,
          endDate,
        });

        trends.push({
          period: startDate.toISOString().slice(0, 7), // YYYY-MM format
          totalIncome: plData.totalIncome,
          totalExpenses: plData.totalExpenses,
          netProfitLoss: plData.netProfitLoss,
          profitMargin: plData.profitMargin,
        });
      }

      res.json({
        success: true,
        data: trends,
      });
    } catch (error) {
      console.error('Error getting P&L trends:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get P&L trends',
      });
    }
  }
}

// Create and export controller instance
export const reportsController = new ReportsController();