import { ApiResponse, FinanceTransactionType } from '@kuyash/shared';
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
  async createTransaction(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { farmId, ...transactionData } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!farmId) {
        res.status(400).json({
          success: false,
          message: 'Farm ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const completeTransactionData = {
        ...transactionData,
        farmId,
        createdById: userId,
        recordedById: userId
      };

      const transaction = await this.financeService.createTransaction(completeTransactionData);

      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Transaction created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create transaction',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const farmId = req.farm?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!farmId) {
        res.status(400).json({
          success: false,
          message: 'Farm ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const type = req.query.type as FinanceTransactionType;
      const category = req.query.category as string;
      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;
      const status = req.query.status as string;

      const transactions = await this.financeService.getTransactionsByFarm(farmId, {
        type,
        category_id: category,
        start_date: dateFrom,
        end_date: dateTo,
        limit,
        page,
        farm_id: farmId
      });

      // Get total count for pagination
      const totalTransactions = await this.financeService.getTransactionsByFarm(farmId, {
        type,
        category_id: category,
        start_date: dateFrom,
        end_date: dateTo,
        farm_id: farmId
      });

      const result = {
        transactions,
        total: totalTransactions.length
      };

      res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getTransactionById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const farmId = req.farm?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!farmId) {
        res.status(400).json({
          success: false,
          message: 'Farm ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const transaction = await this.financeService.getTransactionByIdAndFarm(id, farmId);

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: transaction,
        message: 'Transaction retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting transaction by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve transaction',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  async updateTransaction(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { farmId, ...updateData } = req.body;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!farmId) {
        res.status(400).json({
          success: false,
          message: 'Farm ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const completeUpdateData = {
        ...updateData,
        updatedById: userId
      };

      const transaction = await this.financeService.updateTransactionByFarm(id, completeUpdateData, farmId);

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
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update transaction',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  deleteTransaction = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const farmId = req.farm?.id;
      const { id } = req.params;
      
      if (!userId || !farmId) {
        res.status(401).json({ error: 'User not authenticated or no farm selected' });
        return;
      }
      
      await this.financeService.deleteTransactionByFarm(id, farmId);

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

  async getCategories(req: Request, res: Response) {
    try {
      const farmId = req.query.farmId as string;

      if (!farmId) {
        res.status(400).json({
          success: false,
          message: 'Farm ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const categories = await this.financeService.getCategoriesByFarm(farmId);

      res.status(200).json({
        success: true,
        data: categories,
        message: 'Categories retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Account Management
  createAccount = async (req: Request, res: Response, next: NextFunction) => {
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

  getAccounts = async (req: Request, res: Response, next: NextFunction) => {
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

  getAccountById = async (req: Request, res: Response, next: NextFunction) => {
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

  updateAccount = async (req: Request, res: Response, next: NextFunction) => {
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
  createInvoice = async (req: Request, res: Response, next: NextFunction) => {
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

  getInvoices = async (req: Request, res: Response, next: NextFunction) => {
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

  getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
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

  updateInvoice = async (req: Request, res: Response, next: NextFunction) => {
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

  sendInvoice = async (req: Request, res: Response, next: NextFunction) => {
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
  recordPayment = async (req: Request, res: Response, next: NextFunction) => {
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

  getPayments = async (req: Request, res: Response, next: NextFunction) => {
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
  createBudget = async (req: Request, res: Response, next: NextFunction) => {
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

  getBudgets = async (req: Request, res: Response, next: NextFunction) => {
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

  getBudgetById = async (req: Request, res: Response, next: NextFunction) => {
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

  updateBudgetActuals = async (req: Request, res: Response, next: NextFunction) => {
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
  ) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new BadRequestError('Start date and end date are required');
      }

      const report = await this.financeService.generateProfitLossReport(
        new Date(startDate as string),
        new Date(endDate as string),
        req.user!.id,
        req.farm?.id!,
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
  ) => {
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
  ) => {
    try {
      const { date } = req.query;

      const reportDate = date ? new Date(date as string) : new Date();
      const report = await this.financeService.generateCashFlowReport(reportDate, req.user!.id, req.farm?.id!);

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
  getFinancialOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;

      const overview = await this.financeService.getFinancialOverview(
        req.farm?.id!,
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
