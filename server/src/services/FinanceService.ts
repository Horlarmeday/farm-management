import {
  AccountType,
  ExpenseCategory,
  FinanceTransactionType,
  IncomeCategory,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
} from '@kuyash/shared';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Account } from '../entities/Account';
import { Budget, BudgetPeriod, BudgetStatus } from '../entities/Budget';
import { BudgetItem } from '../entities/BudgetItem';
import { CashFlow } from '../entities/CashFlow';
import { CostCenter } from '../entities/CostCenter';
import { FinancialTransaction } from '../entities/FinancialTransaction';
import { Invoice } from '../entities/Invoice';
import { InvoiceItem } from '../entities/InvoiceItem';
import { Payment } from '../entities/Payment';
import { ProfitLossItem } from '../entities/ProfitLossItem';
import { ProfitLossReport } from '../entities/ProfitLossReport';
import { NotFoundError } from '../utils/errors';

export class FinanceService {
  private financialTransactionRepository: Repository<FinancialTransaction>;
  private accountRepository: Repository<Account>;
  private invoiceRepository: Repository<Invoice>;
  private invoiceItemRepository: Repository<InvoiceItem>;
  private paymentRepository: Repository<Payment>;
  private budgetRepository: Repository<Budget>;
  private budgetItemRepository: Repository<BudgetItem>;
  private costCenterRepository: Repository<CostCenter>;
  private profitLossReportRepository: Repository<ProfitLossReport>;
  private profitLossItemRepository: Repository<ProfitLossItem>;
  private cashFlowRepository: Repository<CashFlow>;

  constructor() {
    this.financialTransactionRepository = AppDataSource.getRepository(FinancialTransaction);
    this.accountRepository = AppDataSource.getRepository(Account);
    this.invoiceRepository = AppDataSource.getRepository(Invoice);
    this.invoiceItemRepository = AppDataSource.getRepository(InvoiceItem);
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.budgetRepository = AppDataSource.getRepository(Budget);
    this.budgetItemRepository = AppDataSource.getRepository(BudgetItem);
    this.costCenterRepository = AppDataSource.getRepository(CostCenter);
    this.profitLossReportRepository = AppDataSource.getRepository(ProfitLossReport);
    this.profitLossItemRepository = AppDataSource.getRepository(ProfitLossItem);
    this.cashFlowRepository = AppDataSource.getRepository(CashFlow);
  }

  // Transaction Management
  async createTransaction(transactionData: {
    type: FinanceTransactionType;
    category: IncomeCategory | ExpenseCategory;
    amount: number;
    description: string;
    date: Date;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    referenceType?: string;
    referenceId?: string;
    accountId?: string;
    notes?: string;
    recordedById: string;
  }): Promise<FinancialTransaction> {
    const transactionNumber = await this.generateTransactionNumber();

    const transaction = this.financialTransactionRepository.create({
      transactionNumber,
      type: transactionData.type,
      amount: transactionData.amount,
      category: transactionData.category,
      description: transactionData.description,
      transactionDate: transactionData.date,
      paymentMethod: transactionData.paymentMethod,
      reference: transactionData.referenceNumber,
      notes: transactionData.notes,
      userId: transactionData.recordedById,
    });

    const savedTransaction = await this.financialTransactionRepository.save(transaction);

    // Update account balance if account specified
    if (transactionData.accountId) {
      await this.updateAccountBalance(
        transactionData.accountId,
        transactionData.amount,
        transactionData.type,
      );
    }

    return savedTransaction;
  }

