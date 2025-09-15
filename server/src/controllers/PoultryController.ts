import { ApiResponse } from '../../../shared/src/types';
import { NextFunction, Request, Response } from 'express';
import { PoultryService } from '../services/PoultryService';
import { ServiceFactory } from '../services/ServiceFactory';

export class PoultryController {
  private poultryService: PoultryService;

  constructor() {
    const serviceFactory = ServiceFactory.getInstance();
    this.poultryService = serviceFactory.getPoultryService();
  }

  // Bird Batch Management
  createBirdBatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const batch = await this.poultryService.createBirdBatch({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Bird batch created successfully',
        data: batch,
      } as ApiResponse<typeof batch>);
    } catch (error) {
      next(error);
    }
  };

  getBirdBatches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { birdType, status, locationId, startDate, endDate } = req.query;

      const batches = await this.poultryService.getBirdBatches({
        birdType: birdType as any,
        status: status as any,
        locationId: locationId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        message: 'Bird batches retrieved successfully',
        data: batches,
      } as ApiResponse<typeof batches>);
    } catch (error) {
      next(error);
    }
  };

  getBirdBatchById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const batch = await this.poultryService.getBirdBatchById(id);

      res.json({
        success: true,
        message: 'Bird batch retrieved successfully',
        data: batch,
      } as ApiResponse<typeof batch>);
    } catch (error) {
      next(error);
    }
  };

  updateBirdBatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const batch = await this.poultryService.updateBirdBatch(id, req.body);

      res.json({
        success: true,
        message: 'Bird batch updated successfully',
        data: batch,
      } as ApiResponse<typeof batch>);
    } catch (error) {
      next(error);
    }
  };

  // Feeding Management
  recordFeeding = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const feedingLog = await this.poultryService.recordFeeding({
        ...req.body,
        recordedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Feeding recorded successfully',
        data: feedingLog,
      } as ApiResponse<typeof feedingLog>);
    } catch (error) {
      next(error);
    }
  };

  getFeedingLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batchId, startDate, endDate } = req.query;

      const logs = await this.poultryService.getFeedingLogs(
        batchId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      res.json({
        success: true,
        message: 'Feeding logs retrieved successfully',
        data: logs,
      } as ApiResponse<typeof logs>);
    } catch (error) {
      next(error);
    }
  };

  // Health Management
  recordHealthEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const healthRecord = await this.poultryService.recordHealthActivity({
        ...req.body,
        recordedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Health event recorded successfully',
        data: healthRecord,
      } as ApiResponse<typeof healthRecord>);
    } catch (error) {
      next(error);
    }
  };

  getHealthRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batchId, type } = req.query;

      const records = await this.poultryService.getHealthRecords(batchId as string, type as string);

      res.json({
        success: true,
        message: 'Health records retrieved successfully',
        data: records,
      } as ApiResponse<typeof records>);
    } catch (error) {
      next(error);
    }
  };

  // Note: Vaccination scheduling methods are not implemented in PoultryService yet

  // Egg Production Management
  recordEggProduction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const production = await this.poultryService.recordEggProduction({
        ...req.body,
        recordedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Egg production recorded successfully',
        data: production,
      } as ApiResponse<typeof production>);
    } catch (error) {
      next(error);
    }
  };

  getEggProductionLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batchId, startDate, endDate } = req.query;

      const logs = await this.poultryService.getEggProductionLogs(
        batchId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      res.json({
        success: true,
        message: 'Egg production logs retrieved successfully',
        data: logs,
      } as ApiResponse<typeof logs>);
    } catch (error) {
      next(error);
    }
  };

  // Sales Management
  recordSale = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sale = await this.poultryService.recordBirdSale({
        ...req.body,
        recordedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Sale recorded successfully',
        data: sale,
      } as ApiResponse<typeof sale>);
    } catch (error) {
      next(error);
    }
  };

  getSales = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batchId, startDate, endDate } = req.query;

      const sales = await this.poultryService.getSales(
        batchId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      res.json({
        success: true,
        message: 'Sales retrieved successfully',
        data: sales,
      } as ApiResponse<typeof sales>);
    } catch (error) {
      next(error);
    }
  };

  // Analytics and Reports
  getBatchPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const performance = await this.poultryService.getBatchPerformanceReport(id);

      res.json({
        success: true,
        message: 'Batch performance retrieved successfully',
        data: performance,
      } as ApiResponse<typeof performance>);
    } catch (error) {
      next(error);
    }
  };

  // Note: These analytics methods are not implemented in PoultryService yet
  // They can be added later when needed
}
