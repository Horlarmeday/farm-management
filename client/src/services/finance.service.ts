import { apiClient } from './api';
import {
  FinancialTransaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  Account,
  CreateAccountRequest,
  UpdateAccountRequest,
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  Payment,
  CreatePaymentRequest,
  Receipt,
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  FinancialStats,
  FinancialReport,
  ProfitLossReport,
  CashFlow,
  FinanceTransactionType,
  IncomeCategory,
  ExpenseCategory,
  PaymentMethod,
  InvoiceStatus,
  PaymentStatus,
  AccountType
} from '../../../shared/src/types/finance.types';
import { PaginatedResponse, ApiResponse } from '../../../shared/src/types/api.types';

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
    const response = await apiClient.get('/finance/transactions', { params });
    return response.data;
  }

  static async getTransaction(id: string): Promise<FinancialTransaction> {
    const response = await apiClient.get(`/finance/transactions/${id}`);
    return response.data;
  }

  static async createTransaction(data: CreateTransactionRequest): Promise<FinancialTransaction> {
    const response = await apiClient.post('/finance/transactions', data);
    return response.data;
  }

  static async updateTransaction(id: string, data: UpdateTransactionRequest): Promise<FinancialTransaction> {
    const response = await apiClient.put(`/finance/transactions/${id}`, data);
    return response.data;
  }

  static async deleteTransaction(id: string): Promise<void> {
    await apiClient.delete(`/finance/transactions/${id}`);
  }

  static async approveTransaction(id: string): Promise<FinancialTransaction> {
    const response = await apiClient.post(`/finance/transactions/${id}/approve`);
    return response.data;
  }

  // Accounts
  static async getAccounts(params?: {
    page?: number;
    limit?: number;
    type?: AccountType;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Account>> {
    const response = await apiClient.get('/finance/accounts', { params });
    return response.data;
  }

  static async getAccount(id: string): Promise<Account> {
    const response = await apiClient.get(`/finance/accounts/${id}`);
    return response.data;
  }

  static async createAccount(data: CreateAccountRequest): Promise<Account> {
    const response = await apiClient.post('/finance/accounts', data);
    return response.data;
  }

  static async updateAccount(id: string, data: UpdateAccountRequest): Promise<Account> {
    const response = await apiClient.put(`/finance/accounts/${id}`, data);
    return response.data;
  }

  static async deleteAccount(id: string): Promise<void> {
    await apiClient.delete(`/finance/accounts/${id}`);
  }

  static async getAccountBalance(id: string): Promise<{ balance: number; currency: string }> {
    const response = await apiClient.get(`/finance/accounts/${id}/balance`);
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
    const response = await apiClient.get('/finance/invoices', { params });
    return response.data;
  }

  static async getInvoice(id: string): Promise<Invoice> {
    const response = await apiClient.get(`/finance/invoices/${id}`);
    return response.data;
  }

  static async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    const response = await apiClient.post('/finance/invoices', data);
    return response.data;
  }

  static async updateInvoice(id: string, data: UpdateInvoiceRequest): Promise<Invoice> {
    const response = await apiClient.put(`/finance/invoices/${id}`, data);
    return response.data;
  }

  static async deleteInvoice(id: string): Promise<void> {
    await apiClient.delete(`/finance/invoices/${id}`);
  }

  static async sendInvoice(id: string): Promise<Invoice> {
    const response = await apiClient.post(`/finance/invoices/${id}/send`);
    return response.data;
  }

  static async markInvoicePaid(id: string): Promise<Invoice> {
    const response = await apiClient.post(`/finance/invoices/${id}/mark-paid`);
    return response.data;
  }

  static async getOverdueInvoices(): Promise<Invoice[]> {
    const response = await apiClient.get('/finance/invoices/overdue');
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
    const response = await apiClient.get('/finance/payments', { params });
    return response.data;
  }

  static async getPayment(id: string): Promise<Payment> {
    const response = await apiClient.get(`/finance/payments/${id}`);
    return response.data;
  }

  static async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    const response = await apiClient.post('/finance/payments', data);
    return response.data;
  }

  static async updatePayment(id: string, data: Partial<CreatePaymentRequest>): Promise<Payment> {
    const response = await apiClient.put(`/finance/payments/${id}`, data);
    return response.data;
  }

  static async deletePayment(id: string): Promise<void> {
    await apiClient.delete(`/finance/payments/${id}`);
  }

  // Receipts
  static async getReceipts(params?: {
    page?: number;
    limit?: number;
    paymentId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<Receipt>> {
    const response = await apiClient.get('/finance/receipts', { params });
    return response.data;
  }

  static async getReceipt(id: string): Promise<Receipt> {
    const response = await apiClient.get(`/finance/receipts/${id}`);
    return response.data;
  }

  static async generateReceipt(paymentId: string): Promise<Receipt> {
    const response = await apiClient.post(`/finance/receipts/generate/${paymentId}`);
    return response.data;
  }

  // Budgets
  static async getBudgets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    period?: string;
  }): Promise<PaginatedResponse<Budget>> {
    const response = await apiClient.get('/finance/budgets', { params });
    return response.data;
  }

  static async getBudget(id: string): Promise<Budget> {
    const response = await apiClient.get(`/finance/budgets/${id}`);
    return response.data;
  }

  static async createBudget(data: CreateBudgetRequest): Promise<Budget> {
    const response = await apiClient.post('/finance/budgets', data);
    return response.data;
  }

  static async updateBudget(id: string, data: UpdateBudgetRequest): Promise<Budget> {
    const response = await apiClient.put(`/finance/budgets/${id}`, data);
    return response.data;
  }

  static async deleteBudget(id: string): Promise<void> {
    await apiClient.delete(`/finance/budgets/${id}`);
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
    const response = await apiClient.get(`/finance/budgets/${id}/performance`);
    return response.data;
  }

  // Financial Statistics and Analytics
  static async getFinancialStats(params?: {
    dateFrom?: string;
    dateTo?: string;
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }): Promise<FinancialStats> {
    const response = await apiClient.get('/finance/stats', { params });
    return response.data;
  }

  static async getIncomeByCategory(params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Record<IncomeCategory, number>> {
    const response = await apiClient.get('/finance/analytics/income-by-category', { params });
    return response.data;
  }

  static async getExpensesByCategory(params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Record<ExpenseCategory, number>> {
    const response = await apiClient.get('/finance/analytics/expenses-by-category', { params });
    return response.data;
  }

  static async getMonthlyTrend(params?: {
    months?: number;
    year?: number;
  }): Promise<Array<{
    month: string;
    income: number;
    expenses: number;
    profit: number;
  }>> {
    const response = await apiClient.get('/finance/analytics/monthly-trend', { params });
    return response.data;
  }

  static async getCashFlow(params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<CashFlow[]> {
    const response = await apiClient.get('/finance/cash-flow', { params });
    return response.data;
  }

  // Reports
  static async generateProfitLossReport(params: {
    periodStart: string;
    periodEnd: string;
    includeDetails?: boolean;
  }): Promise<ProfitLossReport> {
    const response = await apiClient.post('/finance/reports/profit-loss', params);
    return response.data;
  }

  static async generateFinancialReport(params: {
    reportType: 'profit_loss' | 'cash_flow' | 'balance_sheet' | 'income_statement';
    periodStart: string;
    periodEnd: string;
    format?: 'json' | 'pdf' | 'excel';
  }): Promise<FinancialReport> {
    const response = await apiClient.post('/finance/reports/generate', params);
    return response.data;
  }

  static async getFinancialReports(params?: {
    page?: number;
    limit?: number;
    reportType?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<FinancialReport>> {
    const response = await apiClient.get('/finance/reports', { params });
    return response.data;
  }

  static async downloadReport(reportId: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> {
    const response = await apiClient.get(`/finance/reports/${reportId}/download`, {
      params: { format },
      responseType: 'blob'
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
    const response = await apiClient.get('/finance/dashboard');
    return response.data;
  }
}

export default FinanceService;