import {
  AccountType,
  FinanceTransactionType,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
} from '@kuyash/shared';
import { Repository, IsNull, Between } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Account } from '../entities/Account';
import { Budget, BudgetPeriod, BudgetStatus, BudgetCategory } from '../entities/Budget';
import { BudgetItem } from '../entities/BudgetItem';
import { CashFlow } from '../entities/CashFlow';
import { CostCenter } from '../entities/CostCenter';
import { FinancialTransaction } from '../entities/FinancialTransaction';
import { FinancialCategory, CategoryType } from '../entities/FinancialCategory';
import { Invoice } from '../entities/Invoice';
import { InvoiceItem } from '../entities/InvoiceItem';
import { Payment } from '../entities/Payment';
import { ProfitLossItem } from '../entities/ProfitLossItem';
import { ProfitLossReport } from '../entities/ProfitLossReport';
import { NotFoundError } from '../utils/errors';
import { CreateTransactionDto, GetTransactionsQueryDto } from '../types/finance.types';

export class FinanceService {
  private financialTransactionRepository: Repository<FinancialTransaction>;
  private financialCategoryRepository: Repository<FinancialCategory>;
  private accountRepository: Repository<Account>;
  private invoiceRepository: Repository<Invoice>;
  private invoiceItemRepository: Repository<InvoiceItem>;
  private paymentRepository: Repository<Payment>;
  private budgetRepository: Repository<Budget>;
  private budgetItemRepository: Repository<BudgetItem>;
  private budgetCategoryRepository: Repository<BudgetCategory>;
  private costCenterRepository: Repository<CostCenter>;
  private profitLossReportRepository: Repository<ProfitLossReport>;
  private profitLossItemRepository: Repository<ProfitLossItem>;
  private cashFlowRepository: Repository<CashFlow>;

  constructor() {
    this.financialTransactionRepository = AppDataSource.getRepository(FinancialTransaction);
    this.financialCategoryRepository = AppDataSource.getRepository(FinancialCategory);
    this.accountRepository = AppDataSource.getRepository(Account);
    this.invoiceRepository = AppDataSource.getRepository(Invoice);
    this.invoiceItemRepository = AppDataSource.getRepository(InvoiceItem);
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.budgetRepository = AppDataSource.getRepository(Budget);
    this.budgetItemRepository = AppDataSource.getRepository(BudgetItem);
    this.budgetCategoryRepository = AppDataSource.getRepository(BudgetCategory);
    this.costCenterRepository = AppDataSource.getRepository(CostCenter);
    this.profitLossReportRepository = AppDataSource.getRepository(ProfitLossReport);
    this.profitLossItemRepository = AppDataSource.getRepository(ProfitLossItem);
    this.cashFlowRepository = AppDataSource.getRepository(CashFlow);
  }

