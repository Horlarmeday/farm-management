import {
  BirdStatus,
  BirdType,
  FinanceTransactionType,
  PaymentMethod,
  TransactionType,
} from '@kuyash/shared';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { BirdBatch } from '../entities/BirdBatch';
import { BirdFeedingLog } from '../entities/BirdFeedingLog';
import { BirdHealthRecord } from '../entities/BirdHealthRecord';
import { BirdSale } from '../entities/BirdSale';
import { EggProductionLog } from '../entities/EggProductionLog';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { FinanceService } from './FinanceService';
import { InventoryService } from './InventoryService';
import { NotificationService } from './NotificationService';
import { ServiceFactory } from './ServiceFactory';

// Service interfaces to avoid circular dependencies
interface IInventoryService {
  getInventoryItemByName(name: string): Promise<any>;
  recordTransaction(data: any): Promise<any>;
}

interface IFinanceService {
  createTransaction(data: any): Promise<any>;
}

interface INotificationService {
  createNotification(data: any): Promise<any>;
}

export class PoultryService {
  private birdBatchRepository: Repository<BirdBatch>;
  private birdFeedingLogRepository: Repository<BirdFeedingLog>;
  private birdHealthRecordRepository: Repository<BirdHealthRecord>;
  private birdSaleRepository: Repository<BirdSale>;
  private eggProductionLogRepository: Repository<EggProductionLog>;
  private inventoryService: InventoryService;
  private financeService: FinanceService;
  private notificationService: NotificationService;

  constructor() {
    this.birdBatchRepository = AppDataSource.getRepository(BirdBatch);
    this.birdFeedingLogRepository = AppDataSource.getRepository(BirdFeedingLog);
    this.birdHealthRecordRepository = AppDataSource.getRepository(BirdHealthRecord);
    this.birdSaleRepository = AppDataSource.getRepository(BirdSale);
    this.eggProductionLogRepository = AppDataSource.getRepository(EggProductionLog);

    // Use ServiceFactory for dependency injection
    const serviceFactory = ServiceFactory.getInstance();
    this.inventoryService = serviceFactory.getInventoryService();
    this.financeService = serviceFactory.getFinanceService();
    this.notificationService = serviceFactory.getNotificationService();
  }

  // Bird Batch Management
  async createBirdBatch(batchData: {
    batchCode: string;
    birdType: BirdType;
    breed: string;
    quantity: number;
    arrivalDate: Date;
    source: string;
    locationId: string;
    unitCost?: number;
    totalCost?: number;
    notes?: string;
    assignedUserId?: string;
    createdById: string;
  }): Promise<BirdBatch> {
    const batch = this.birdBatchRepository.create({
      batchCode: batchData.batchCode,
      birdType: batchData.birdType,
      breed: batchData.breed,
      quantity: batchData.quantity,
      currentQuantity: batchData.quantity,
      remainingQuantity: batchData.quantity,
      arrivalDate: batchData.arrivalDate,
      source: batchData.source,
      locationId: batchData.locationId,
      unitCost: batchData.unitCost,
      totalCost: batchData.totalCost,
      notes: batchData.notes,
      assignedUserId: batchData.assignedUserId,
      status: BirdStatus.ACTIVE,
    });

    const savedBatch = await this.birdBatchRepository.save(batch);

    // Record initial expense if finance service is available
    if (this.financeService && batchData.totalCost) {
      try {
        await this.financeService.createTransaction({
          type: FinanceTransactionType.EXPENSE,
          amount: batchData.totalCost,
          description: `Bird batch purchase - ${batchData.batchCode}`,
          category_id: 'feed',
          date: batchData.arrivalDate,
          paymentMethod: PaymentMethod.CASH,
          referenceType: 'BIRD_BATCH',
          referenceId: savedBatch.id,
          recordedById: batchData.createdById,
        });
      } catch (error) {
        console.warn('Failed to record bird batch expense:', error);
      }
    }

    return savedBatch;
  }