  async getTransactions(filters?: {
    type?: FinanceTransactionType;
    category?: IncomeCategory | ExpenseCategory;
    accountId?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }): Promise<FinancialTransaction[]> {
    const query = this.financialTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user');

    if (filters?.type) {
      query.andWhere('transaction.type = :type', { type: filters.type });
    }

    if (filters?.category) {
      query.andWhere('transaction.category = :category', { category: filters.category });
    }

    if (filters?.startDate) {
      query.andWhere('transaction.transactionDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('transaction.transactionDate <= :endDate', { endDate: filters.endDate });
    }

    if (filters?.search) {
      query.andWhere(
        '(transaction.description LIKE :search OR transaction.reference LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return query.orderBy('transaction.transactionDate', 'DESC').getMany();
  }

  async getTransactionById(id: string): Promise<FinancialTransaction> {
    const transaction = await this.financialTransactionRepository.findOne({
      where: { id },
      relations: ['user', 'costCenter'],
    });

    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    return transaction;
  }

  async updateTransaction(
    id: string,
    updates: Partial<FinancialTransaction>,
  ): Promise<FinancialTransaction> {
    const transaction = await this.getTransactionById(id);
    Object.assign(transaction, updates);
    return this.financialTransactionRepository.save(transaction);
  }

  // Account Management
  async createAccount(accountData: {
    accountNumber: string;
    name: string;
    type: AccountType;
    description?: string;
    balance: number;
    createdById: string;
  }): Promise<Account> {
    const account = this.accountRepository.create({
      accountNumber: accountData.accountNumber,
      name: accountData.name,
      type: accountData.type,
      description: accountData.description,
      balance: accountData.balance,
      isActive: true,
    });

    return this.accountRepository.save(account);
  }

  async getAccounts(filters?: { type?: AccountType; isActive?: boolean }): Promise<Account[]> {
    const query = this.accountRepository.createQueryBuilder('account');

    if (filters?.type) {
      query.andWhere('account.type = :type', { type: filters.type });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('account.isActive = :isActive', { isActive: filters.isActive });
    }

    return query.orderBy('account.name', 'ASC').getMany();
  }

  async getAccountById(id: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id },
    });

    if (!account) {
      throw new NotFoundError('Account not found');
    }

    return account;
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
    const account = await this.getAccountById(id);
    Object.assign(account, updates);
    return this.accountRepository.save(account);
  }

  private async updateAccountBalance(
    accountId: string,
    amount: number,
    type: FinanceTransactionType,
  ): Promise<void> {
    const account = await this.getAccountById(accountId);
    const balanceChange = type === FinanceTransactionType.INCOME ? amount : -amount;

    await this.updateAccount(accountId, {
      balance: account.balance + balanceChange,
    });
  }

  // Invoice Management
  async createInvoice(invoiceData: {
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    invoiceDate: Date;
    dueDate: Date;
    paymentTerms?: string;
    notes?: string;
    invoiceItems: Array<{
      description: string;
      quantity: number;
      unit: string;
      unitPrice: number;
    }>;
    createdById: string;
  }): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate totals
    const subtotal = invoiceData.invoiceItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const taxAmount = subtotal * 0.1; // 10% tax - could be configurable
    const totalAmount = subtotal + taxAmount;

