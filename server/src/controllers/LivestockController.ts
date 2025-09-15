import { ApiResponse } from '../../../shared/src/types';
import { NextFunction, Request, Response } from 'express';
import { LivestockService } from '../services/LivestockService';
import { ServiceFactory } from '../services/ServiceFactory';

export class LivestockController {
  private livestockService: LivestockService;

  constructor() {
    const serviceFactory = ServiceFactory.getInstance();
    this.livestockService = serviceFactory.getLivestockService();
  }

  // Animal Management
  createAnimal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const animal = await this.livestockService.createAnimal({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Animal created successfully',
        data: animal,
      } as ApiResponse<typeof animal>);
    } catch (error) {
      next(error);
    }
  };

  getAnimals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { species, breed, status, gender, minAge, maxAge } = req.query;

      const animals = await this.livestockService.getAnimals({
        species: species as any,
        breed: breed as string,
        status: status as any,
        gender: gender as 'male' | 'female',
        minAge: minAge ? parseInt(minAge as string) : undefined,
        maxAge: maxAge ? parseInt(maxAge as string) : undefined,
      });

      res.json({
        success: true,
        message: 'Animals retrieved successfully',
        data: animals,
      } as ApiResponse<typeof animals>);
    } catch (error) {
      next(error);
    }
  };

  getAnimalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const animal = await this.livestockService.getAnimalById(id);

      res.json({
        success: true,
        message: 'Animal retrieved successfully',
        data: animal,
      } as ApiResponse<typeof animal>);
    } catch (error) {
      next(error);
    }
  };

  updateAnimal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const animal = await this.livestockService.updateAnimal(id, req.body);

      res.json({
        success: true,
        message: 'Animal updated successfully',
        data: animal,
      } as ApiResponse<typeof animal>);
    } catch (error) {
      next(error);
    }
  };

  // Health Management
  recordHealthEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const healthRecord = await this.livestockService.recordHealthActivity({
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
      const { animalId, type } = req.query;

      const records = await this.livestockService.getHealthRecords(
        animalId as string,
        type as string,
      );

      res.json({
        success: true,
        message: 'Health records retrieved successfully',
        data: records,
      } as ApiResponse<typeof records>);
    } catch (error) {
      next(error);
    }
  };


  // Feeding Management
  recordFeeding = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const feedingLog = await this.livestockService.recordFeeding({
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
      const { animalId, startDate, endDate } = req.query;

      const logs = await this.livestockService.getFeedingLogs(
        animalId as string,
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

  // Breeding Management
  recordBreeding = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const breedingRecord = await this.livestockService.recordBreeding({
        ...req.body,
        recordedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Breeding recorded successfully',
        data: breedingRecord,
      } as ApiResponse<typeof breedingRecord>);
    } catch (error) {
      next(error);
    }
  };

  getBreedingRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { animalId, startDate, endDate } = req.query;

      const records = await this.livestockService.getBreedingRecords(
        animalId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      res.json({
        success: true,
        message: 'Breeding records retrieved successfully',
        data: records,
      } as ApiResponse<typeof records>);
    } catch (error) {
      next(error);
    }
  };

  recordBirth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { breedingRecordId, ...birthData } = req.body;
      const birthRecord = await this.livestockService.recordBirth(breedingRecordId, {
        ...birthData,
        recordedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Birth recorded successfully',
        data: birthRecord,
      } as ApiResponse<typeof birthRecord>);
    } catch (error) {
      next(error);
    }
  };

  // Production Management
  recordProduction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const production = await this.livestockService.recordProduction({
        ...req.body,
        recordedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Production recorded successfully',
        data: production,
      } as ApiResponse<typeof production>);
    } catch (error) {
      next(error);
    }
  };

  getProductionLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { animalId, startDate, endDate } = req.query;

      const logs = await this.livestockService.getProductionLogs(
        animalId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      res.json({
        success: true,
        message: 'Production logs retrieved successfully',
        data: logs,
      } as ApiResponse<typeof logs>);
    } catch (error) {
      next(error);
    }
  };

  // Sales Management
  recordSale = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sale = await this.livestockService.recordAnimalSale({
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
      const { animalId, startDate, endDate } = req.query;

      const sales = await this.livestockService.getSales(
        animalId as string,
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
  getAnimalPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const performance = await this.livestockService.getAnimalPerformanceReport(id);

      res.json({
        success: true,
        message: 'Animal performance retrieved successfully',
        data: performance,
      } as ApiResponse<typeof performance>);
    } catch (error) {
      next(error);
    }
  };

  // Note: These analytics methods are not implemented in LivestockService yet
  // They can be added later when needed
}