  async getBirdBatches(filters?: {
    status?: BirdStatus;
    birdType?: BirdType;
    locationId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<BirdBatch[]> {
    const query = this.birdBatchRepository.createQueryBuilder('batch');

    if (filters?.status) {
      query.andWhere('batch.status = :status', { status: filters.status });
    }

    if (filters?.birdType) {
      query.andWhere('batch.birdType = :birdType', { birdType: filters.birdType });
    }

    if (filters?.locationId) {
      query.andWhere('batch.locationId = :locationId', { locationId: filters.locationId });
    }

    if (filters?.startDate) {
      query.andWhere('batch.arrivalDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('batch.arrivalDate <= :endDate', { endDate: filters.endDate });
    }

    return query.getMany();
  }

  async getBirdBatchById(id: string): Promise<BirdBatch> {
    const batch = await this.birdBatchRepository.findOne({
      where: { id },
      relations: ['location', 'assignedUser'],
    });

    if (!batch) {
      throw new NotFoundError('Bird batch not found');
    }

    return batch;
  }

  async updateBirdBatch(id: string, updates: Partial<BirdBatch>): Promise<BirdBatch> {
    const batch = await this.getBirdBatchById(id);
    Object.assign(batch, updates);
    return this.birdBatchRepository.save(batch);
  }

  // Feeding Management
  async recordFeeding(feedingData: {
    batchId: string;
    feedType: string;
    quantityKg: number;
    feedingTime: Date;
    notes?: string;
    recordedById: string;
  }): Promise<BirdFeedingLog> {
    const batch = await this.getBirdBatchById(feedingData.batchId);

    // Check if enough feed is available in inventory if inventory service is available
    if (this.inventoryService) {
      try {
        const feedInventory = await this.inventoryService.getInventoryItemByName(
          feedingData.feedType,
        );
        if (feedInventory && feedInventory.currentStock < feedingData.quantityKg) {
          throw new BadRequestError(
            `Insufficient feed stock. Available: ${feedInventory.currentStock}kg, Required: ${feedingData.quantityKg}kg`,
          );
        }

        // Update inventory
        if (feedInventory) {
          await this.inventoryService.recordTransaction({
            itemId: feedInventory.id,
            type: TransactionType.USAGE,
            quantity: feedingData.quantityKg,
            reason: `Fed to batch ${batch.batchCode}`,
            userId: feedingData.recordedById,
          });
        }
      } catch (error) {
        console.warn('Inventory service not available or error occurred:', error);
        // Continue without inventory integration if service is not available
      }
    }

    const feedingLog = this.birdFeedingLogRepository.create({
      date: feedingData.feedingTime,
      feedType: feedingData.feedType,
      quantityKg: feedingData.quantityKg,
      remarks: feedingData.notes,
      birdBatchId: batch.id,
      birdBatch: batch,
    });

    const savedLog = await this.birdFeedingLogRepository.save(feedingLog);

    // Update batch last feeding time
    await this.updateBirdBatch(batch.id, {
      lastFeedingDate: feedingData.feedingTime,
      totalFeedConsumed: (batch.totalFeedConsumed || 0) + feedingData.quantityKg,
    });

    return savedLog;
  }

  async getFeedingLogs(
    batchId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<BirdFeedingLog[]> {
    const query = this.birdFeedingLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.birdBatch', 'birdBatch')
      .where('log.birdBatchId = :batchId', { batchId });

    if (startDate) {
      query.andWhere('log.date >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('log.date <= :endDate', { endDate });
    }

    return query.orderBy('log.date', 'DESC').getMany();
  }

  // Health Management
  async recordHealthActivity(healthData: {
    batchId: string;
    type: string;
    description: string;
    treatment?: string;
    cost?: number;
    veterinarian?: string;
    medicationUsed?: string;
    quantityUsed?: number;
    date?: Date;
    recordedById: string;
  }): Promise<BirdHealthRecord> {
    const batch = await this.getBirdBatchById(healthData.batchId);

    const healthRecord = this.birdHealthRecordRepository.create({
      date: healthData.date || new Date(),
      type: healthData.type,
      description: healthData.description,
      treatment: healthData.treatment,
      cost: healthData.cost,
      veterinarian: healthData.veterinarian,
      medicationUsed: healthData.medicationUsed,
      quantityUsed: healthData.quantityUsed,
      birdBatchId: batch.id,
      birdBatch: batch,
    });

    const savedRecord = await this.birdHealthRecordRepository.save(healthRecord);

    // Handle mortality if type is mortality
    if (healthData.type === 'mortality' && healthData.quantityUsed) {
      const mortalityCount = healthData.quantityUsed;
      const currentRemaining = batch.remainingQuantity || batch.currentQuantity;

      await this.updateBirdBatch(batch.id, {
        currentQuantity: batch.currentQuantity - mortalityCount,
        remainingQuantity: currentRemaining - mortalityCount,
        totalMortality: (batch.totalMortality || 0) + mortalityCount,
      });
    }

    // Handle medication inventory if inventory service is available
    if (this.inventoryService && healthData.medicationUsed && healthData.quantityUsed) {
      try {
        const medication = await this.inventoryService.getInventoryItemByName(
          healthData.medicationUsed,
        );
        if (medication) {
          await this.inventoryService.recordTransaction({
            itemId: medication.id,
            type: TransactionType.USAGE,
            quantity: healthData.quantityUsed,
            reason: `${healthData.type} for batch ${batch.batchCode}`,
            userId: healthData.recordedById,
          });
        }
      } catch (error) {
        console.warn('Failed to update medication inventory:', error);
      }
    }

    // Record health expense if finance service is available
    if (this.financeService && healthData.cost && healthData.cost > 0) {
      try {
        await this.financeService.createTransaction({
          type: FinanceTransactionType.EXPENSE,
          amount: healthData.cost,
          description: `${healthData.type} - ${batch.batchCode}: ${healthData.description}`,
          category_id: 'veterinary',
          date: healthData.date || new Date(),
          paymentMethod: PaymentMethod.CASH,
          referenceType: 'HEALTH_RECORD',
          referenceId: savedRecord.id,
          recordedById: healthData.recordedById,
        });
      } catch (error) {
        console.warn('Failed to record health expense:', error);
      }
    }

    return savedRecord;
  }

  async getHealthRecords(batchId: string, type?: string): Promise<BirdHealthRecord[]> {
    const query = this.birdHealthRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.birdBatch', 'birdBatch')
      .where('record.birdBatchId = :batchId', { batchId });

    if (type) {
      query.andWhere('record.type = :type', { type });
    }

    return query.orderBy('record.date', 'DESC').getMany();
  }

  // Egg Production Management
  async recordEggProduction(productionData: {
    batchId: string;
    productionDate: Date;
    gradeA: number;
    gradeB: number;
    gradeC: number;
    cracked: number;
    totalEggs: number;
    notes?: string;
    recordedById: string;
  }): Promise<EggProductionLog> {
    const batch = await this.getBirdBatchById(productionData.batchId);

    if (batch.birdType !== BirdType.LAYER) {
      throw new BadRequestError('Egg production can only be recorded for layer birds');
    }

    const productionLog = this.eggProductionLogRepository.create({
      date: productionData.productionDate,
      totalEggs: productionData.totalEggs,
      gradeA: productionData.gradeA,
      gradeB: productionData.gradeB,
      gradeC: productionData.gradeC,
      cracked: productionData.cracked,
      notes: productionData.notes,
      birdBatchId: batch.id,
      birdBatch: batch,
    });

    const savedLog = await this.eggProductionLogRepository.save(productionLog);

    // Update batch totals
    await this.updateBirdBatch(batch.id, {
      totalEggsProduced: (batch.totalEggsProduced || 0) + productionData.totalEggs,
      lastEggProductionDate: productionData.productionDate,
    });

    // Calculate feed conversion ratio if applicable
    if (batch.totalFeedConsumed && batch.totalEggsProduced) {
      const fcr = batch.totalFeedConsumed / (batch.totalEggsProduced * 0.065); // Assuming 65g per egg
      await this.updateBirdBatch(batch.id, { feedConversionRatio: fcr });
    }

    return savedLog;
  }

  async getEggProductionLogs(
    batchId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<EggProductionLog[]> {
    const query = this.eggProductionLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.birdBatch', 'birdBatch')
      .where('log.birdBatchId = :batchId', { batchId });

    if (startDate) {
      query.andWhere('log.date >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('log.date <= :endDate', { endDate });
    }

    return query.orderBy('log.date', 'DESC').getMany();
  }

  // Sales Management
  async recordBirdSale(saleData: {
    batchId: string;
    saleDate: Date;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    buyerName: string;
    buyerContact?: string;
    notes?: string;
    recordedById: string;
  }): Promise<BirdSale> {
    const batch = await this.getBirdBatchById(saleData.batchId);

    const currentRemaining = batch.remainingQuantity || batch.currentQuantity;
    if (currentRemaining < saleData.quantity) {
      throw new BadRequestError(
        `Insufficient birds. Available: ${currentRemaining}, Requested: ${saleData.quantity}`,
      );
    }

    const sale = this.birdSaleRepository.create({
      date: saleData.saleDate,
      quantity: saleData.quantity,
      unitPrice: saleData.unitPrice,
      totalAmount: saleData.totalAmount,
      buyerName: saleData.buyerName,
      buyerContact: saleData.buyerContact,
      notes: saleData.notes,
      birdBatchId: batch.id,
      birdBatch: batch,
    });

    const savedSale = await this.birdSaleRepository.save(sale);

    // Update batch quantities
    await this.updateBirdBatch(batch.id, {
      remainingQuantity: currentRemaining - saleData.quantity,
      totalSales: (batch.totalSales || 0) + saleData.totalAmount,
    });

    // Record income if finance service is available
    if (this.financeService) {
      try {
        await this.financeService.createTransaction({
          type: FinanceTransactionType.INCOME,
          amount: saleData.totalAmount,
          description: `Bird sale - ${saleData.quantity} birds from batch ${batch.batchCode}`,
          category_id: 'bird_sales',
          date: saleData.saleDate,
          paymentMethod: PaymentMethod.CASH,
          referenceType: 'BIRD_SALE',
          referenceId: savedSale.id,
          recordedById: saleData.recordedById,
        });
      } catch (error) {
        console.warn('Failed to record bird sale revenue:', error);
      }
    }

    return savedSale;
  }

  async getSales(batchId?: string, startDate?: Date, endDate?: Date): Promise<BirdSale[]> {
    const query = this.birdSaleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.birdBatch', 'birdBatch');

    if (batchId) {
      query.where('sale.birdBatchId = :batchId', { batchId });
    }

    if (startDate) {
      query.andWhere('sale.date >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('sale.date <= :endDate', { endDate });
    }

    return query.orderBy('sale.date', 'DESC').getMany();
  }

  // Analytics and Reporting
  async getBatchPerformanceReport(batchId: string): Promise<{
    batch: BirdBatch;
    totalFeedCost: number;
    totalMedicationCost: number;
    totalProductionRevenue: number;
    totalSalesRevenue: number;
    profitLoss: number;
    averageEggProduction: number;
    mortalityRate: number;
    feedConversionRatio: number;
  }> {
    const batch = await this.getBirdBatchById(batchId);

    // Calculate costs and revenues
    const feedCost = await this.calculateFeedCosts(batchId);
    const medicationCost = await this.calculateMedicationCosts(batchId);
    const productionRevenue = await this.calculateProductionRevenue(batchId);
    const salesRevenue = batch.totalSales || 0;

    const totalCosts = (batch.totalCost || 0) + feedCost + medicationCost;
    const totalRevenue = productionRevenue + salesRevenue;
    const profitLoss = totalRevenue - totalCosts;

    // Calculate performance metrics
    const averageEggProduction = await this.calculateAverageEggProduction(batchId);
    const mortalityRate = ((batch.totalMortality || 0) / batch.quantity) * 100;

    return {
      batch,
      totalFeedCost: feedCost,
      totalMedicationCost: medicationCost,
      totalProductionRevenue: productionRevenue,
      totalSalesRevenue: salesRevenue,
      profitLoss,
      averageEggProduction,
      mortalityRate,
      feedConversionRatio: batch.feedConversionRatio || 0,
    };
  }

  private async calculateFeedCosts(batchId: string): Promise<number> {
    const feedingLogs = await this.getFeedingLogs(batchId);
    let totalCost = 0;

    if (this.inventoryService) {
      for (const log of feedingLogs) {
        try {
          const feedItem = await this.inventoryService.getInventoryItemByName(log.feedType);
          if (feedItem) {
            totalCost += log.quantityKg * (feedItem.unitCost || 0);
          }
        } catch (error) {
          console.warn('Failed to get feed cost for:', log.feedType);
        }
      }
    }

    return totalCost;
  }

  private async calculateMedicationCosts(batchId: string): Promise<number> {
    const healthRecords = await this.getHealthRecords(batchId);
    let totalCost = 0;

    if (this.inventoryService) {
      for (const record of healthRecords) {
        if (record.medicationUsed && record.quantityUsed) {
          try {
            const medication = await this.inventoryService.getInventoryItemByName(
              record.medicationUsed,
            );
            if (medication) {
              totalCost += record.quantityUsed * (medication.unitCost || 0);
            }
          } catch (error) {
            console.warn('Failed to get medication cost for:', record.medicationUsed);
          }
        }
      }
    }

    return totalCost;
  }

  private async calculateProductionRevenue(batchId: string): Promise<number> {
    const productionLogs = await this.getEggProductionLogs(batchId);
    let totalRevenue = 0;

    // Assuming standard egg prices - this could be made configurable
    const eggPrices = { gradeA: 0.25, gradeB: 0.2, gradeC: 0.15, cracked: 0.1 };

    for (const log of productionLogs) {
      totalRevenue +=
        log.gradeA * eggPrices.gradeA +
        log.gradeB * eggPrices.gradeB +
        log.gradeC * eggPrices.gradeC +
        log.cracked * eggPrices.cracked;
    }

    return totalRevenue;
  }

  private async calculateAverageEggProduction(batchId: string): Promise<number> {
    const productionLogs = await this.getEggProductionLogs(batchId);

    if (productionLogs.length === 0) return 0;

    const totalEggs = productionLogs.reduce((sum, log) => sum + log.totalEggs, 0);
    return totalEggs / productionLogs.length;
  }

  // Utility methods
  async getProductionSummary(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalBatches: number;
    activeBatches: number;
    totalBirds: number;
    totalEggProduction: number;
    totalSales: number;
    totalRevenue: number;
    averageMortalityRate: number;
  }> {
    const query = this.birdBatchRepository.createQueryBuilder('batch');

    if (startDate) {
      query.andWhere('batch.arrivalDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('batch.arrivalDate <= :endDate', { endDate });
    }

    const batches = await query.getMany();

    const totalBatches = batches.length;
    const activeBatches = batches.filter((b) => b.status === BirdStatus.ACTIVE).length;
    const totalBirds = batches.reduce((sum, b) => sum + b.quantity, 0);
    const totalEggProduction = batches.reduce((sum, b) => sum + (b.totalEggsProduced || 0), 0);
    const totalSales = batches.reduce((sum, b) => sum + (b.totalSales || 0), 0);
    const totalRevenue = totalSales; // Could include egg sales revenue

    const totalMortality = batches.reduce((sum, b) => sum + (b.totalMortality || 0), 0);
    const averageMortalityRate = totalBirds > 0 ? (totalMortality / totalBirds) * 100 : 0;

    return {
      totalBatches,
      activeBatches,
      totalBirds,
      totalEggProduction,
      totalSales,
      totalRevenue,
      averageMortalityRate,
    };
  }
}
