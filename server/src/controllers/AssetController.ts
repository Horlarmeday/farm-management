import { ApiResponse } from '@kuyash/shared';
import { NextFunction, Request, Response } from 'express';
import { AssetService } from '../services/AssetService';
import { ServiceFactory } from '../services/ServiceFactory';

export class AssetController {
  private assetService: AssetService;

  constructor() {
    const serviceFactory = ServiceFactory.getInstance();
    this.assetService = serviceFactory.getAssetService();
  }

  // Asset Management
  createAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const asset = await this.assetService.createAsset({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Asset created successfully',
        data: asset,
      } as ApiResponse<typeof asset>);
    } catch (error) {
      next(error);
    }
  };

  getAssets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, status, locationId, condition, manufacturer } = req.query;

      const assets = await this.assetService.getAssets({
        type: type as any,
        status: status as any,
        locationId: locationId as string,
        condition: condition as string,
        manufacturer: manufacturer as string,
      });

      res.json({
        success: true,
        message: 'Assets retrieved successfully',
        data: assets,
      } as ApiResponse<typeof assets>);
    } catch (error) {
      next(error);
    }
  };

  getAssetById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const asset = await this.assetService.getAssetById(id);

      res.json({
        success: true,
        message: 'Asset retrieved successfully',
        data: asset,
      } as ApiResponse<typeof asset>);
    } catch (error) {
      next(error);
    }
  };

  updateAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const asset = await this.assetService.updateAsset(id, req.body);

      res.json({
        success: true,
        message: 'Asset updated successfully',
        data: asset,
      } as ApiResponse<typeof asset>);
    } catch (error) {
      next(error);
    }
  };

  // Maintenance Management
  scheduleMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const maintenance = await this.assetService.scheduleMaintenance({
        ...req.body,
        scheduledById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Maintenance scheduled successfully',
        data: maintenance,
      } as ApiResponse<typeof maintenance>);
    } catch (error) {
      next(error);
    }
  };

  getMaintenanceRecords = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { assetId, status, startDate, endDate } = req.query;

      const records = await this.assetService.getMaintenanceRecords(
        assetId as string,
        status as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      res.json({
        success: true,
        message: 'Maintenance records retrieved successfully',
        data: records,
      } as ApiResponse<typeof records>);
    } catch (error) {
      next(error);
    }
  };

  completeMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const maintenance = await this.assetService.recordMaintenanceCompletion(id, {
        ...req.body,
        recordedById: req.user!.id,
      });

      res.json({
        success: true,
        message: 'Maintenance completed successfully',
        data: maintenance,
      } as ApiResponse<typeof maintenance>);
    } catch (error) {
      next(error);
    }
  };

  getUpcomingMaintenance = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { daysAhead = '30' } = req.query;
      const maintenance = await this.assetService.getUpcomingMaintenance(
        parseInt(daysAhead as string),
      );

      res.json({
        success: true,
        message: 'Upcoming maintenance retrieved successfully',
        data: maintenance,
      } as ApiResponse<typeof maintenance>);
    } catch (error) {
      next(error);
    }
  };

  // Auxiliary Production Management
  recordAuxiliaryProduction = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const production = await this.assetService.recordAuxiliaryProduction({
        ...req.body,
        recordedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Auxiliary production recorded successfully',
        data: production,
      } as ApiResponse<typeof production>);
    } catch (error) {
      next(error);
    }
  };

  getAuxiliaryProduction = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { productionType, startDate, endDate } = req.query;

      const production = await this.assetService.getAuxiliaryProduction(
        productionType as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      res.json({
        success: true,
        message: 'Auxiliary production retrieved successfully',
        data: production,
      } as ApiResponse<typeof production>);
    } catch (error) {
      next(error);
    }
  };

  recordAuxiliaryDispatch = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dispatch = await this.assetService.recordAuxiliaryDispatch({
        ...req.body,
        recordedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Auxiliary dispatch recorded successfully',
        data: dispatch,
      } as ApiResponse<typeof dispatch>);
    } catch (error) {
      next(error);
    }
  };

  getAuxiliaryDispatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productionId, startDate, endDate } = req.query;

      const dispatch = await this.assetService.getAuxiliaryProduction(
        productionId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      res.json({
        success: true,
        message: 'Auxiliary dispatch retrieved successfully',
        data: dispatch,
      } as ApiResponse<typeof dispatch>);
    } catch (error) {
      next(error);
    }
  };

  getDepreciationReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { assetId, startDate, endDate } = req.query;

      const depreciation = await this.assetService.getDepreciationRecords(
        assetId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      res.json({
        success: true,
        message: 'Depreciation report retrieved successfully',
        data: depreciation,
      } as ApiResponse<typeof depreciation>);
    } catch (error) {
      next(error);
    }
  };

  getAssetPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const performance = await this.assetService.getAssetPerformanceReport(id);

      res.json({
        success: true,
        message: 'Asset performance retrieved successfully',
        data: performance,
      } as ApiResponse<typeof performance>);
    } catch (error) {
      next(error);
    }
  };

  getAuxiliaryProductionAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const analytics = await this.assetService.getAssetOverview();

      res.json({
        success: true,
        message: 'Auxiliary production analytics retrieved successfully',
        data: analytics,
      } as ApiResponse<typeof analytics>);
    } catch (error) {
      next(error);
    }
  };

  getMaintenanceAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const analytics = await this.assetService.getAssetOverview();

      res.json({
        success: true,
        message: 'Maintenance analytics retrieved successfully',
        data: analytics,
      } as ApiResponse<typeof analytics>);
    } catch (error) {
      next(error);
    }
  };

  getFinancialSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const summary = await this.assetService.getAssetOverview();

      res.json({
        success: true,
        message: 'Financial summary retrieved successfully',
        data: summary,
      } as ApiResponse<typeof summary>);
    } catch (error) {
      next(error);
    }
  };

  // Depreciation Management
  calculateDepreciation = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { assetId, depreciationDate } = req.body;
      const depreciation = await this.assetService.calculateDepreciation(
        assetId,
        new Date(depreciationDate),
      );

      res.json({
        success: true,
        message: 'Depreciation calculated successfully',
        data: depreciation,
      } as ApiResponse<typeof depreciation>);
    } catch (error) {
      next(error);
    }
  };

  // Note: These analytics methods are not implemented in AssetService yet
  // They can be added later when needed
}
