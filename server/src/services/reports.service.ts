import { Repository, Between } from 'typeorm';
import { AppDataSource } from '../config/database';
import { FinancialTransaction } from '../entities/FinancialTransaction';
import { FinancialCategory } from '../entities/FinancialCategory';
import { FinanceTransactionType } from '@kuyash/shared';
import { NotFoundError } from '../utils/errors';

export interface ProfitLossCalculation {
  totalIncome: number;
  totalExpenses: number;
  netProfitLoss: number;
  profitMargin: number;
  incomeByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
  period: {
    startDate: Date;
    endDate: Date;
  };
  transactionCount: {
    income: number;
    expenses: number;
    total: number;
  };
}

export interface MonthlyPLSummary {
  month: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netProfitLoss: number;
  profitMargin: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  type: 'income' | 'expense';
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface PLReportFilters {
  startDate: Date;
  endDate: Date;
  categoryIds?: string[];
  includeSubcategories?: boolean;
  groupBy?: 'month' | 'quarter' | 'year';
}

export class ReportsService {
  private financialTransactionRepository: Repository<FinancialTransaction>;
  private financialCategoryRepository: Repository<FinancialCategory>;

  constructor() {
    this.financialTransactionRepository = AppDataSource.getRepository(FinancialTransaction);
    this.financialCategoryRepository = AppDataSource.getRepository(FinancialCategory);
  }

