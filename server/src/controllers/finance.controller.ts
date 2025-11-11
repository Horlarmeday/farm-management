import { Request, Response } from 'express';
import { FinanceService } from '../services/FinanceService';
import { GetTransactionsQueryDto } from '../types/finance.types';

export class FinanceController {
  private financeService: FinanceService;

  constructor() {
    this.financeService = new FinanceService();
  }

  // Simple test method
  testMethod = async (req: Request, res: Response): Promise<void> => {
    console.log('🧪 TEST METHOD CALLED');
    res.json({ test: 'working' });
  };

  /**
   * Create a new financial transaction
   */
  createTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const farmId = req.farm!.id;

      const transaction = await this.financeService.createTransactionWithFarm(
        req.body,
        farmId,
        userId,
      );
      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Transaction created successfully',
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get financial transactions with filtering and pagination
   */
  getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const farmId = req.farm!.id;

      const queryParams: GetTransactionsQueryDto = {
        ...req.query,
        farm_id: farmId,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const transactions = await this.financeService.getTransactionsByFarm(farmId, queryParams);

      const result = {
        transactions,
        page: queryParams.page || 1,
        limit: queryParams.limit || 20,
        total: transactions.length,
        totalPages: Math.ceil(transactions.length / (queryParams.limit || 20)),
      };

      res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        message: 'Transactions retrieved successfully',
      });
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve transactions',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get a single transaction by ID
   */
  getTransactionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const farmId = req.farm!.id;
      const transactionId = req.params.id;

      const transaction = await this.financeService.getTransactionByIdAndFarm(
        transactionId,
        farmId,
      );

      if (!transaction) {
        res.status(404).json({
          success: false,
          error: 'Transaction not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: transaction,
        message: 'Transaction retrieved successfully',
      });
    } catch (error) {
      console.error('Error getting transaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Update a financial transaction
   */
  updateTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const farmId = req.farm!.id;
      const transactionId = req.params.id;

      const updateData = req.body;
      const transaction = await this.financeService.updateTransactionByFarm(
        transactionId,
        farmId,
        updateData,
      );

      if (!transaction) {
        res.status(404).json({
          success: false,
          error: 'Transaction not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: transaction,
        message: 'Transaction updated successfully',
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Delete a financial transaction
   */
  deleteTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const farmId = req.farm!.id;
      const transactionId = req.params.id;

      await this.financeService.deleteTransactionByFarm(transactionId, farmId);

      res.status(200).json({
        success: true,
        message: 'Transaction deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get financial categories
   */
  getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const farmId = req.farm!.id;

      const categories = await this.financeService.getCategoriesByFarm(farmId);
      res.json({
        success: true,
        data: categories,
        message: 'Categories retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving categories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve categories',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Create a new financial category
   */
  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const farmId = req.farm!.id;

      const categoryData = { ...req.body, farmId };
      const category = await this.financeService.createCategory(categoryData);
      res.status(201).json({
        success: true,
        data: category,
        message: 'Category created successfully',
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create category',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get a single category by ID
   */
  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.financeService.getCategoryById(id);
      res.json({
        success: true,
        data: category,
        message: 'Category retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving category:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve category',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Update a financial category
   */
  updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.financeService.updateCategory(id, req.body);
      res.json({
        success: true,
        data: category,
        message: 'Category updated successfully',
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update category',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Delete a financial category
   */
  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.financeService.deleteCategory(id);
      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete category',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get finance summary for dashboard
   */
  getFinanceSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const farmId = req.farm!.id;

      // Get current month's financial data
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const overview = await this.financeService.getFinancialOverview(
        farmId,
        startOfMonth,
        endOfMonth,
      );

      const summary = {
        monthlyRevenue: overview.totalIncome,
        expenses: overview.totalExpenses,
        netProfit: overview.netProfit,
      };

      res.json({
        success: true,
        message: 'Finance summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      console.error('Error getting finance summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get finance summary',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // ============================================
  // Account Management
  // ============================================

  /**
   * Create a new account
   */
  createAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const account = await this.financeService.createAccount(req.body);
      res.status(201).json({
        success: true,
        data: account,
        message: 'Account created successfully',
      });
    } catch (error) {
      console.error('Error creating account:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create account',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get all accounts
   */
  getAccounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, isActive } = req.query;
      const accounts = await this.financeService.getAccounts({
        type: type as any,
        isActive: isActive === 'true',
      });
      res.status(200).json({
        success: true,
        data: accounts,
        message: 'Accounts retrieved successfully',
      });
    } catch (error) {
      console.error('Error getting accounts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve accounts',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get account by ID
   */
  getAccountById = async (req: Request, res: Response): Promise<void> => {
    try {
      const accountId = req.params.id;
      const account = await this.financeService.getAccountById(accountId);
      res.status(200).json({
        success: true,
        data: account,
        message: 'Account retrieved successfully',
      });
    } catch (error) {
      console.error('Error getting account:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: 'Failed to retrieve account',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Update account
   */
  updateAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const accountId = req.params.id;
      const account = await this.financeService.updateAccount(accountId, req.body);
      res.status(200).json({
        success: true,
        data: account,
        message: 'Account updated successfully',
      });
    } catch (error) {
      console.error('Error updating account:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: 'Failed to update account',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Delete account
   */
  deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const accountId = req.params.id;
      await this.financeService.deleteAccount(accountId);
      res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: 'Failed to delete account',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get account balance
   */
  getAccountBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const accountId = req.params.id;
      const balance = await this.financeService.getAccountBalance(accountId);
      res.status(200).json({
        success: true,
        data: { balance },
        message: 'Account balance retrieved successfully',
      });
    } catch (error) {
      console.error('Error getting account balance:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: 'Failed to retrieve account balance',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // ============================================
  // Invoice Management
  // ============================================

  createInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const invoice = await this.financeService.createInvoice({
        ...req.body,
        createdById: userId,
      });
      res.status(201).json({
        success: true,
        data: invoice,
        message: 'Invoice created successfully',
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create invoice',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  getInvoices = async (req: Request, res: Response): Promise<void> => {
    try {
      const invoices = await this.financeService.getInvoices(req.query as any);
      res.status(200).json({
        success: true,
        data: invoices,
        message: 'Invoices retrieved successfully',
      });
    } catch (error) {
      console.error('Error getting invoices:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve invoices',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  getInvoiceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const invoice = await this.financeService.getInvoiceById(req.params.id);
      res.status(200).json({
        success: true,
        data: invoice,
        message: 'Invoice retrieved successfully',
      });
    } catch (error) {
      console.error('Error getting invoice:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: 'Failed to retrieve invoice',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  updateInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const invoice = await this.financeService.updateInvoice(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: invoice,
        message: 'Invoice updated successfully',
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: 'Failed to update invoice',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  deleteInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.financeService.deleteInvoice(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Invoice deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: 'Failed to delete invoice',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  markInvoiceAsPaid = async (req: Request, res: Response): Promise<void> => {
    try {
      const { paidDate } = req.body;
      const invoice = await this.financeService.markInvoiceAsPaid(
        req.params.id,
        paidDate ? new Date(paidDate) : undefined,
      );
      res.status(200).json({
        success: true,
        data: invoice,
        message: 'Invoice marked as paid',
      });
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark invoice as paid',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  markInvoiceAsOverdue = async (req: Request, res: Response): Promise<void> => {
    try {
      const invoice = await this.financeService.markInvoiceAsOverdue(req.params.id);
      res.status(200).json({
        success: true,
        data: invoice,
        message: 'Invoice marked as overdue',
      });
    } catch (error) {
      console.error('Error marking invoice as overdue:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark invoice as overdue',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  sendInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const invoice = await this.financeService.sendInvoice(req.params.id);
      res.status(200).json({
        success: true,
        data: invoice,
        message: 'Invoice sent successfully',
      });
    } catch (error) {
      console.error('Error sending invoice:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send invoice',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // ============================================
  // Payment Management
  // ============================================

  recordPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const payment = await this.financeService.recordPayment({
        ...req.body,
        recordedById: userId,
      });
      res.status(201).json({
        success: true,
        data: payment,
        message: 'Payment recorded successfully',
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  getPayments = async (req: Request, res: Response): Promise<void> => {
    try {
      const payments = await this.financeService.getPayments(req.query as any);
      res.status(200).json({
        success: true,
        data: payments,
        message: 'Payments retrieved successfully',
      });
    } catch (error) {
      console.error('Error getting payments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve payments',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  getPaymentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const payment = await this.financeService.getPaymentById(req.params.id);
      res.status(200).json({
        success: true,
        data: payment,
        message: 'Payment retrieved successfully',
      });
    } catch (error) {
      console.error('Error getting payment:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: 'Failed to retrieve payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  updatePayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const payment = await this.financeService.updatePayment(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: payment,
        message: 'Payment updated successfully',
      });
    } catch (error) {
      console.error('Error updating payment:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: 'Failed to update payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  deletePayment = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.financeService.deletePayment(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Payment deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting payment:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: 'Failed to delete payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // ============================================
  // Receipt Management
  // ============================================

  createReceipt = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const receipt = await this.financeService.createReceipt({
        ...req.body,
        issuedById: userId,
      });
      res.status(201).json({
        success: true,
        data: receipt,
        message: 'Receipt created successfully',
      });
    } catch (error) {
      console.error('Error creating receipt:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create receipt',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  getReceipts = async (req: Request, res: Response): Promise<void> => {
    try {
      const receipts = await this.financeService.getReceipts(req.query as any);
      res.status(200).json({
        success: true,
        data: receipts,
        message: 'Receipts retrieved successfully',
      });
    } catch (error) {
      console.error('Error getting receipts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve receipts',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  getReceiptById = async (req: Request, res: Response): Promise<void> => {
    try {
      const receipt = await this.financeService.getReceiptById(req.params.id);
      res.status(200).json({
        success: true,
        data: receipt,
        message: 'Receipt retrieved successfully',
      });
    } catch (error) {
      console.error('Error getting receipt:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: 'Failed to retrieve receipt',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // ============================================
  // Budget Management
  // ============================================

  createBudget = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const farmId = req.farm!.id;
      const budget = await this.financeService.createBudget({
        ...req.body,
        createdById: userId,
        farmId,
      });
      res.status(201).json({
        success: true,
        data: budget,
        message: 'Budget created successfully',
      });
    } catch (error) {
      console.error('Error creating budget:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create budget',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  getBudgets = async (req: Request, res: Response): Promise<void> => {
    try {
      const budgets = await this.financeService.getBudgets(req.query as any);
      res.status(200).json({
        success: true,
        data: budgets,
        message: 'Budgets retrieved successfully',
      });
    } catch (error) {
      console.error('Error getting budgets:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve budgets',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  getBudgetById = async (req: Request, res: Response): Promise<void> => {
    try {
      const budget = await this.financeService.getBudgetById(req.params.id);
      res.status(200).json({
        success: true,
        data: budget,
        message: 'Budget retrieved successfully',
      });
    } catch (error) {
      console.error('Error getting budget:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: 'Failed to retrieve budget',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  updateBudgetActuals = async (req: Request, res: Response): Promise<void> => {
    try {
      const budget = await this.financeService.updateBudgetActuals(req.params.id);
      res.status(200).json({
        success: true,
        data: budget,
        message: 'Budget actuals updated successfully',
      });
    } catch (error) {
      console.error('Error updating budget actuals:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update budget actuals',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // ============================================
  // Analytics & Reporting
  // ============================================

  generateProfitLossReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const farmId = req.farm!.id;
      const userId = req.user!.id;
      const { periodStart, periodEnd } = req.body;

      if (!periodStart || !periodEnd) {
        res.status(400).json({
          success: false,
          error: 'Period start and end dates are required',
        });
        return;
      }

      const report = await this.financeService.generateProfitLossReport(
        new Date(periodStart),
        new Date(periodEnd),
        userId,
        farmId,
      );

      res.status(200).json({
        success: true,
        data: report,
        message: 'Profit & Loss report generated successfully',
      });
    } catch (error) {
      console.error('Error generating P&L report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate P&L report',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  getCashFlowAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
      const farmId = req.farm!.id;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Start date and end date are required',
        });
        return;
      }

      const analysis = await this.financeService.getCashFlowAnalysis(
        farmId,
        new Date(startDate as string),
        new Date(endDate as string),
      );

      res.status(200).json({
        success: true,
        data: analysis,
        message: 'Cash flow analysis retrieved successfully',
      });
    } catch (error) {
      console.error('Error getting cash flow analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve cash flow analysis',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  getIncomeExpenseBreakdown = async (req: Request, res: Response): Promise<void> => {
    try {
      const farmId = req.farm!.id;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Start date and end date are required',
        });
        return;
      }

      const breakdown = await this.financeService.getIncomeExpenseBreakdown(
        farmId,
        new Date(startDate as string),
        new Date(endDate as string),
      );

      res.status(200).json({
        success: true,
        data: breakdown,
        message: 'Income/expense breakdown retrieved successfully',
      });
    } catch (error) {
      console.error('Error getting income/expense breakdown:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve income/expense breakdown',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
