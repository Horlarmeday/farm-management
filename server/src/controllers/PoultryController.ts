import { NextFunction, Request, Response } from 'express';
import { PoultryService } from '../services/PoultryService';
import { ServiceFactory } from '../services/ServiceFactory';
import { ResponseHelper } from '../utils/response.helper';

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

      ResponseHelper.created(res, batch, 'Bird batch created successfully');
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

      ResponseHelper.success(res, batches, 'Bird batches retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getBirdBatchById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const batch = await this.poultryService.getBirdBatchById(id);

      ResponseHelper.success(res, batch, 'Bird batch retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  updateBirdBatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const batch = await this.poultryService.updateBirdBatch(id, req.body);

      ResponseHelper.success(res, batch, 'Bird batch updated successfully');
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

      ResponseHelper.created(res, feedingLog, 'Feeding recorded successfully');
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

      ResponseHelper.success(res, logs, 'Feeding logs retrieved successfully');
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

      ResponseHelper.created(res, healthRecord, 'Health event recorded successfully');
    } catch (error) {
      next(error);
    }
  };

  getHealthRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batchId, type } = req.query;

      const records = await this.poultryService.getHealthRecords(batchId as string, type as string);

      ResponseHelper.success(res, records, 'Health records retrieved successfully');
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

      ResponseHelper.created(res, production, 'Egg production recorded successfully');
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

      ResponseHelper.success(res, logs, 'Egg production logs retrieved successfully');
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

      ResponseHelper.created(res, sale, 'Sale recorded successfully');
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

      ResponseHelper.success(res, sales, 'Sales retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // Analytics and Reports
  getBatchPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const performance = await this.poultryService.getBatchPerformanceReport(id);

      ResponseHelper.success(res, performance, 'Batch performance retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // Note: These analytics methods are not implemented in PoultryService yet
  // They can be added later when needed
}
