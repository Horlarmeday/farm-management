import {
  FinancialTransaction,
  FinanceTransactionType,
  IncomeCategory,
  ExpenseCategory,
  PaymentMethod,
  PaymentStatus,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  FinancialStats,
  ProfitLossReport,
  ProfitLossItem
} from '../../../shared/src/types/finance.types';

// Re-export imported types
export {
  FinancialTransaction,
  FinanceTransactionType,
  IncomeCategory,
  ExpenseCategory,
  PaymentMethod,
  PaymentStatus,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  FinancialStats,
  ProfitLossReport,
  ProfitLossItem
};

// Additional types for frontend use
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

export interface TransactionFilters {
  type?: FinanceTransactionType;
  category?: IncomeCategory | ExpenseCategory;
  status?: PaymentStatus;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface TransactionResponse {
  transaction: FinancialTransaction;
  message: string;
}

export interface TransactionListResponse {
  transactions: FinancialTransaction[];
  total: number;
  page: number;
  limit: number;
}

export interface GenerateProfitLossReportRequest {
  startDate: Date;
  endDate: Date;
  farmId?: string;
}

export interface ProfitLossReportResponse {
  report: ProfitLossReport;
  summary: FinancialSummary;
  chartData: {
    revenueVsExpenses: Array<{
      month: string;
      revenue: number;
      expenses: number;
    }>;
    categoryBreakdown: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
}