  // Transaction Management
  async createTransaction(transactionData: {
    type: FinanceTransactionType;
    category_id: string;
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
      category_id: transactionData.category_id,
      description: transactionData.description,
      transactionDate: transactionData.date,
      paymentMethod: transactionData.paymentMethod,
      referenceNumber: transactionData.referenceNumber,
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

  async getTransactions(
    query: GetTransactionsQueryDto
  ): Promise<{ transactions: FinancialTransaction[]; total: number }> {
    const queryBuilder = this.financialTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .leftJoinAndSelect('transaction.account', 'account')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.farm', 'farm')
      .where('transaction.farm_id = :farm_id', { farm_id: query.farm_id });

    // Apply filters
    if (query.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: query.type });
    }

    if (query.start_date) {
      queryBuilder.andWhere('transaction.date >= :start_date', { start_date: query.start_date });
    }

    if (query.end_date) {
      queryBuilder.andWhere('transaction.date <= :end_date', { end_date: query.end_date });
    }

    if (query.category_id) {
      queryBuilder.andWhere('transaction.category_id = :category_id', { category_id: query.category_id });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(transaction.description ILIKE :search OR transaction.reference_number ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);

    // Get results
    const [transactions, total] = await queryBuilder
      .orderBy('transaction.date', 'DESC')
      .getManyAndCount();

    return { transactions, total };
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
    const savedTransaction = await this.financialTransactionRepository.save(transaction);
    return savedTransaction;
  }

  // New methods for controller support with farm isolation
  async createTransactionWithFarm(
    data: CreateTransactionDto,
    farmId: string,
    userId: string
  ): Promise<FinancialTransaction> {
    console.log('=== SERVICE DEBUG ===');
    console.log('Input data:', JSON.stringify(data, null, 2));
    console.log('farmId:', farmId);
    console.log('userId:', userId);
    
    // Validate transaction type
    const validTypes = ['INCOME', 'EXPENSE'];
    const processedType = data.type.toUpperCase() as FinanceTransactionType;
    console.log('Original type:', data.type);
    console.log('Processed type:', processedType);
    
    if (!validTypes.includes(processedType)) {
      console.log('❌ Invalid transaction type:', processedType);
      throw new Error(`Invalid transaction type: ${processedType}. Must be one of: ${validTypes.join(', ')}`);
    }
    
    const transactionNumber = await this.generateTransactionNumber();
    console.log('Generated transaction number:', transactionNumber);
    
    // Get categoryId from snake_case property
    const categoryId = data.category_id;
    console.log('🔍 CategoryId - using:', categoryId);
    
    // Validate category exists and belongs to farm (category is required)
    if (!categoryId) {
      throw new Error('Category ID is required for financial transactions');
    }
    
    const category = await this.financialCategoryRepository.findOne({
      where: { id: categoryId, farm_id: farmId },
    });
    if (!category) {
      throw new Error('Category not found or does not belong to this farm');
    }
    
    // Parse date from transaction_date property
    let transactionDate: Date;
    const dateValue = data.transaction_date;
    if (dateValue) {
      transactionDate = new Date(dateValue);
      if (isNaN(transactionDate.getTime())) {
        console.log('❌ Invalid date provided:', dateValue);
        transactionDate = new Date();
      }
    } else {
      transactionDate = new Date();
    }
    console.log('🔍 Transaction date:', transactionDate.toISOString());

    const transactionData = {
      transactionNumber,
      type: processedType,
      amount: data.amount,
      description: data.description,
      category_id: categoryId,
      subcategory: data.subcategory,
      transactionDate: transactionDate,
      paymentMethod: data.payment_method?.toUpperCase() as any,
      referenceNumber: data.reference_number,
      notes: data.notes,
      userId: userId,
      costCenterId: data.cost_center_id,
      farmId: farmId,
      recordedById: userId,
    };
    
    console.log('🔍 Category ID being set:', categoryId);
    console.log('🔍 Transaction data category_id:', transactionData.category_id);
    
    console.log('Transaction data to create:', JSON.stringify(transactionData, null, 2));
    
    // Create transaction entity
    const transactionEntity = new FinancialTransaction();
    transactionEntity.transactionNumber = transactionData.transactionNumber;
    transactionEntity.type = transactionData.type;
    transactionEntity.amount = transactionData.amount;
    transactionEntity.description = transactionData.description;
    transactionEntity.category_id = categoryId;
    transactionEntity.subcategory = transactionData.subcategory;
    transactionEntity.transactionDate = transactionData.transactionDate;
    transactionEntity.paymentMethod = transactionData.paymentMethod;
    transactionEntity.referenceNumber = transactionData.referenceNumber;
    transactionEntity.notes = transactionData.notes;
    transactionEntity.userId = transactionData.userId;
    transactionEntity.costCenterId = transactionData.costCenterId;
    transactionEntity.farmId = transactionData.farmId;
    transactionEntity.recordedById = transactionData.recordedById;
    
    console.log('Transaction entity to save:', JSON.stringify(transactionEntity, null, 2));

    const savedTransaction = await this.financialTransactionRepository.save(transactionEntity);
    return savedTransaction;
  }

  async getTransactionsByFarm(
    farmId: string,
    query: GetTransactionsQueryDto = { farm_id: '' }
  ): Promise<FinancialTransaction[]> {
    // Ensure farm_id is set in query
    query.farm_id = farmId;
    const queryBuilder = this.financialTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.farmId = :farmId', { farmId });

    if (query.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: query.type });
    }

