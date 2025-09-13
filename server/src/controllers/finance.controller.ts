import { Request, Response } from 'express';
import { FinanceService } from '../services/FinanceService';
import { CreateTransactionDto, GetTransactionsQueryDto } from '../types/finance.types';
import { authenticateToken } from '../middleware/auth';

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
    console.log('🚀🚀🚀 CONTROLLER METHOD STARTED - FIRST LINE 🚀🚀🚀');
    console.log('🚀 CONTROLLER METHOD STARTED');
    try {
      console.log('=== CREATE TRANSACTION DEBUG ===');
      console.log('req.user:', req.user);
      console.log('req.body:', req.body);
      
      const userId = (req as any).user?.id;
      const farmId = (req as any).user?.farmId;

      if (!userId || !farmId) {
        res.status(401).json({ error: 'User not authenticated or no farm selected' });
        return;
      }

      const transaction = await this.financeService.createTransactionWithFarm(
        req.body,
        farmId,
        userId
      );
      res.status(201).json(transaction);
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  };

  /**
   * Get financial transactions with filtering and pagination
   */
  getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const farmId = (req as any).user?.farmId;

      if (!userId || !farmId) {
        res.status(401).json({ error: 'User not authenticated or no farm selected' });
        return;
      }

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
        totalPages: Math.ceil(transactions.length / (queryParams.limit || 20))
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
      const userId = (req as any).user?.id;
      const farmId = (req as any).user?.farmId;
      const transactionId = req.params.id;

      if (!userId || !farmId) {
        res.status(401).json({ error: 'User not authenticated or no farm selected' });
        return;
      }

      const transaction = await this.financeService.getTransactionByIdAndFarm(transactionId, farmId);

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
      const userId = (req as any).user?.id;
      const farmId = (req as any).user?.farmId;
      const transactionId = req.params.id;

      if (!userId || !farmId) {
        res.status(401).json({ error: 'User not authenticated or no farm selected' });
        return;
      }

      const updateData = req.body;
      const transaction = await this.financeService.updateTransactionByFarm(transactionId, farmId, updateData);

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
      const userId = (req as any).user?.id;
      const farmId = (req as any).user?.farmId;
      const transactionId = req.params.id;

      if (!userId || !farmId) {
        res.status(401).json({ error: 'User not authenticated or no farm selected' });
        return;
      }

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
      const farmId = (req as any).user?.farmId;
      if (!farmId) {
        res.status(400).json({ success: false, error: 'Farm ID is required' });
        return;
      }

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
      const farmId = (req as any).user?.farmId;
      if (!farmId) {
        res.status(400).json({ success: false, error: 'Farm ID is required' });
        return;
      }

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
}