    const invoice = this.invoiceRepository.create({
      invoiceNumber,
      customerName: invoiceData.customerName,
      customerEmail: invoiceData.customerEmail,
      customerPhone: invoiceData.customerPhone,
      customerAddress: invoiceData.customerAddress,
      invoiceDate: invoiceData.invoiceDate,
      dueDate: invoiceData.dueDate,
      subtotal,
      taxAmount,
      totalAmount,
      status: InvoiceStatus.PENDING,
      paymentTerms: invoiceData.paymentTerms,
      notes: invoiceData.notes,
      createdById: invoiceData.createdById,
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    // Create invoice items
    for (const itemData of invoiceData.invoiceItems) {
      const invoiceItem = this.invoiceItemRepository.create({
        invoiceId: savedInvoice.id,
        description: itemData.description,
        quantity: itemData.quantity,
        unit: itemData.unit,
        unitPrice: itemData.unitPrice,
        totalPrice: itemData.quantity * itemData.unitPrice,
      });

      await this.invoiceItemRepository.save(invoiceItem);
    }

    return this.getInvoiceById(savedInvoice.id);
  }

  async getInvoices(filters?: {
    status?: InvoiceStatus;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
    overdue?: boolean;
  }): Promise<Invoice[]> {
    const query = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('invoice.createdBy', 'createdBy');

    if (filters?.status) {
      query.andWhere('invoice.status = :status', { status: filters.status });
    }

    if (filters?.startDate) {
      query.andWhere('invoice.invoiceDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('invoice.invoiceDate <= :endDate', { endDate: filters.endDate });
    }

    if (filters?.overdue) {
      const today = new Date();
      query
        .andWhere('invoice.dueDate < :today', { today })
        .andWhere('invoice.status != :paid', { paid: InvoiceStatus.PAID });
    }

    return query.orderBy('invoice.invoiceDate', 'DESC').getMany();
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['items', 'createdBy'],
    });

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    return invoice;
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id);
    Object.assign(invoice, updates);
    return this.invoiceRepository.save(invoice);
  }

  async sendInvoice(id: string): Promise<Invoice> {
    return this.updateInvoice(id, { status: InvoiceStatus.SENT });
  }

  // Payment Management
  async recordPayment(paymentData: {
    invoiceId?: string;
    paymentDate: Date;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
    recordedById: string;
  }): Promise<Payment> {
    const paymentNumber = await this.generatePaymentNumber();

    const payment = this.paymentRepository.create({
      paymentNumber,
      paymentDate: paymentData.paymentDate,
      amount: paymentData.amount,
      method: paymentData.method,
      reference: paymentData.reference,
      notes: paymentData.notes,
      invoiceId: paymentData.invoiceId,
      status: PaymentStatus.PAID,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Create financial transaction for the payment
    await this.createTransaction({
      type: FinanceTransactionType.INCOME,
      category: 'other_income' as IncomeCategory,
      amount: paymentData.amount,
      description: `Payment received - ${paymentNumber}`,
      date: paymentData.paymentDate,
      paymentMethod: paymentData.method,
      referenceNumber: paymentData.reference,
      referenceType: 'payment',
      referenceId: savedPayment.id,
      recordedById: paymentData.recordedById,
    });

    return savedPayment;
  }

  async getPayments(filters?: {
    invoiceId?: string;
    status?: PaymentStatus;
    method?: PaymentMethod;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Payment[]> {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.invoice', 'invoice');

    if (filters?.invoiceId) {
      query.andWhere('payment.invoiceId = :invoiceId', { invoiceId: filters.invoiceId });
    }

    if (filters?.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters?.method) {
      query.andWhere('payment.method = :method', { method: filters.method });
    }

    if (filters?.startDate) {
      query.andWhere('payment.paymentDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('payment.paymentDate <= :endDate', { endDate: filters.endDate });
    }

    return query.orderBy('payment.paymentDate', 'DESC').getMany();
  }

  // Budget Management
  async createBudget(budgetData: {
    budgetName: string;
    budgetPeriod: BudgetPeriod;
    startDate: Date;
    endDate: Date;
    totalBudget: number;
    notes?: string;
    budgetItems: Array<{
      category: string;
      budgetedAmount: number;
      notes?: string;
    }>;
    createdById: string;
  }): Promise<Budget> {
    const budget = this.budgetRepository.create({
      budgetName: budgetData.budgetName,
      budgetPeriod: budgetData.budgetPeriod,
      startDate: budgetData.startDate,
      endDate: budgetData.endDate,
      totalBudget: budgetData.totalBudget,
      actualSpent: 0,
      remainingBudget: budgetData.totalBudget,
      status: BudgetStatus.DRAFT,
      notes: budgetData.notes,
      createdById: budgetData.createdById,
    });

    const savedBudget = await this.budgetRepository.save(budget);

    // Create budget items
    for (const itemData of budgetData.budgetItems) {
      const budgetItem = this.budgetItemRepository.create({
        budgetId: savedBudget.id,
        category: itemData.category,
        budgetedAmount: itemData.budgetedAmount,
        actualAmount: 0,
        remainingAmount: itemData.budgetedAmount,
        notes: itemData.notes,
      });

      await this.budgetItemRepository.save(budgetItem);
    }

    return this.getBudgetById(savedBudget.id);
  }

  async getBudgets(filters?: {
    budgetPeriod?: BudgetPeriod;
    status?: BudgetStatus;
    year?: number;
  }): Promise<Budget[]> {
    const query = this.budgetRepository
      .createQueryBuilder('budget')
      .leftJoinAndSelect('budget.budgetItems', 'items')
      .leftJoinAndSelect('budget.createdBy', 'createdBy');

    if (filters?.budgetPeriod) {
      query.andWhere('budget.budgetPeriod = :budgetPeriod', { budgetPeriod: filters.budgetPeriod });
    }

    if (filters?.status) {
      query.andWhere('budget.status = :status', { status: filters.status });
    }

    if (filters?.year) {
      query.andWhere('YEAR(budget.startDate) = :year', { year: filters.year });
    }

    return query.orderBy('budget.startDate', 'DESC').getMany();
  }

  async getBudgetById(id: string): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({
      where: { id },
      relations: ['budgetItems', 'createdBy'],
    });

    if (!budget) {
      throw new NotFoundError('Budget not found');
    }

    return budget;
  }

  async updateBudgetActuals(budgetId: string): Promise<Budget> {
    const budget = await this.getBudgetById(budgetId);

    // Get actual expenses for the budget period
    const actualExpenses = await this.getTransactions({
      type: FinanceTransactionType.EXPENSE,
      startDate: budget.startDate,
      endDate: budget.endDate,
    });

    // Update budget totals
    const totalActualSpent = actualExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    budget.actualSpent = totalActualSpent;
    budget.remainingBudget = budget.totalBudget - totalActualSpent;

    // Update budget items
    for (const budgetItem of budget.budgetItems) {
      const categoryExpenses = actualExpenses
        .filter((expense) => expense.category === budgetItem.category)
        .reduce((sum, expense) => sum + expense.amount, 0);

      budgetItem.actualAmount = categoryExpenses;
      budgetItem.remainingAmount = budgetItem.budgetedAmount - categoryExpenses;

      await this.budgetItemRepository.save(budgetItem);
    }

    return this.budgetRepository.save(budget);
  }

  // Financial Reporting
  async generateProfitLossReport(
    startDate: Date,
    endDate: Date,
    createdById: string,
  ): Promise<ProfitLossReport> {
    const reportName = `P&L Report ${startDate.toDateString()} - ${endDate.toDateString()}`;

    const incomeTransactions = await this.getTransactions({
      type: FinanceTransactionType.INCOME,
      startDate,
      endDate,
    });

    const expenseTransactions = await this.getTransactions({
      type: FinanceTransactionType.EXPENSE,
      startDate,
      endDate,
    });

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    const report = this.profitLossReportRepository.create({
      reportName,
      periodStart: startDate,
      periodEnd: endDate,
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      generatedById: createdById,
    });

    const savedReport = await this.profitLossReportRepository.save(report);

    // Create income items
    const incomeByCategory = this.groupTransactionsByCategory(incomeTransactions);
    for (const [category, amount] of Object.entries(incomeByCategory)) {
      const item = this.profitLossItemRepository.create({
        reportId: savedReport.id,
        type: FinanceTransactionType.INCOME,
        category: category as IncomeCategory,
        amount,
        percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
      });
      await this.profitLossItemRepository.save(item);
    }

    // Create expense items
    const expensesByCategory = this.groupTransactionsByCategory(expenseTransactions);
    for (const [category, amount] of Object.entries(expensesByCategory)) {
      const item = this.profitLossItemRepository.create({
        reportId: savedReport.id,
        type: FinanceTransactionType.EXPENSE,
        category: category as ExpenseCategory,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      });
      await this.profitLossItemRepository.save(item);
    }

    return this.getProfitLossReportById(savedReport.id);
  }

  async getProfitLossReportById(id: string): Promise<ProfitLossReport> {
    const report = await this.profitLossReportRepository.findOne({
      where: { id },
      relations: ['incomeItems', 'expenseItems'],
    });

    if (!report) {
      throw new NotFoundError('Profit & Loss report not found');
    }

    return report;
  }

  async generateCashFlowReport(date: Date, recordedById: string): Promise<CashFlow> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const dayTransactions = await this.getTransactions({
      startDate: startOfDay,
      endDate: endOfDay,
    });

    const totalIncome = dayTransactions
      .filter((t) => t.type === FinanceTransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = dayTransactions
      .filter((t) => t.type === FinanceTransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const netCashFlow = totalIncome - totalExpenses;

    // Get previous day's closing balance
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);

    const previousCashFlow = await this.cashFlowRepository.findOne({
      where: { date: previousDay },
      order: { createdAt: 'DESC' },
    });

    const openingBalance = previousCashFlow?.closingBalance || 0;
    const closingBalance = openingBalance + netCashFlow;

    const cashFlow = this.cashFlowRepository.create({
      date,
      openingBalance,
      totalIncome,
      totalExpenses,
      netCashFlow,
      closingBalance,
      recordedById,
    });

    return this.cashFlowRepository.save(cashFlow);
  }

  // Analytics and Reporting
  async getFinancialOverview(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    totalAccounts: number;
    totalBalance: number;
    pendingInvoices: number;
    overdueInvoices: number;
    totalReceivables: number;
    incomeByCategory: Record<string, number>;
    expensesByCategory: Record<string, number>;
    monthlyTrend: Array<{
      month: string;
      income: number;
      expenses: number;
      profit: number;
    }>;
  }> {
    const transactions = await this.getTransactions({
      startDate,
      endDate,
    });

    const incomeTransactions = transactions.filter((t) => t.type === FinanceTransactionType.INCOME);
    const expenseTransactions = transactions.filter(
      (t) => t.type === FinanceTransactionType.EXPENSE,
    );

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    const accounts = await this.getAccounts({ isActive: true });
    const totalAccounts = accounts.length;
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    const pendingInvoices = await this.getInvoices({ status: InvoiceStatus.PENDING });
    const overdueInvoices = await this.getInvoices({ overdue: true });
    const totalReceivables = pendingInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);

    const incomeByCategory = this.groupTransactionsByCategory(incomeTransactions);
    const expensesByCategory = this.groupTransactionsByCategory(expenseTransactions);

    // Generate monthly trend (last 12 months)
    const monthlyTrend = await this.generateMonthlyTrend();

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      totalAccounts,
      totalBalance,
      pendingInvoices: pendingInvoices.length,
      overdueInvoices: overdueInvoices.length,
      totalReceivables,
      incomeByCategory,
      expensesByCategory,
      monthlyTrend,
    };
  }

  // Utility Methods
  private async generateTransactionNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const count = await this.financialTransactionRepository.count({
      where: {
        createdAt: date,
      },
    });

    return `TXN-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }

  private async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();

    const count = await this.invoiceRepository.count();
    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private async generatePaymentNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();

    const count = await this.paymentRepository.count();
    return `PAY-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private groupTransactionsByCategory(
    transactions: FinancialTransaction[],
  ): Record<string, number> {
    return transactions.reduce(
      (acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  private async generateMonthlyTrend(): Promise<
    Array<{
      month: string;
      income: number;
      expenses: number;
      profit: number;
    }>
  > {
    const trend = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

      const monthTransactions = await this.getTransactions({
        startDate: monthStart,
        endDate: monthEnd,
      });

      const income = monthTransactions
        .filter((t) => t.type === FinanceTransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter((t) => t.type === FinanceTransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);

      trend.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income,
        expenses,
        profit: income - expenses,
      });
    }

    return trend;
  }
}
