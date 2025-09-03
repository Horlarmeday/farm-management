import { ApiResponse, PondStatus, PondType } from '@kuyash/shared';
import { NextFunction, Request, Response } from 'express';
import { FisheryService } from '../services/FisheryService';
import { ServiceFactory } from '../services/ServiceFactory';

export class FisheryController {
  private fisheryService: FisheryService;

  constructor() {
    const serviceFactory = ServiceFactory.getInstance();
    this.fisheryService = serviceFactory.getFisheryService();
  }

  // Pond Management
  createPond = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pond = await this.fisheryService.createPond({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Pond created successfully',
        data: pond,
      } as ApiResponse<typeof pond>);
    } catch (error) {
      next(error);
    }
  };

  getPonds = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { pondType, status, location, minArea, maxArea, search } = req.query;

      const ponds = await this.fisheryService.getPonds({
        type: pondType as PondType,
        status: status as PondStatus,
        location: location as string,
        minArea: parseInt(minArea as string),
        maxArea: parseInt(maxArea as string),
        search: search as string,
      });

      res.json({
        success: true,
        message: 'Ponds retrieved successfully',
        data: ponds,
      } as ApiResponse<typeof ponds>);
    } catch (error) {
      next(error);
    }
  };

  getPondById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pond = await this.fisheryService.getPondById(id);

      res.json({
        success: true,
        message: 'Pond retrieved successfully',
        data: pond,
      } as ApiResponse<typeof pond>);
    } catch (error) {
      next(error);
    }
  };

  updatePond = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pond = await this.fisheryService.updatePond(id, req.body);

      res.json({
        success: true,
        message: 'Pond updated successfully',
        data: pond,
      } as ApiResponse<typeof pond>);
    } catch (error) {
      next(error);
    }
  };

  // Fish Stocking
  stockFish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stocking = await this.fisheryService.stockFish({
        ...req.body,
        recordedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Fish stocked successfully',
        data: stocking,
      } as ApiResponse<typeof stocking>);
    } catch (error) {
      next(error);
    }
  };

  getStockingRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { pondId, species, startDate, endDate } = req.query;

      const records = await this.fisheryService.getFishStocks(pondId as string, species as string);

      res.json({
        success: true,
        message: 'Stocking records retrieved successfully',
        data: records,
      } as ApiResponse<typeof records>);
    } catch (error) {
      next(error);
    }
  };

  // Feeding Management
  recordFeeding = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const feedingLog = await this.fisheryService.recordFishFeeding({
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
      const { pondId, startDate, endDate } = req.query;

      const logs = await this.fisheryService.getFeedingLogs(
        pondId as string,
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

  // Water Quality Management
  recordWaterQuality = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const waterQuality = await this.fisheryService.recordWaterQuality({
        ...req.body,
        recordedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Water quality recorded successfully',
        data: waterQuality,
      } as ApiResponse<typeof waterQuality>);
    } catch (error) {
      next(error);
    }
  };

  getWaterQualityLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { pondId, startDate, endDate } = req.query;

      const logs = await this.fisheryService.getWaterQualityLogs(
        pondId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      res.json({
        success: true,
        message: 'Water quality logs retrieved successfully',
        data: logs,
      } as ApiResponse<typeof logs>);
    } catch (error) {
      next(error);
    }
  };

  // Fish Sampling
  recordSampling = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sampling = await this.fisheryService.recordFishSampling({
        ...req.body,
        recordedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Fish sampling recorded successfully',
        data: sampling,
      } as ApiResponse<typeof sampling>);
    } catch (error) {
      next(error);
    }
  };

  getSamplingLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { pondId, startDate, endDate } = req.query;

      const logs = await this.fisheryService.getFishSamplingLogs(
        pondId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      res.json({
        success: true,
        message: 'Sampling logs retrieved successfully',
        data: logs,
      } as ApiResponse<typeof logs>);
    } catch (error) {
      next(error);
    }
  };

  // Harvesting
  recordHarvest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const harvest = await this.fisheryService.recordHarvest({
        ...req.body,
        recordedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Harvest recorded successfully',
        data: harvest,
      } as ApiResponse<typeof harvest>);
    } catch (error) {
      next(error);
    }
  };

  getHarvestRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { pondId, startDate, endDate } = req.query;

      const records = await this.fisheryService.getHarvests(
        pondId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      res.json({
        success: true,
        message: 'Harvest records retrieved successfully',
        data: records,
      } as ApiResponse<typeof records>);
    } catch (error) {
      next(error);
    }
  };

  // Sales Management
  recordSale = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sale = await this.fisheryService.recordFishSale({
        ...req.body,
        soldById: req.user!.id,
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
      const { pondId, startDate, endDate } = req.query;

      const sales = await this.fisheryService.getFishSales(
        pondId as string,
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
  getPondPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const performance = await this.fisheryService.getPondPerformanceReport(id);

      res.json({
        success: true,
        message: 'Pond performance retrieved successfully',
        data: performance,
      } as ApiResponse<typeof performance>);
    } catch (error) {
      next(error);
    }
  };
}
