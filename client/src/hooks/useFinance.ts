import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AccountType,
  CreateAccountRequest,
  CreateBudgetRequest,
  CreateInvoiceRequest,
  CreatePaymentRequest,
  CreateTransactionRequest,
  ExpenseCategory,
  FinanceTransactionType,
  IncomeCategory,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  UpdateAccountRequest,
  UpdateBudgetRequest,
  UpdateInvoiceRequest,
  UpdateTransactionRequest,
} from '../../../shared/src/types/finance.types';
import { queryKeys } from '../lib/queryKeys';
import { FinanceService } from '../services/finance.service';

// Financial Transactions
export const useFinancialTransactions = (params?: {
  page?: number;
  limit?: number;
  type?: FinanceTransactionType;
  category?: IncomeCategory | ExpenseCategory;
  dateFrom?: string;
  dateTo?: string;
  status?: PaymentStatus;
}) => {
  return useQuery({
    queryKey: queryKeys.finance.transactions(params),
    queryFn: () => FinanceService.getTransactions(params),
  });
};

export const useFinancialTransaction = (id: string) => {
  return useQuery({
    queryKey: queryKeys.finance.transaction(id),
    queryFn: () => FinanceService.getTransaction(id),
    enabled: !!id,
  });
};

export const useCreateFinancialTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionRequest) => FinanceService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
};

export const useUpdateFinancialTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionRequest }) =>
      FinanceService.updateTransaction(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.transaction(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.transactions() });
    },
  });
};

export const useDeleteFinancialTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => FinanceService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
    },
  });
};

// Accounts
export const useAccounts = (params?: {
  page?: number;
  limit?: number;
  type?: AccountType;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: queryKeys.finance.accounts(params),
    queryFn: () => FinanceService.getAccounts(params),
  });
};

export const useAccount = (id: string) => {
  return useQuery({
    queryKey: queryKeys.finance.account(id),
    queryFn: () => FinanceService.getAccount(id),
    enabled: !!id,
  });
};

export const useAccountBalance = (id: string) => {
  return useQuery({
    queryKey: queryKeys.finance.accountBalance(id),
    queryFn: () => FinanceService.getAccountBalance(id),
    enabled: !!id,
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountRequest) => FinanceService.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.accounts() });
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountRequest }) =>
      FinanceService.updateAccount(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.account(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.accounts() });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => FinanceService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.accounts() });
    },
  });
};

// Invoices
export const useInvoices = (params?: {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.finance.invoices(params),
    queryFn: () => FinanceService.getInvoices(params),
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: queryKeys.finance.invoice(id),
    queryFn: () => FinanceService.getInvoice(id),
    enabled: !!id,
  });
};

export const useOverdueInvoices = () => {
  return useQuery({
    queryKey: queryKeys.finance.overdueInvoices(),
    queryFn: () => FinanceService.getOverdueInvoices(),
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceRequest) => FinanceService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.invoices() });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceRequest }) =>
      FinanceService.updateInvoice(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.invoice(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.invoices() });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => FinanceService.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.invoices() });
    },
  });
};

// Payments
export const usePayments = (params?: {
  page?: number;
  limit?: number;
  invoiceId?: string;
  status?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  paymentMethod?: PaymentMethod;
}) => {
  return useQuery({
    queryKey: queryKeys.finance.payments(params),
    queryFn: () => FinanceService.getPayments(params),
  });
};

export const usePayment = (id: string) => {
  return useQuery({
    queryKey: queryKeys.finance.payment(id),
    queryFn: () => FinanceService.getPayment(id),
    enabled: !!id,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => FinanceService.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.payments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.invoices() });
    },
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => FinanceService.deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.payments() });
    },
  });
};

// Receipts
export const useReceipts = (params?: {
  page?: number;
  limit?: number;
  paymentId?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.finance.receipts(params),
    queryFn: () => FinanceService.getReceipts(params),
  });
};

export const useReceipt = (id: string) => {
  return useQuery({
    queryKey: queryKeys.finance.receipt(id),
    queryFn: () => FinanceService.getReceipt(id),
    enabled: !!id,
  });
};

export const useGenerateReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => FinanceService.generateReceipt(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.receipts() });
    },
  });
};

// Budgets
export const useBudgets = (params?: {
  page?: number;
  limit?: number;
  period?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.finance.budgets(params),
    queryFn: () => FinanceService.getBudgets(params),
  });
};

export const useBudget = (id: string) => {
  return useQuery({
    queryKey: queryKeys.finance.budget(id),
    queryFn: () => FinanceService.getBudget(id),
    enabled: !!id,
  });
};

export const useBudgetPerformance = (id: string) => {
  return useQuery({
    queryKey: queryKeys.finance.budgetPerformance(id),
    queryFn: () => FinanceService.getBudgetPerformance(id),
    enabled: !!id,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetRequest) => FinanceService.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.budgets() });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetRequest }) =>
      FinanceService.updateBudget(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.budget(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.budgets() });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => FinanceService.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.budgets() });
    },
  });
};

// Analytics and Reports
export const useFinancialStats = (params?: {
  dateFrom?: string;
  dateTo?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}) => {
  return useQuery({
    queryKey: queryKeys.finance.stats(params),
    queryFn: () => FinanceService.getFinancialStats(params),
  });
};

export const useIncomeByCategory = (params?: { dateFrom?: string; dateTo?: string }) => {
  return useQuery({
    queryKey: queryKeys.finance.incomeByCategory(params),
    queryFn: () => FinanceService.getIncomeByCategory(params),
  });
};

export const useExpensesByCategory = (params?: { dateFrom?: string; dateTo?: string }) => {
  return useQuery({
    queryKey: queryKeys.finance.expensesByCategory(params),
    queryFn: () => FinanceService.getExpensesByCategory(params),
  });
};

export const useMonthlyTrend = (params?: { months?: number; year?: number }) => {
  return useQuery({
    queryKey: queryKeys.finance.monthlyTrend(params),
    queryFn: () => FinanceService.getMonthlyTrend(params),
  });
};

export const useCashFlow = (params?: { dateFrom?: string; dateTo?: string; period?: string }) => {
  return useQuery({
    queryKey: queryKeys.finance.cashFlow(params),
    queryFn: () => FinanceService.getCashFlow(params),
  });
};

export const useFinancialReports = (params?: { dateFrom?: string; dateTo?: string }) => {
  return useQuery({
    queryKey: queryKeys.finance.reports(params),
    queryFn: () => FinanceService.getFinancialReports(params),
  });
};

export const useFinancialReport = (id: string) => {
  return useQuery({
    queryKey: queryKeys.finance.report(id),
    queryFn: () => FinanceService.getFinancialReports({ dateFrom: '', dateTo: '' }),
    enabled: !!id,
  });
};

export const useGenerateFinancialReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      dateFrom: string;
      dateTo: string;
      reportType: 'profit_loss' | 'cash_flow';
    }) => FinanceService.getFinancialReports(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.reports() });
    },
  });
};

export const useFinanceDashboardSummary = () => {
  return useQuery({
    queryKey: queryKeys.finance.dashboardSummary(),
    queryFn: () => FinanceService.getDashboardSummary(),
  });
};

// Financial Categories
export const useFinancialCategories = () => {
  return useQuery({
    queryKey: queryKeys.finance.categories(),
    queryFn: () => FinanceService.getCategories(),
  });
};
