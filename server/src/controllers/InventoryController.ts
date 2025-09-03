import { ApiResponse } from '@kuyash/shared';
import { NextFunction, Request, Response } from 'express';
import { InventoryService } from '../services/InventoryService';
import { ServiceFactory } from '../services/ServiceFactory';
import { BadRequestError } from '../utils/errors';

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    const serviceFactory = ServiceFactory.getInstance();
    this.inventoryService = serviceFactory.getInventoryService();
  }

  // Inventory Items
  createInventoryItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.inventoryService.createInventoryItem({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Inventory item created successfully',
        data: item,
      } as ApiResponse<typeof item>);
    } catch (error) {
      next(error);
    }
  };

  getInventoryItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, lowStock, location, supplierId, search } = req.query;

      const items = await this.inventoryService.getInventoryItems({
        category: category as any,
        lowStock: lowStock === 'true',
        location: location as string,
        supplierId: supplierId as string,
        search: search as string,
      });

      res.json({
        success: true,
        message: 'Inventory items retrieved successfully',
        data: items,
      } as ApiResponse<typeof items>);
    } catch (error) {
      next(error);
    }
  };

  getInventoryItemById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const item = await this.inventoryService.getInventoryItemById(id);

      res.json({
        success: true,
        message: 'Inventory item retrieved successfully',
        data: item,
      } as ApiResponse<typeof item>);
    } catch (error) {
      next(error);
    }
  };

  updateInventoryItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const item = await this.inventoryService.updateInventoryItem(id, req.body);

      res.json({
        success: true,
        message: 'Inventory item updated successfully',
        data: item,
      } as ApiResponse<typeof item>);
    } catch (error) {
      next(error);
    }
  };

  // Inventory Transactions
  recordTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transaction = await this.inventoryService.recordTransaction({
        ...req.body,
        userId: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Inventory transaction recorded successfully',
        data: transaction,
      } as ApiResponse<typeof transaction>);
    } catch (error) {
      next(error);
    }
  };

  getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { itemId, type, startDate, endDate } = req.query;

      const transactions = await this.inventoryService.getTransactions(
        itemId as string,
        type as any,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      res.json({
        success: true,
        message: 'Transactions retrieved successfully',
        data: transactions,
      } as ApiResponse<typeof transactions>);
    } catch (error) {
      next(error);
    }
  };

  adjustStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const item = await this.inventoryService.adjustStock(id, {
        ...req.body,
        userId: req.user!.id,
      });

      res.json({
        success: true,
        message: 'Stock adjusted successfully',
        data: item,
      } as ApiResponse<typeof item>);
    } catch (error) {
      next(error);
    }
  };

  // Suppliers
  createSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supplier = await this.inventoryService.createSupplier({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Supplier created successfully',
        data: supplier,
      } as ApiResponse<typeof supplier>);
    } catch (error) {
      next(error);
    }
  };

  getSuppliers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { active, city, country, search } = req.query;

      const suppliers = await this.inventoryService.getSuppliers({
        active: active ? active === 'true' : undefined,
        city: city as string,
        country: country as string,
        search: search as string,
      });

      res.json({
        success: true,
        message: 'Suppliers retrieved successfully',
        data: suppliers,
      } as ApiResponse<typeof suppliers>);
    } catch (error) {
      next(error);
    }
  };

  getSupplierById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const supplier = await this.inventoryService.getSupplierById(id);

      res.json({
        success: true,
        message: 'Supplier retrieved successfully',
        data: supplier,
      } as ApiResponse<typeof supplier>);
    } catch (error) {
      next(error);
    }
  };

  updateSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const supplier = await this.inventoryService.updateSupplier(id, req.body);

      res.json({
        success: true,
        message: 'Supplier updated successfully',
        data: supplier,
      } as ApiResponse<typeof supplier>);
    } catch (error) {
      next(error);
    }
  };

  // Purchase Orders
  createPurchaseOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.inventoryService.createPurchaseOrder({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Purchase order created successfully',
        data: order,
      } as ApiResponse<typeof order>);
    } catch (error) {
      next(error);
    }
  };

  getPurchaseOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, supplierId, startDate, endDate } = req.query;

      const orders = await this.inventoryService.getPurchaseOrders({
        status: status as any,
        supplierId: supplierId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        message: 'Purchase orders retrieved successfully',
        data: orders,
      } as ApiResponse<typeof orders>);
    } catch (error) {
      next(error);
    }
  };

  getPurchaseOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.inventoryService.getPurchaseOrderById(id);

      res.json({
        success: true,
        message: 'Purchase order retrieved successfully',
        data: order,
      } as ApiResponse<typeof order>);
    } catch (error) {
      next(error);
    }
  };

  receivePurchaseOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.inventoryService.receivePurchaseOrder(id, {
        ...req.body,
        receivedById: req.user!.id,
      });

      res.json({
        success: true,
        message: 'Purchase order received successfully',
        data: order,
      } as ApiResponse<typeof order>);
    } catch (error) {
      next(error);
    }
  };

  // Analytics and Reports
  getInventoryValuation = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const valuation = await this.inventoryService.getInventoryValuation();

      res.json({
        success: true,
        message: 'Inventory valuation retrieved successfully',
        data: valuation,
      } as ApiResponse<typeof valuation>);
    } catch (error) {
      next(error);
    }
  };

  getStockMovementReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new BadRequestError('Start date and end date are required');
      }

      const report = await this.inventoryService.getStockMovementReport(
        new Date(startDate as string),
        new Date(endDate as string),
      );

      res.json({
        success: true,
        message: 'Stock movement report generated successfully',
        data: report,
      } as ApiResponse<typeof report>);
    } catch (error) {
      next(error);
    }
  };

  generateReorderReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const report = await this.inventoryService.generateReorderReport();

      res.json({
        success: true,
        message: 'Reorder report generated successfully',
        data: report,
      } as ApiResponse<typeof report>);
    } catch (error) {
      next(error);
    }
  };

  checkExpiringItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { daysAhead = '30' } = req.query;
      const items = await this.inventoryService.checkExpiringItems(parseInt(daysAhead as string));

      res.json({
        success: true,
        message: 'Expiring items retrieved successfully',
        data: items,
      } as ApiResponse<typeof items>);
    } catch (error) {
      next(error);
    }
  };
}