    if (query.category_id) {
      queryBuilder.andWhere('transaction.category_id = :category_id', { category_id: query.category_id });
    }

    if (query.start_date) {
      queryBuilder.andWhere('transaction.transactionDate >= :start_date', { start_date: query.start_date });
    }

    if (query.end_date) {
      queryBuilder.andWhere('transaction.transactionDate <= :end_date', { end_date: query.end_date });
    }

    queryBuilder.orderBy('transaction.transactionDate', 'DESC');

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    const page = query.page || 1;
    const offset = (page - 1) * (query.limit || 10);
    if (offset > 0) {
      queryBuilder.offset(offset);
    }

    return queryBuilder.getMany();
  }

  async getTransactionByIdAndFarm(
    id: string,
    farmId: string
  ): Promise<FinancialTransaction | null> {
    return this.financialTransactionRepository.findOne({
      where: { id, farmId },
      relations: ['category'],
    });
  }

  async updateTransactionByFarm(
    id: string,
    farmId: string,
    data: Partial<CreateTransactionDto>
  ): Promise<FinancialTransaction> {
    const transaction = await this.getTransactionByIdAndFarm(id, farmId);
    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    Object.assign(transaction, data);
    return await this.financialTransactionRepository.save(transaction);
  }

  async deleteTransactionByFarm(id: string, farmId: string): Promise<void> {
    const transaction = await this.getTransactionByIdAndFarm(id, farmId);
    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    await this.financialTransactionRepository.remove(transaction);
  }

  async getCategoriesByFarm(farmId: string): Promise<FinancialCategory[]> {
    return this.financialCategoryRepository.find({
      where: [{ farm_id: farmId }, { farm_id: IsNull() }], // Include both farm-specific and default categories
      order: { name: 'ASC' },
    });
  }

  async createCategory(categoryData: {
    name: string;
    type: CategoryType;
    description?: string;
    farmId: string;
  }): Promise<FinancialCategory> {
    const category = this.financialCategoryRepository.create({
      name: categoryData.name,
      type: categoryData.type,
      description: categoryData.description,
      farm_id: categoryData.farmId,
      is_custom: true,
    });

    return await this.financialCategoryRepository.save(category);
  }

  async getCategoryById(id: string): Promise<FinancialCategory> {
    const category = await this.financialCategoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }

  async updateCategory(id: string, updates: Partial<FinancialCategory>): Promise<FinancialCategory> {
    const category = await this.getCategoryById(id);
    Object.assign(category, updates);
    return await this.financialCategoryRepository.save(category);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.getCategoryById(id);
    await this.financialCategoryRepository.remove(category);
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

    return await this.accountRepository.save(account);
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
    return await this.accountRepository.save(account);
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
    return await this.invoiceRepository.save(invoice);
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
      category_id: 'other_income',
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
    farmId: string;
  }): Promise<Budget> {
    const budgetEntity = new Budget();
    budgetEntity.name = budgetData.budgetName;
    budgetEntity.period = budgetData.budgetPeriod;
    budgetEntity.start_date = budgetData.startDate;
    budgetEntity.end_date = budgetData.endDate;
    budgetEntity.total_income_budget = 0;
    budgetEntity.total_expense_budget = budgetData.totalBudget;
    budgetEntity.total_income_actual = 0;
    budgetEntity.total_expense_actual = 0;
    budgetEntity.status = BudgetStatus.DRAFT;
    budgetEntity.notes = budgetData.notes ? { content: budgetData.notes } : undefined;
    budgetEntity.created_by_id = budgetData.createdById;
    budgetEntity.farm_id = budgetData.farmId;

    const savedBudget = await this.budgetRepository.save(budgetEntity);

    // Create budget categories
    for (const categoryData of budgetData.budgetItems) {
      const budgetCategory = this.budgetCategoryRepository.create({
        budget_id: savedBudget.id,
        category_id: categoryData.category,
        budgeted_amount: categoryData.budgetedAmount,
        actual_amount: 0,
        notes: categoryData.notes,
        created_by_id: budgetData.createdById,
      });

      await this.budgetCategoryRepository.save(budgetCategory);
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
      .leftJoinAndSelect('budget.budget_categories', 'categories')
      .leftJoinAndSelect('budget.created_by', 'createdBy');

    if (filters?.budgetPeriod) {
      query.andWhere('budget.period = :budgetPeriod', { budgetPeriod: filters.budgetPeriod });
    }

    if (filters?.status) {
      query.andWhere('budget.status = :status', { status: filters.status });
    }

    if (filters?.year) {
      query.andWhere('YEAR(budget.start_date) = :year', { year: filters.year });
    }

    return query.orderBy('budget.start_date', 'DESC').getMany();
  }

  async getBudgetById(id: string): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({
      where: { id },
      relations: ['budget_categories', 'created_by'],
    });

    if (!budget) {
      throw new NotFoundError('Budget not found');
    }

    return budget;
  }

  async updateBudgetActuals(budgetId: string): Promise<Budget> {
    const budget = await this.getBudgetById(budgetId);

    // Get actual expenses for the budget period
    const result = await this.getTransactions({
      type: FinanceTransactionType.EXPENSE,
      start_date: budget.start_date.toISOString(),
      end_date: budget.end_date.toISOString(),
      farm_id: budget.farm_id,
    });
    const actualExpenses = result.transactions;

    // Update budget totals
    const totalActualSpent = actualExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    budget.total_expense_actual = totalActualSpent;

    // Update budget categories
    for (const budgetCategory of budget.budget_categories) {
      const categoryExpenses = actualExpenses
        .filter((expense) => expense.category_id === budgetCategory.category_id)
        .reduce((sum, expense) => sum + expense.amount, 0);

      budgetCategory.actual_amount = categoryExpenses;

      await this.budgetCategoryRepository.save(budgetCategory);
    }

    return await this.budgetRepository.save(budget);
  }

  // Financial Reporting
  async generateProfitLossReport(
    startDate: Date,
    endDate: Date,
    createdById: string,
    farmId: string,
  ): Promise<ProfitLossReport> {
    const reportName = `P&L Report ${startDate.toDateString()} - ${endDate.toDateString()}`;

    const incomeResult = await this.getTransactions({
      type: FinanceTransactionType.INCOME,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      farm_id: farmId,
    });
    const incomeTransactions = incomeResult.transactions;

    const expenseResult = await this.getTransactions({
      type: FinanceTransactionType.EXPENSE,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      farm_id: farmId,
    });
    const expenseTransactions = expenseResult.transactions;

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
        category: category,
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
        category: category,
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

  async generateCashFlowReport(date: Date, recordedById: string, farmId: string): Promise<CashFlow> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.getTransactions({
      start_date: startOfDay.toISOString(),
      end_date: endOfDay.toISOString(),
      farm_id: farmId,
    });
    const dayTransactions = result.transactions;

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

    return await this.cashFlowRepository.save(cashFlow);
  }

  // Analytics and Reporting
  async getFinancialOverview(
    farmId: string,
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
    const result = await this.getTransactions({
      start_date: startDate?.toISOString(),
      end_date: endDate?.toISOString(),
      farm_id: farmId,
    });
    const transactions = result.transactions;

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
    const monthlyTrend = await this.generateMonthlyTrend(farmId);

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

    // Create date range for the current day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await this.financialTransactionRepository.count({
      where: {
        createdAt: Between(startOfDay, endOfDay),
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
        const categoryId = transaction.category_id || 'uncategorized';
        acc[categoryId] = (acc[categoryId] || 0) + transaction.amount;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  private async generateMonthlyTrend(farmId: string): Promise<
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

      const result = await this.getTransactions({
        start_date: monthStart.toISOString(),
        end_date: monthEnd.toISOString(),
        farm_id: farmId,
      });
      const monthTransactions = result.transactions;

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
