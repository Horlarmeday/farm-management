import { BaseEntity, Status } from './common.types';
import { User } from './user.types';
export type IncomeCategory = 'egg_sales' | 'bird_sales' | 'fish_sales' | 'livestock_sales' | 'milk_sales' | 'meat_sales' | 'manure_sales' | 'service_income' | 'other_income';
export type ExpenseCategory = 'feed' | 'medicine' | 'veterinary' | 'labor' | 'utilities' | 'equipment' | 'maintenance' | 'transport' | 'insurance' | 'taxes' | 'rent' | 'other_expense';
export declare enum PaymentMethod {
    CASH = "cash",
    BANK_TRANSFER = "bank_transfer",
    CHEQUE = "cheque",
    CREDIT_CARD = "credit_card",
    MOBILE_MONEY = "mobile_money",
    OTHER = "other"
}
export declare enum FinanceTransactionType {
    INCOME = "income",
    EXPENSE = "expense"
}
export declare enum InvoiceStatus {
    DRAFT = "draft",
    PENDING = "pending",
    SENT = "sent",
    PAID = "paid",
    OVERDUE = "overdue",
    CANCELLED = "cancelled"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PARTIAL = "partial",
    PAID = "paid",
    OVERDUE = "overdue",
    CANCELLED = "cancelled"
}
export declare enum AccountType {
    BANK = "bank",
    CASH = "cash",
    MOBILE_MONEY = "mobile_money",
    INVESTMENT = "investment",
    OTHER = "other"
}
export declare enum BudgetPeriod {
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    YEARLY = "yearly"
}
export declare enum BudgetStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export interface FinancialTransaction extends BaseEntity {
    transactionNumber: string;
    type: FinanceTransactionType;
    category: IncomeCategory | ExpenseCategory;
    amount: number;
    currency: string;
    description: string;
    date: Date;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    referenceNumber?: string;
    referenceType?: 'invoice' | 'receipt' | 'order' | 'sale' | 'purchase' | 'manual';
    referenceId?: string;
    attachments?: string[];
    notes?: string;
    recordedBy: User;
    approvedBy?: User;
    approvedAt?: Date;
    account?: Account;
    invoice?: Invoice;
    receipt?: Receipt;
}
export interface Account extends BaseEntity {
    accountNumber: string;
    accountName: string;
    accountType: AccountType;
    bankName?: string;
    branchName?: string;
    currentBalance: number;
    currency: string;
    isActive: boolean;
    notes?: string;
    transactions: FinancialTransaction[];
}
export interface Invoice extends BaseEntity {
    invoiceNumber: string;
    customerId?: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    issueDate: Date;
    dueDate: Date;
    subtotal: number;
    tax: number;
    discount: number;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    status: InvoiceStatus;
    paymentStatus: PaymentStatus;
    paymentTerms?: string;
    notes?: string;
    createdBy: User;
    invoiceItems: InvoiceItem[];
    payments: Payment[];
}
export interface InvoiceItem extends BaseEntity {
    invoiceId: string;
    invoice: Invoice;
    itemType: 'product' | 'service';
    itemId?: string;
    itemName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    notes?: string;
}
export interface Payment extends BaseEntity {
    paymentNumber: string;
    invoiceId?: string;
    invoice?: Invoice;
    paymentDate: Date;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    referenceNumber?: string;
    accountId?: string;
    account?: Account;
    notes?: string;
    recordedBy: User;
}
export interface Receipt extends BaseEntity {
    receiptNumber: string;
    paymentId?: string;
    payment?: Payment;
    receiptDate: Date;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    paidBy: string;
    description: string;
    notes?: string;
    issuedBy: User;
}
export interface Budget extends BaseEntity {
    budgetName: string;
    budgetPeriod: 'monthly' | 'quarterly' | 'yearly';
    startDate: Date;
    endDate: Date;
    totalBudget: number;
    actualSpent: number;
    remainingBudget: number;
    status: Status;
    notes?: string;
    createdBy: User;
    budgetItems: BudgetItem[];
}
export interface BudgetItem extends BaseEntity {
    budgetId: string;
    budget: Budget;
    category: ExpenseCategory;
    budgetedAmount: number;
    actualAmount: number;
    remainingAmount: number;
    notes?: string;
}
export interface CostCenter extends BaseEntity {
    code: string;
    name: string;
    description?: string;
    manager?: User;
    budgetLimit?: number;
    actualSpent: number;
    isActive: boolean;
    transactions: FinancialTransaction[];
}
export interface ProfitLossReport extends BaseEntity {
    reportName: string;
    periodStart: Date;
    periodEnd: Date;
    totalIncome: number;
    totalExpenses: number;
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
    generatedBy: User;
    incomeItems: ProfitLossItem[];
    expenseItems: ProfitLossItem[];
}
export interface ProfitLossItem extends BaseEntity {
    reportId: string;
    report: ProfitLossReport;
    type: FinanceTransactionType;
    category: IncomeCategory | ExpenseCategory;
    amount: number;
    percentage: number;
}
export interface CashFlow extends BaseEntity {
    date: Date;
    openingBalance: number;
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
    closingBalance: number;
    notes?: string;
    recordedBy: User;
}
export interface CreateTransactionRequest {
    type: FinanceTransactionType;
    category: IncomeCategory | ExpenseCategory;
    amount: number;
    currency: string;
    description: string;
    date: Date;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    referenceType?: 'invoice' | 'receipt' | 'order' | 'sale' | 'purchase' | 'manual';
    referenceId?: string;
    accountId?: string;
    notes?: string;
}
export interface UpdateTransactionRequest {
    category?: IncomeCategory | ExpenseCategory;
    amount?: number;
    description?: string;
    date?: Date;
    paymentMethod?: PaymentMethod;
    status?: PaymentStatus;
    referenceNumber?: string;
    accountId?: string;
    notes?: string;
}
export interface CreateInvoiceRequest {
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    issueDate: Date;
    dueDate: Date;
    paymentTerms?: string;
    notes?: string;
    invoiceItems: {
        itemType: 'product' | 'service';
        itemId?: string;
        itemName: string;
        description?: string;
        quantity: number;
        unitPrice: number;
        notes?: string;
    }[];
}
export interface UpdateInvoiceRequest {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    dueDate?: Date;
    status?: InvoiceStatus;
    paymentTerms?: string;
    notes?: string;
}
export interface CreatePaymentRequest {
    invoiceId?: string;
    paymentDate: Date;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    accountId?: string;
    notes?: string;
}
export interface CreateAccountRequest {
    accountNumber: string;
    accountName: string;
    accountType: AccountType;
    bankName?: string;
    branchName?: string;
    currentBalance: number;
    currency: string;
    notes?: string;
}
export interface UpdateAccountRequest {
    accountName?: string;
    accountType?: AccountType;
    bankName?: string;
    branchName?: string;
    currentBalance?: number;
    currency?: string;
    isActive?: boolean;
    notes?: string;
}
export interface CreateBudgetRequest {
    budgetName: string;
    budgetPeriod: 'monthly' | 'quarterly' | 'yearly';
    startDate: Date;
    endDate: Date;
    totalBudget: number;
    notes?: string;
    budgetItems: {
        category: ExpenseCategory;
        budgetedAmount: number;
        notes?: string;
    }[];
}
export interface UpdateBudgetRequest {
    budgetName?: string;
    startDate?: Date;
    endDate?: Date;
    totalBudget?: number;
    status?: Status;
    notes?: string;
}
export interface FinancialStats {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    totalAccounts: number;
    totalBalance: number;
    pendingInvoices: number;
    overdueInvoices: number;
    totalReceivables: number;
    incomeByCategory: Record<IncomeCategory, number>;
    expensesByCategory: Record<ExpenseCategory, number>;
    monthlyTrend: Array<{
        month: string;
        income: number;
        expenses: number;
        profit: number;
    }>;
    topExpenseCategories: Array<{
        category: ExpenseCategory;
        amount: number;
        percentage: number;
    }>;
    paymentMethodBreakdown: Record<PaymentMethod, number>;
}
export interface FinancialReport {
    reportType: 'profit_loss' | 'cash_flow' | 'balance_sheet' | 'income_statement';
    periodStart: Date;
    periodEnd: Date;
    generatedAt: Date;
    generatedBy: User;
    data: Record<string, any>;
}
//# sourceMappingURL=finance.types.d.ts.map