  /**
   * Calculate P&L for a specific farm and date range
   */
  async calculateProfitLoss(
    farmId: string,
    filters: PLReportFilters
  ): Promise<ProfitLossCalculation> {
    try {
      // Validate date range
      if (filters.startDate >= filters.endDate) {
        throw new Error('Start date must be before end date');
      }

      // Get all transactions for the farm within the date range
      const queryBuilder = this.financialTransactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.category', 'category')
        .where('transaction.farmId = :farmId', { farmId })
        .andWhere('transaction.transactionDate BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });

      // Apply category filters if provided
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        queryBuilder.andWhere('transaction.category_id IN (:...categoryIds)', {
          categoryIds: filters.categoryIds,
        });
      }

      const transactions = await queryBuilder.getMany();

      // Separate income and expense transactions
      const incomeTransactions = transactions.filter(
        (t) => t.type === FinanceTransactionType.INCOME
      );
      const expenseTransactions = transactions.filter(
        (t) => t.type === FinanceTransactionType.EXPENSE
      );

      // Calculate totals
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const netProfitLoss = totalIncome - totalExpenses;
      const profitMargin = totalIncome > 0 ? (netProfitLoss / totalIncome) * 100 : 0;

      // Group by categories
      const incomeByCategory = this.groupTransactionsByCategory(incomeTransactions);
      const expensesByCategory = this.groupTransactionsByCategory(expenseTransactions);

      return {
        totalIncome,
        totalExpenses,
        netProfitLoss,
        profitMargin: Math.round(profitMargin * 100) / 100, // Round to 2 decimal places
        incomeByCategory,
        expensesByCategory,
        period: {
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
        transactionCount: {
          income: incomeTransactions.length,
          expenses: expenseTransactions.length,
          total: transactions.length,
        },
      };
    } catch (error) {
      console.error('Error calculating P&L:', error);
      throw new Error(`Failed to calculate P&L: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get monthly P&L summary for a year
   */
  async getMonthlyPLSummary(
    farmId: string,
    year: number
  ): Promise<MonthlyPLSummary[]> {
    try {
      const startDate = new Date(year, 0, 1); // January 1st
      const endDate = new Date(year, 11, 31, 23, 59, 59); // December 31st

      const transactions = await this.financialTransactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.category', 'category')
        .where('transaction.farmId = :farmId', { farmId })
        .andWhere('transaction.transactionDate BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .getMany();

      const monthlyData: MonthlyPLSummary[] = [];

      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

        const monthTransactions = transactions.filter(
          (t) => t.transactionDate >= monthStart && t.transactionDate <= monthEnd
        );

        const monthIncome = monthTransactions
          .filter((t) => t.type === FinanceTransactionType.INCOME)
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const monthExpenses = monthTransactions
          .filter((t) => t.type === FinanceTransactionType.EXPENSE)
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const monthNetPL = monthIncome - monthExpenses;
        const monthProfitMargin = monthIncome > 0 ? (monthNetPL / monthIncome) * 100 : 0;

        monthlyData.push({
          month: monthStart.toLocaleString('default', { month: 'long' }),
          year,
          totalIncome: monthIncome,
          totalExpenses: monthExpenses,
          netProfitLoss: monthNetPL,
          profitMargin: Math.round(monthProfitMargin * 100) / 100,
        });
      }

      return monthlyData;
    } catch (error) {
      console.error('Error getting monthly P&L summary:', error);
      throw new Error(`Failed to get monthly P&L summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get quarterly P&L summary for a year
   */
  async getQuarterlyPLSummary(
    farmId: string,
    year: number
  ): Promise<MonthlyPLSummary[]> {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

      const transactions = await this.financialTransactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.category', 'category')
        .where('transaction.farmId = :farmId', { farmId })
        .andWhere('transaction.transactionDate BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .getMany();

      const quarters = [
        { name: 'Q1', start: new Date(year, 0, 1), end: new Date(year, 2, 31, 23, 59, 59) },
        { name: 'Q2', start: new Date(year, 3, 1), end: new Date(year, 5, 30, 23, 59, 59) },
        { name: 'Q3', start: new Date(year, 6, 1), end: new Date(year, 8, 30, 23, 59, 59) },
        { name: 'Q4', start: new Date(year, 9, 1), end: new Date(year, 11, 31, 23, 59, 59) },
      ];

      const quarterlyData: MonthlyPLSummary[] = [];

      for (const quarter of quarters) {
        const quarterTransactions = transactions.filter(
          (t) => t.transactionDate >= quarter.start && t.transactionDate <= quarter.end
        );

        const quarterIncome = quarterTransactions
          .filter((t) => t.type === FinanceTransactionType.INCOME)
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const quarterExpenses = quarterTransactions
          .filter((t) => t.type === FinanceTransactionType.EXPENSE)
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const quarterNetPL = quarterIncome - quarterExpenses;
        const quarterProfitMargin = quarterIncome > 0 ? (quarterNetPL / quarterIncome) * 100 : 0;

        quarterlyData.push({
          month: quarter.name,
          year,
          totalIncome: quarterIncome,
          totalExpenses: quarterExpenses,
          netProfitLoss: quarterNetPL,
          profitMargin: Math.round(quarterProfitMargin * 100) / 100,
        });
      }

      return quarterlyData;
    } catch (error) {
      console.error('Error getting quarterly P&L summary:', error);
      throw new Error(`Failed to get quarterly P&L summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get detailed category breakdown for P&L
   */
  async getCategoryBreakdown(
    farmId: string,
    filters: PLReportFilters
  ): Promise<CategoryBreakdown[]> {
    try {
      const transactions = await this.financialTransactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.category', 'category')
        .where('transaction.farmId = :farmId', { farmId })
        .andWhere('transaction.transactionDate BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        })
        .getMany();

      // Group transactions by category
      const categoryMap = new Map<string, {
        category: FinancialCategory;
        transactions: FinancialTransaction[];
      }>();

      transactions.forEach((transaction) => {
        const categoryId = transaction.category_id;
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            category: transaction.category,
            transactions: [],
          });
        }
        categoryMap.get(categoryId)!.transactions.push(transaction);
      });

      const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const breakdown: CategoryBreakdown[] = [];

      categoryMap.forEach(({ category, transactions: categoryTransactions }) => {
        const amount = categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;

        breakdown.push({
          categoryId: category.id,
          categoryName: category.name,
          type: category.type,
          amount,
          percentage: Math.round(percentage * 100) / 100,
          transactionCount: categoryTransactions.length,
        });
      });

      // Sort by amount descending
      return breakdown.sort((a, b) => b.amount - a.amount);
    } catch (error) {
      console.error('Error getting category breakdown:', error);
      throw new Error(`Failed to get category breakdown: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export P&L report data for external use
   */
  async exportPLReport(
    farmId: string,
    filters: PLReportFilters,
    format: 'json' | 'csv' = 'json'
  ): Promise<any> {
    try {
      const plCalculation = await this.calculateProfitLoss(farmId, filters);
      const categoryBreakdown = await this.getCategoryBreakdown(farmId, filters);

      const exportData = {
        summary: plCalculation,
        categoryBreakdown,
        generatedAt: new Date(),
        filters,
      };

      if (format === 'csv') {
        // Convert to CSV format
        return this.convertToCSV(exportData);
      }

      return exportData;
    } catch (error) {
      console.error('Error exporting P&L report:', error);
      throw new Error(`Failed to export P&L report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get P&L comparison between two periods
   */
  async comparePLPeriods(
    farmId: string,
    currentPeriod: { startDate: Date; endDate: Date },
    previousPeriod: { startDate: Date; endDate: Date }
  ): Promise<{
    current: ProfitLossCalculation;
    previous: ProfitLossCalculation;
    comparison: {
      incomeChange: number;
      expenseChange: number;
      profitChange: number;
      marginChange: number;
    };
  }> {
    try {
      const [current, previous] = await Promise.all([
        this.calculateProfitLoss(farmId, currentPeriod),
        this.calculateProfitLoss(farmId, previousPeriod),
      ]);

      const comparison = {
        incomeChange: this.calculatePercentageChange(previous.totalIncome, current.totalIncome),
        expenseChange: this.calculatePercentageChange(previous.totalExpenses, current.totalExpenses),
        profitChange: this.calculatePercentageChange(previous.netProfitLoss, current.netProfitLoss),
        marginChange: current.profitMargin - previous.profitMargin,
      };

      return { current, previous, comparison };
    } catch (error) {
      console.error('Error comparing P&L periods:', error);
      throw new Error(`Failed to compare P&L periods: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private groupTransactionsByCategory(
    transactions: FinancialTransaction[]
  ): Record<string, number> {
    return transactions.reduce((acc, transaction) => {
      const categoryName = transaction.category?.name || 'Unknown';
      acc[categoryName] = (acc[categoryName] || 0) + Number(transaction.amount);
      return acc;
    }, {} as Record<string, number>);
  }

  private calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) {
      return newValue > 0 ? 100 : 0;
    }
    return Math.round(((newValue - oldValue) / Math.abs(oldValue)) * 10000) / 100;
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion for the summary data
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Income', data.summary.totalIncome],
      ['Total Expenses', data.summary.totalExpenses],
      ['Net Profit/Loss', data.summary.netProfitLoss],
      ['Profit Margin (%)', data.summary.profitMargin],
      ['Period Start', data.summary.period.startDate.toISOString().split('T')[0]],
      ['Period End', data.summary.period.endDate.toISOString().split('T')[0]],
    ];

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Get performance metrics for dashboard
   */
  async getPerformanceMetrics(
    farmId: string,
    period: 'month' | 'quarter' | 'year' = 'month'
  ): Promise<{
    currentPeriodPL: number;
    previousPeriodPL: number;
    growthRate: number;
    averageMonthlyIncome: number;
    averageMonthlyExpenses: number;
    topIncomeCategory: string;
    topExpenseCategory: string;
  }> {
    try {
      const now = new Date();
      let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;

      switch (period) {
        case 'month':
          currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
          currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          break;
        case 'quarter':
          const currentQuarter = Math.floor(now.getMonth() / 3);
          currentStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
          currentEnd = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59);
          previousStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
          previousEnd = new Date(now.getFullYear(), currentQuarter * 3, 0, 23, 59, 59);
          break;
        case 'year':
          currentStart = new Date(now.getFullYear(), 0, 1);
          currentEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
          previousStart = new Date(now.getFullYear() - 1, 0, 1);
          previousEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
          break;
      }

      const [currentPL, previousPL] = await Promise.all([
        this.calculateProfitLoss(farmId, { startDate: currentStart, endDate: currentEnd }),
        this.calculateProfitLoss(farmId, { startDate: previousStart, endDate: previousEnd }),
      ]);

      const growthRate = this.calculatePercentageChange(
        previousPL.netProfitLoss,
        currentPL.netProfitLoss
      );

      // Get yearly data for averages
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      const yearlyData = await this.getMonthlyPLSummary(farmId, now.getFullYear());
      
      const monthsWithData = yearlyData.filter(m => m.totalIncome > 0 || m.totalExpenses > 0);
      const avgMonthlyIncome = monthsWithData.length > 0 
        ? monthsWithData.reduce((sum, m) => sum + m.totalIncome, 0) / monthsWithData.length 
        : 0;
      const avgMonthlyExpenses = monthsWithData.length > 0 
        ? monthsWithData.reduce((sum, m) => sum + m.totalExpenses, 0) / monthsWithData.length 
        : 0;

      // Find top categories
      const topIncomeCategory = Object.entries(currentPL.incomeByCategory)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
      const topExpenseCategory = Object.entries(currentPL.expensesByCategory)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

      return {
        currentPeriodPL: currentPL.netProfitLoss,
        previousPeriodPL: previousPL.netProfitLoss,
        growthRate,
        averageMonthlyIncome: avgMonthlyIncome,
        averageMonthlyExpenses: avgMonthlyExpenses,
        topIncomeCategory,
        topExpenseCategory,
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw new Error(`Failed to get performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}