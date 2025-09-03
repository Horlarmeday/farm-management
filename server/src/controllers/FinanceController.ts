import { ApiResponse } from '@kuyash/shared';
import { NextFunction, Request, Response } from 'express';
import { FinanceService } from '../services/FinanceService';
import { ServiceFactory } from '../services/ServiceFactory';
import { BadRequestError } from '../utils/errors';

export class FinanceController {
  private financeService: FinanceService;

  constructor() {
    const serviceFactory = ServiceFactory.getInstance();
    this.financeService = serviceFactory.getFinanceService();
  }

  // Financial Transactions
  createTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transaction = await this.financeService.createTransaction({
        ...req.body,
        recordedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Financial transaction created successfully',
        data: transaction,
      } as ApiResponse<typeof transaction>);
    } catch (error) {
      next(error);
    }
  };

  getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, category, accountId, startDate, endDate, search } = req.query;

      const transactions = await this.financeService.getTransactions({
        type: type as any,
        category: category as any,
        accountId: accountId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        search: search as string,
      });

      res.json({
        success: true,
        message: 'Transactions retrieved successfully',
        data: transactions,
      } as ApiResponse<typeof transactions>);
    } catch (error) {
      next(error);
    }
  };

  getTransactionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const transaction = await this.financeService.getTransactionById(id);

      res.json({
        success: true,
        message: 'Transaction retrieved successfully',
        data: transaction,
      } as ApiResponse<typeof transaction>);
    } catch (error) {
      next(error);
    }
  };

  updateTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const transaction = await this.financeService.updateTransaction(id, req.body);

      res.json({
        success: true,
        message: 'Transaction updated successfully',
        data: transaction,
      } as ApiResponse<typeof transaction>);
    } catch (error) {
      next(error);
    }
  };

  // Account Management
  createAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const account = await this.financeService.createAccount({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: account,
      } as ApiResponse<typeof account>);
    } catch (error) {
      next(error);
    }
  };

  getAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, isActive } = req.query;

      const accounts = await this.financeService.getAccounts({
        type: type as any,
        isActive: isActive ? isActive === 'true' : undefined,
      });

      res.json({
        success: true,
        message: 'Accounts retrieved successfully',
        data: accounts,
      } as ApiResponse<typeof accounts>);
    } catch (error) {
      next(error);
    }
  };

  getAccountById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const account = await this.financeService.getAccountById(id);

      res.json({
        success: true,
        message: 'Account retrieved successfully',
        data: account,
      } as ApiResponse<typeof account>);
    } catch (error) {
      next(error);
    }
  };

  updateAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const account = await this.financeService.updateAccount(id, req.body);

      res.json({
        success: true,
        message: 'Account updated successfully',
        data: account,
      } as ApiResponse<typeof account>);
    } catch (error) {
      next(error);
    }
  };

  // Invoice Management
  createInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const invoice = await this.financeService.createInvoice({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: invoice,
      } as ApiResponse<typeof invoice>);
    } catch (error) {
      next(error);
    }
  };

  getInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, customerId, startDate, endDate, overdue } = req.query;

      const invoices = await this.financeService.getInvoices({
        status: status as any,
        customerId: customerId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        overdue: overdue === 'true',
      });

      res.json({
        success: true,
        message: 'Invoices retrieved successfully',
        data: invoices,
      } as ApiResponse<typeof invoices>);
    } catch (error) {
      next(error);
    }
  };

  getInvoiceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const invoice = await this.financeService.getInvoiceById(id);

      res.json({
        success: true,
        message: 'Invoice retrieved successfully',
        data: invoice,
      } as ApiResponse<typeof invoice>);
    } catch (error) {
      next(error);
    }
  };

  updateInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const invoice = await this.financeService.updateInvoice(id, req.body);

      res.json({
        success: true,
        message: 'Invoice updated successfully',
        data: invoice,
      } as ApiResponse<typeof invoice>);
    } catch (error) {
      next(error);
    }
  };

  sendInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const invoice = await this.financeService.sendInvoice(id);

      res.json({
        success: true,
        message: 'Invoice sent successfully',
        data: invoice,
      } as ApiResponse<typeof invoice>);
    } catch (error) {
      next(error);
    }
  };

  // Payment Management
  recordPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payment = await this.financeService.recordPayment({
        ...req.body,
        recordedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Payment recorded successfully',
        data: payment,
      } as ApiResponse<typeof payment>);
    } catch (error) {
      next(error);
    }
  };

  getPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { invoiceId, status, method, startDate, endDate } = req.query;

      const payments = await this.financeService.getPayments({
        invoiceId: invoiceId as string,
        status: status as any,
        method: method as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        message: 'Payments retrieved successfully',
        data: payments,
      } as ApiResponse<typeof payments>);
    } catch (error) {
      next(error);
    }
  };

  // Budget Management
  createBudget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const budget = await this.financeService.createBudget({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Budget created successfully',
        data: budget,
      } as ApiResponse<typeof budget>);
    } catch (error) {
      next(error);
    }
  };

  getBudgets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { budgetPeriod, status, year } = req.query;

      const budgets = await this.financeService.getBudgets({
        budgetPeriod: budgetPeriod as any,
        status: status as any,
        year: year ? parseInt(year as string) : undefined,
      });

      res.json({
        success: true,
        message: 'Budgets retrieved successfully',
        data: budgets,
      } as ApiResponse<typeof budgets>);
    } catch (error) {
      next(error);
    }
  };

  getBudgetById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const budget = await this.financeService.getBudgetById(id);

      res.json({
        success: true,
        message: 'Budget retrieved successfully',
        data: budget,
      } as ApiResponse<typeof budget>);
    } catch (error) {
      next(error);
    }
  };

  updateBudgetActuals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const budget = await this.financeService.updateBudgetActuals(id);

      res.json({
        success: true,
        message: 'Budget actuals updated successfully',
        data: budget,
      } as ApiResponse<typeof budget>);
    } catch (error) {
      next(error);
    }
  };

  // Financial Reporting
  generateProfitLossReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new BadRequestError('Start date and end date are required');
      }

      const report = await this.financeService.generateProfitLossReport(
        new Date(startDate as string),
        new Date(endDate as string),
        req.user!.id,
      );

      res.json({
        success: true,
        message: 'Profit & Loss report generated successfully',
        data: report,
      } as ApiResponse<typeof report>);
    } catch (error) {
      next(error);
    }
  };

  getProfitLossReportById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const report = await this.financeService.getProfitLossReportById(id);

      res.json({
        success: true,
        message: 'Profit & Loss report retrieved successfully',
        data: report,
      } as ApiResponse<typeof report>);
    } catch (error) {
      next(error);
    }
  };

  generateCashFlowReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { date } = req.query;

      const reportDate = date ? new Date(date as string) : new Date();
      const report = await this.financeService.generateCashFlowReport(reportDate, req.user!.id);

      res.json({
        success: true,
        message: 'Cash flow report generated successfully',
        data: report,
      } as ApiResponse<typeof report>);
    } catch (error) {
      next(error);
    }
  };

  // Analytics
  getFinancialOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const overview = await this.financeService.getFinancialOverview(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      res.json({
        success: true,
        message: 'Financial overview retrieved successfully',
        data: overview,
      } as ApiResponse<typeof overview>);
    } catch (error) {
      next(error);
    }
  };
}
