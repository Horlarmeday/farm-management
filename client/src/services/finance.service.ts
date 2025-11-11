import { PaginatedResponse } from '../../../shared/src/types/api.types';
import {
  Account,
  AccountType,
  Budget,
  CashFlow,
  CreateAccountRequest,
  CreateBudgetRequest,
  CreateInvoiceRequest,
  CreatePaymentRequest,
  CreateTransactionRequest,
  ExpenseCategory,
  FinanceTransactionType,
  FinancialReport,
  FinancialStats,
  FinancialTransaction,
  IncomeCategory,
  Invoice,
  InvoiceStatus,
  Payment,
  PaymentMethod,
  PaymentStatus,
  ProfitLossReport,
  Receipt,
  UpdateAccountRequest,
  UpdateBudgetRequest,
  UpdateInvoiceRequest,
  UpdateTransactionRequest,
} from '../../../shared/src/types/finance.types';
import { apiClient } from './api';

const prefix = '/api/finance';
export class FinanceService {
  // Financial Transactions
  static async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: FinanceTransactionType;
    category?: IncomeCategory | ExpenseCategory;
    dateFrom?: string;
    dateTo?: string;
    status?: PaymentStatus;
  }): Promise<PaginatedResponse<FinancialTransaction>> {
    const response = await apiClient.get(`${prefix}/transactions`, params);
    return response.data;
  }

  static async getTransaction(id: string): Promise<FinancialTransaction> {
    const response = await apiClient.get(`${prefix}/transactions/${id}`);
    return response.data;
  }

  static async createTransaction(data: CreateTransactionRequest): Promise<FinancialTransaction> {
    const response = await apiClient.post(`${prefix}/transactions`, data);
    return response.data;
  }

  static async updateTransaction(
    id: string,
    data: UpdateTransactionRequest,
  ): Promise<FinancialTransaction> {
    const response = await apiClient.put(`${prefix}/transactions/${id}`, data);
    return response.data;
  }

  static async deleteTransaction(id: string): Promise<void> {
    await apiClient.delete(`${prefix}/transactions/${id}`);
  }

  static async approveTransaction(id: string): Promise<FinancialTransaction> {
    const response = await apiClient.post(`${prefix}/transactions/${id}/approve`);
    return response.data;
  }

  // Accounts
  static async getAccounts(params?: {
    page?: number;
    limit?: number;
    type?: AccountType;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Account>> {
    const response = await apiClient.get(`${prefix}/accounts`, params);
    return response.data;
  }

  static async getAccount(id: string): Promise<Account> {
    const response = await apiClient.get(`${prefix}/accounts/${id}`);
    return response.data;
  }

  static async createAccount(data: CreateAccountRequest): Promise<Account> {
    const response = await apiClient.post(`${prefix}/accounts`, data);
    return response.data;
  }

  static async updateAccount(id: string, data: UpdateAccountRequest): Promise<Account> {
    const response = await apiClient.put(`${prefix}/accounts/${id}`, data);
    return response.data;
  }

  static async deleteAccount(id: string): Promise<void> {
    await apiClient.delete(`${prefix}/accounts/${id}`);
  }

  static async getAccountBalance(id: string): Promise<{ balance: number; currency: string }> {
    const response = await apiClient.get(`${prefix}/accounts/${id}/balance`);
    return response.data;
  }

  // Invoices
  static async getInvoices(params?: {
    page?: number;
    limit?: number;
    status?: InvoiceStatus;
    paymentStatus?: PaymentStatus;
    dateFrom?: string;
    dateTo?: string;
    customerId?: string;
  }): Promise<PaginatedResponse<Invoice>> {
    const response = await apiClient.get(`${prefix}/invoices`, params);
    return response.data;
  }

  static async getInvoice(id: string): Promise<Invoice> {
    const response = await apiClient.get(`${prefix}/invoices/${id}`);
    return response.data;
  }

  static async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    const response = await apiClient.post(`${prefix}/invoices`, data);
    return response.data;
  }

  static async updateInvoice(id: string, data: UpdateInvoiceRequest): Promise<Invoice> {
    const response = await apiClient.put(`${prefix}/invoices/${id}`, data);
    return response.data;
  }

  static async deleteInvoice(id: string): Promise<void> {
    await apiClient.delete(`${prefix}/invoices/${id}`);
  }

  static async sendInvoice(id: string): Promise<Invoice> {
    const response = await apiClient.post(`${prefix}/invoices/${id}/send`);
    return response.data;
  }

  static async markInvoicePaid(id: string): Promise<Invoice> {
    const response = await apiClient.post(`${prefix}/invoices/${id}/mark-paid`);
    return response.data;
  }

  static async markInvoiceOverdue(id: string): Promise<Invoice> {
    const response = await apiClient.post(`${prefix}/invoices/${id}/mark-overdue`);
    return response.data;
  }

  static async getOverdueInvoices(): Promise<Invoice[]> {
    const response = await apiClient.get(`${prefix}/invoices/overdue`);
    return response.data;
  }

  // Payments
  static async getPayments(params?: {
    page?: number;
    limit?: number;
    invoiceId?: string;
    status?: PaymentStatus;
    dateFrom?: string;
    dateTo?: string;
    paymentMethod?: PaymentMethod;
  }): Promise<PaginatedResponse<Payment>> {
    const response = await apiClient.get(`${prefix}/payments`, params);
    return response.data;
  }

  static async getPayment(id: string): Promise<Payment> {
    const response = await apiClient.get(`${prefix}/payments/${id}`);
    return response.data;
  }

  static async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    const response = await apiClient.post(`${prefix}/payments`, data);
    return response.data;
  }

  static async updatePayment(id: string, data: Partial<CreatePaymentRequest>): Promise<Payment> {
    const response = await apiClient.put(`${prefix}/payments/${id}`, data);
    return response.data;
  }

  static async deletePayment(id: string): Promise<void> {
    await apiClient.delete(`${prefix}/payments/${id}`);
  }

  // Receipts
  static async getReceipts(params?: {
    page?: number;
    limit?: number;
    paymentId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<Receipt>> {
    const response = await apiClient.get(`${prefix}/receipts`, params);
    return response.data;
  }

  static async getReceipt(id: string): Promise<Receipt> {
    const response = await apiClient.get(`${prefix}/receipts/${id}`);
    return response.data;
  }

  static async createReceipt(data: { paymentId: string; notes?: string }): Promise<Receipt> {
    const response = await apiClient.post(`${prefix}/receipts`, data);
    return response.data;
  }

  static async generateReceipt(paymentId: string): Promise<Receipt> {
    const response = await apiClient.post(`${prefix}/receipts/generate/${paymentId}`);
    return response.data;
  }

  // Budgets
  static async getBudgets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    period?: string;
  }): Promise<PaginatedResponse<Budget>> {
    const response = await apiClient.get(`${prefix}/budgets`, params);
    return response.data;
  }

  static async getBudget(id: string): Promise<Budget> {
    const response = await apiClient.get(`${prefix}/budgets/${id}`);
    return response.data;
  }

  static async createBudget(data: CreateBudgetRequest): Promise<Budget> {
    const response = await apiClient.post(`${prefix}/budgets`, data);
    return response.data;
  }

  static async updateBudget(id: string, data: UpdateBudgetRequest): Promise<Budget> {
    const response = await apiClient.put(`${prefix}/budgets/${id}`, data);
    return response.data;
  }

  static async deleteBudget(id: string): Promise<void> {
    await apiClient.delete(`${prefix}/budgets/${id}`);
  }

  static async updateBudgetActuals(id: string): Promise<Budget> {
    const response = await apiClient.post(`${prefix}/budgets/${id}/update-actuals`);
    return response.data;
  }

  static async getBudgetPerformance(id: string): Promise<{
    budgetedAmount: number;
    actualAmount: number;
    variance: number;
    variancePercentage: number;
    categoryBreakdown: Array<{
      category: ExpenseCategory;
      budgeted: number;
      actual: number;
      variance: number;
    }>;
  }> {
    const response = await apiClient.get(`${prefix}/budgets/${id}/performance`);
    return response.data;
  }

  // Financial Statistics and Analytics
  static async getFinancialStats(params?: {
    dateFrom?: string;
    dateTo?: string;
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }): Promise<FinancialStats> {
    const response = await apiClient.get(`${prefix}/stats`, params);
    return response.data;
  }

  static async getIncomeByCategory(params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Record<IncomeCategory, number>> {
    const response = await apiClient.get(`${prefix}/analytics/income-by-category`, params);
    return response.data;
  }

  static async getExpensesByCategory(params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Record<ExpenseCategory, number>> {
    const response = await apiClient.get(`${prefix}/analytics/expenses-by-category`, params);
    return response.data;
  }

  static async getMonthlyTrend(params?: { months?: number; year?: number }): Promise<
    Array<{
      month: string;
      income: number;
      expenses: number;
      profit: number;
    }>
  > {
    const response = await apiClient.get(`${prefix}/analytics/monthly-trend`, params);
    return response.data;
  }

  static async getCashFlow(params?: { dateFrom?: string; dateTo?: string }): Promise<CashFlow[]> {
    const response = await apiClient.get(`${prefix}/cash-flow`, params);
    return response.data;
  }

  static async getCashFlowAnalysis(params: { startDate: string; endDate: string }): Promise<{
    inflows: Array<{ date: string; amount: number; category: string }>;
    outflows: Array<{ date: string; amount: number; category: string }>;
    netCashFlow: number;
    openingBalance: number;
    closingBalance: number;
    summary: {
      totalInflows: number;
      totalOutflows: number;
      netChange: number;
    };
  }> {
    const response = await apiClient.get(`${prefix}/analytics/cash-flow`, params);
    return response.data;
  }

  static async getIncomeExpenseBreakdown(params: { startDate: string; endDate: string }): Promise<{
    income: Array<{ category: string; amount: number; percentage: number; count: number }>;
    expenses: Array<{ category: string; amount: number; percentage: number; count: number }>;
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
  }> {
    const response = await apiClient.get(`${prefix}/analytics/breakdown`, params);
    return response.data;
  }

  // Reports
  static async generateProfitLossReport(params: {
    periodStart: string;
    periodEnd: string;
    includeDetails?: boolean;
  }): Promise<ProfitLossReport> {
    const response = await apiClient.post(`${prefix}/reports/profit-loss`, params);
    return response.data;
  }

  static async generateFinancialReport(params: {
    reportType: 'profit_loss' | 'cash_flow' | 'balance_sheet' | 'income_statement';
    periodStart: string;
    periodEnd: string;
    format?: 'json' | 'pdf' | 'excel';
  }): Promise<FinancialReport> {
    const response = await apiClient.post(`${prefix}/reports/generate`, params);
    return response.data;
  }

  static async getFinancialReports(params?: {
    page?: number;
    limit?: number;
    reportType?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<FinancialReport>> {
    const response = await apiClient.get(`${prefix}/reports`, params);
    return response.data;
  }

  static async downloadReport(reportId: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> {
    const response = await apiClient.get(`${prefix}/reports/${reportId}/download`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  // Dashboard Summary
  static async getDashboardSummary(): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    pendingInvoices: number;
    overdueInvoices: number;
    totalReceivables: number;
    recentTransactions: FinancialTransaction[];
    topExpenseCategories: Array<{
      category: ExpenseCategory;
      amount: number;
      percentage: number;
    }>;
  }> {
    const response = await apiClient.get(`${prefix}/dashboard`);
    return response.data;
  }

  // Financial Categories
  static async getCategories(): Promise<
    Array<{
      id: string;
      name: string;
      type: 'income' | 'expense';
      description?: string;
      is_custom: boolean;
      is_active: boolean;
      color?: string;
      icon?: string;
    }>
  > {
    const response = await apiClient.get(`${prefix}/categories`);
    return response.data;
  }
}

export default FinanceService;
