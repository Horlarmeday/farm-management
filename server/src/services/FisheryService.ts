import {
  FinanceTransactionType,
  NotificationType,
  PaymentMethod,
  PondStatus,
  PondType,
  TransactionType,
} from '../../../shared/src/types';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { FishFeedingLog } from '../entities/FishFeedingLog';
import { FishHarvest, HarvestType } from '../entities/FishHarvest';
import { FishHarvestLog } from '../entities/FishHarvestLog';
import { FishSale } from '../entities/FishSale';
import { FishSamplingLog } from '../entities/FishSamplingLog';
import { FishStock } from '../entities/FishStock';
import { Pond } from '../entities/Pond';
import { WaterQualityLog } from '../entities/WaterQualityLog';
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

export class FisheryService {
  private pondRepository: Repository<Pond>;
  private fishStockRepository: Repository<FishStock>;
  private fishFeedingLogRepository: Repository<FishFeedingLog>;
  private fishSamplingLogRepository: Repository<FishSamplingLog>;
  private fishHarvestRepository: Repository<FishHarvest>;
  private fishHarvestLogRepository: Repository<FishHarvestLog>;
  private fishSaleRepository: Repository<FishSale>;
  private waterQualityLogRepository: Repository<WaterQualityLog>;
  private inventoryService: InventoryService;
  private financeService: FinanceService;
  private notificationService: NotificationService;

  constructor() {
    this.pondRepository = AppDataSource.getRepository(Pond);
    this.fishStockRepository = AppDataSource.getRepository(FishStock);
    this.fishFeedingLogRepository = AppDataSource.getRepository(FishFeedingLog);
    this.fishSamplingLogRepository = AppDataSource.getRepository(FishSamplingLog);
    this.fishHarvestRepository = AppDataSource.getRepository(FishHarvest);
    this.fishHarvestLogRepository = AppDataSource.getRepository(FishHarvestLog);
    this.fishSaleRepository = AppDataSource.getRepository(FishSale);
    this.waterQualityLogRepository = AppDataSource.getRepository(WaterQualityLog);

    // Use ServiceFactory for dependency injection
    const serviceFactory = ServiceFactory.getInstance();
    this.inventoryService = serviceFactory.getInventoryService();
    this.financeService = serviceFactory.getFinanceService();
    this.notificationService = serviceFactory.getNotificationService();
  }

  // Pond Management
  async createPond(pondData: {
    name: string;
    type: PondType;
    locationId: string;
    size: number;
    sizeUnit: string;
    depth?: number;
    description?: string;
    constructionDate?: Date;
    notes?: string;
    createdById: string;
    constructionCost?: number; // Optional construction cost
  }): Promise<Pond> {
    const pond = this.pondRepository.create({
      name: pondData.name,
      type: pondData.type,
      locationId: pondData.locationId,
      size: pondData.size,
      sizeUnit: pondData.sizeUnit,
      depth: pondData.depth,
      description: pondData.description,
      constructionDate: pondData.constructionDate,
      notes: pondData.notes,
      status: PondStatus.ACTIVE,
    });

    const savedPond = await this.pondRepository.save(pond);

    // Record construction cost if finance service is available
    if (this.financeService && pondData.constructionCost) {
      try {
        await this.financeService.createTransaction({
          type: FinanceTransactionType.EXPENSE,
          amount: pondData.constructionCost,
          description: `Pond construction: ${pondData.name}`,
          category_id: 'equipment',
          date: pondData.constructionDate || new Date(),
          paymentMethod: PaymentMethod.CASH,
          referenceType: 'pond',
          referenceId: savedPond.id,
          recordedById: pondData.createdById,
        });
      } catch (error) {
        console.warn('Failed to record pond construction cost:', error);
      }
    }

    return savedPond;
  }

  async getPonds(filters?: {
    status?: PondStatus;
    type?: PondType;
    location?: string;
    minArea?: number;
    maxArea?: number;
    search?: string;
  }): Promise<Pond[]> {
    const query = this.pondRepository.createQueryBuilder('pond');

    if (filters?.status) {
      query.andWhere('pond.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('pond.type = :type', { type: filters.type });
    }

    if (filters?.location) {
      query.andWhere('pond.locationId LIKE :location', { location: `%${filters.location}%` });
    }

    if (filters?.minArea) {
      query.andWhere('pond.size >= :minArea', { minArea: filters.minArea });
    }

    if (filters?.maxArea) {
      query.andWhere('pond.size <= :maxArea', { maxArea: filters.maxArea });
    }

    if (filters?.search) {
      query.andWhere('(pond.name LIKE :search OR pond.description LIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    return query.getMany();
  }

  async getPondById(id: string): Promise<Pond> {
    const pond = await this.pondRepository.findOne({
      where: { id },
      relations: ['fishStocks', 'feedingLogs', 'waterQualityLogs', 'harvests', 'sales'],
    });

    if (!pond) {
      throw new NotFoundError('Pond not found');
    }

    return pond;
  }

  async updatePond(id: string, updates: Partial<Pond>): Promise<Pond> {
    const pond = await this.getPondById(id);
    Object.assign(pond, updates);
    return this.pondRepository.save(pond);
  }

  // Fish Stock Management
  async stockFish(stockData: {
    pondId: string;
    species: string;
    variety?: string;
    initialQuantity: number;
    currentQuantity: number;
    averageWeight?: number;
    stockingDate: Date;
    source?: string;
    costPerUnit?: number;
    totalCost?: number;
    notes?: string;
    stockedById: string;
  }): Promise<FishStock> {
    const pond = await this.getPondById(stockData.pondId);

    const fishStock = this.fishStockRepository.create({
      species: stockData.species,
      variety: stockData.variety,
      initialQuantity: stockData.initialQuantity,
      currentQuantity: stockData.currentQuantity,
      averageWeight: stockData.averageWeight,
      stockingDate: stockData.stockingDate,
      source: stockData.source,
      costPerUnit: stockData.costPerUnit,
      totalCost: stockData.totalCost,
      notes: stockData.notes,
      pond: pond,
      pondId: pond.id,
      stockedById: stockData.stockedById,
    });

    const savedStock = await this.fishStockRepository.save(fishStock);

    // Record fish purchase cost if finance service is available
    if (this.financeService && stockData.totalCost) {
      try {
        await this.financeService.createTransaction({
          type: FinanceTransactionType.EXPENSE,
          amount: stockData.totalCost,
          description: `Fish purchase: ${stockData.species} (${stockData.initialQuantity} units)`,
          category_id: 'feed',
          date: stockData.stockingDate,
          paymentMethod: PaymentMethod.CASH,
          referenceType: 'fish_stock',
          referenceId: savedStock.id,
          recordedById: stockData.stockedById,
        });
      } catch (error) {
        console.warn('Failed to record fish purchase cost:', error);
      }
    }

    return savedStock;
  }

  async getFishStocks(pondId?: string, species?: string): Promise<FishStock[]> {
    const query = this.fishStockRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.pond', 'pond');

    if (pondId) {
      query.andWhere('stock.pondId = :pondId', { pondId });
    }

    if (species) {
      query.andWhere('stock.species LIKE :species', { species: `%${species}%` });
    }

    return query.orderBy('stock.stockingDate', 'DESC').getMany();
  }

  async updateFishStock(id: string, updates: Partial<FishStock>): Promise<FishStock> {
    const stock = await this.fishStockRepository.findOneBy({ id });
    if (!stock) {
      throw new NotFoundError('Fish stock not found');
    }

    Object.assign(stock, updates);
    return this.fishStockRepository.save(stock);
  }

  // Feeding Management
  async recordFishFeeding(feedingData: {
    pondId: string;
    feedType: string;
    quantity: number;
    unit: string;
    feedingTime: Date;
    feedingMethod: 'manual' | 'automatic';
    notes?: string;
    recordedById: string;
  }): Promise<FishFeedingLog> {
    const pond = await this.getPondById(feedingData.pondId);

    // Check feed inventory if inventory service is available
    if (this.inventoryService) {
      try {
        const feedItem = await this.inventoryService.getInventoryItemByName(feedingData.feedType);
        if (!feedItem) {
          throw new BadRequestError(`Feed type '${feedingData.feedType}' not found in inventory`);
        }

        if (feedItem.currentStock < feedingData.quantity) {
          throw new BadRequestError(
            `Insufficient feed stock. Available: ${feedItem.currentStock} ${feedItem.unit}, Required: ${feedingData.quantity} ${feedingData.unit}`,
          );
        }

        // Record inventory transaction
        await this.inventoryService.recordTransaction({
          itemId: feedItem.id,
          type: TransactionType.USAGE,
          quantity: feedingData.quantity,
          reason: `Fish feeding - Pond: ${pond.name}`,
          userId: feedingData.recordedById,
        });
      } catch (error) {
        console.warn('Inventory service not available or error occurred:', error);
        // Continue without inventory integration if service is not available
      }
    }

    const feedingLog = this.fishFeedingLogRepository.create({
      ...feedingData,
      pondId: pond.id,
      pond,
    });

    const savedLog = await this.fishFeedingLogRepository.save(feedingLog);

    // Create notification for low feed stock if notification service is available
    if (this.notificationService && this.inventoryService) {
      try {
        const feedItem = await this.inventoryService.getInventoryItemByName(feedingData.feedType);
        if (feedItem && feedItem.currentStock <= feedItem.minimumStock) {
          await this.notificationService.createNotification({
            title: 'Low Feed Stock Alert',
            message: `Feed stock for '${feedingData.feedType}' is running low (${feedItem.currentStock} ${feedItem.unit} remaining)`,
            type: NotificationType.STOCK_ALERT,
            category: 'inventory',
            isGlobal: true,
            referenceType: 'inventory_item',
            referenceId: feedItem.id,
            createdById: feedingData.recordedById,
          });
        }
      } catch (error) {
        console.warn('Failed to create low stock notification:', error);
      }
    }

    return savedLog;
  }

  async getFeedingLogs(
    pondId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<FishFeedingLog[]> {
    const query = this.fishFeedingLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.pond', 'pond')
      .where('log.pondId = :pondId', { pondId });

    if (startDate) {
      query.andWhere('log.feedingTime >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('log.feedingTime <= :endDate', { endDate });
    }

    return query.orderBy('log.feedingTime', 'DESC').getMany();
  }

  // Water Quality Management
  async recordWaterQuality(qualityData: {
    pondId: string;
    testDate: Date;
    temperature: number;
    pH: number;
    dissolvedOxygen: number;
    ammonia?: number;
    nitrite?: number;
    nitrate?: number;
    alkalinity?: number;
    hardness?: number;
    transparency?: number;
    notes?: string;
    recordedById: string;
  }): Promise<WaterQualityLog> {
    const pond = await this.getPondById(qualityData.pondId);

    const qualityLog = this.waterQualityLogRepository.create({
      ...qualityData,
      pondId: pond.id,
      pond,
    });

    const savedLog = await this.waterQualityLogRepository.save(qualityLog);

    // Check for alerts based on water quality parameters
    await this.checkWaterQualityAlerts(pond, qualityData);

    return savedLog;
  }

  // Fish Sampling Management
  async recordFishSampling(samplingData: {
    pondId: string;
    date: Date;
    sampleSize: number;
    averageWeight: number;
    minimumWeight?: number;
    maximumWeight?: number;
    mortalityRate?: number;
    notes?: string;
    recordedById: string;
  }): Promise<FishSamplingLog> {
    const pond = await this.getPondById(samplingData.pondId);

    const samplingLog = this.fishSamplingLogRepository.create({
      ...samplingData,
      pondId: pond.id,
      pond,
    });

    const savedLog = await this.fishSamplingLogRepository.save(samplingLog);

    // Create notification for abnormal growth if notification service is available
    if (this.notificationService) {
      try {
        // Check for growth issues
        if (samplingData.mortalityRate && samplingData.mortalityRate > 5) {
          await this.notificationService.createNotification({
            title: 'High Fish Mortality Alert',
            message: `High mortality rate (${samplingData.mortalityRate}%) detected in pond ${pond.name}`,
            type: NotificationType.HEALTH_ALERT,
            category: 'fishery',
            isGlobal: false,
            referenceType: 'pond',
            referenceId: pond.id,
            createdById: samplingData.recordedById,
          });
        }
      } catch (error) {
        console.warn('Failed to create sampling notification:', error);
      }
    }

    return savedLog;
  }

  async getFishSamplingLogs(
    pondId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<FishSamplingLog[]> {
    const query = this.fishSamplingLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.pond', 'pond')
      .where('log.pondId = :pondId', { pondId });

    if (startDate) {
      query.andWhere('log.date >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('log.date <= :endDate', { endDate });
    }

    return query.orderBy('log.date', 'DESC').getMany();
  }

  // Fish Harvest Log Management
  async recordFishHarvestLog(harvestLogData: {
    pondId: string;
    date: Date;
    quantityHarvested: number;
    totalWeight: number;
    averageWeight: number;
    marketPrice?: number;
    revenue?: number;
    notes?: string;
    recordedById: string;
  }): Promise<FishHarvestLog> {
    const pond = await this.getPondById(harvestLogData.pondId);

    const harvestLog = this.fishHarvestLogRepository.create({
      ...harvestLogData,
      pondId: pond.id,
      pond,
    });

    const savedLog = await this.fishHarvestLogRepository.save(harvestLog);

    // Record revenue if finance service is available and revenue is provided
    if (this.financeService && harvestLogData.revenue) {
      try {
        await this.financeService.createTransaction({
          type: FinanceTransactionType.INCOME,
          amount: harvestLogData.revenue,
          description: `Fish harvest: ${harvestLogData.quantityHarvested} units from ${pond.name}`,
          category_id: 'fish_sales',
          date: harvestLogData.date,
          paymentMethod: PaymentMethod.CASH,
          referenceType: 'fish_harvest_log',
          referenceId: savedLog.id,
          recordedById: harvestLogData.recordedById,
        });
      } catch (error) {
        console.warn('Failed to record harvest revenue:', error);
      }
    }

    return savedLog;
  }

  async getFishHarvestLogs(
    pondId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<FishHarvestLog[]> {
    const query = this.fishHarvestLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.pond', 'pond')
      .where('log.pondId = :pondId', { pondId });

    if (startDate) {
      query.andWhere('log.date >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('log.date <= :endDate', { endDate });
    }

    return query.orderBy('log.date', 'DESC').getMany();
  }

  async getWaterQualityLogs(
    pondId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<WaterQualityLog[]> {
    const query = this.waterQualityLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.pond', 'pond')
      .where('log.pondId = :pondId', { pondId });

    if (startDate) {
      query.andWhere('log.testDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('log.testDate <= :endDate', { endDate });
    }

    return query.orderBy('log.testDate', 'DESC').getMany();
  }

  private async checkWaterQualityAlerts(pond: Pond, qualityData: any): Promise<void> {
    const alerts = [];

    // Check critical parameters
    if (qualityData.pH < 6.5 || qualityData.pH > 8.5) {
      alerts.push(`pH level (${qualityData.pH}) is outside optimal range (6.5-8.5)`);
    }

    if (qualityData.dissolvedOxygen < 5.0) {
      alerts.push(
        `Dissolved oxygen (${qualityData.dissolvedOxygen} mg/L) is below critical level (5.0 mg/L)`,
      );
    }

    if (qualityData.temperature < 20 || qualityData.temperature > 30) {
      alerts.push(`Temperature (${qualityData.temperature}°C) is outside optimal range (20-30°C)`);
    }

    if (qualityData.ammonia && qualityData.ammonia > 0.5) {
      alerts.push(`Ammonia level (${qualityData.ammonia} mg/L) is above safe level (0.5 mg/L)`);
    }

    // Log alerts - notifications can be sent separately
    for (const alert of alerts) {
      console.log(`Water Quality Alert - ${pond.name}: ${alert}`);
    }
  }

  // Harvest Management
  async recordHarvest(harvestData: {
    pondId: string;
    harvestDate: Date;
    harvestType: 'partial' | 'complete';
    quantityHarvested: number;
    averageWeight: number;
    totalWeight: number;
    mortality?: number;
    notes?: string;
    recordedById: string;
  }): Promise<FishHarvest> {
    const pond = await this.getPondById(harvestData.pondId);

    const fishHarvest = this.fishHarvestRepository.create({
      harvestDate: harvestData.harvestDate,
      quantityHarvested: harvestData.quantityHarvested,
      totalWeight: harvestData.totalWeight,
      averageWeight: harvestData.averageWeight,
      harvestType: harvestData.harvestType === 'partial' ? HarvestType.PARTIAL : HarvestType.FULL,
      mortalityCount: harvestData.mortality,
      notes: harvestData.notes,
      pond: pond,
      pondId: pond.id,
      harvestedById: harvestData.recordedById,
    });

    const savedHarvest = await this.fishHarvestRepository.save(fishHarvest);

    return savedHarvest;
  }

  async getHarvests(pondId?: string, startDate?: Date, endDate?: Date): Promise<FishHarvest[]> {
    const query = this.fishHarvestRepository
      .createQueryBuilder('harvest')
      .leftJoinAndSelect('harvest.pond', 'pond');

    if (pondId) {
      query.where('harvest.pondId = :pondId', { pondId });
    }

    if (startDate) {
      query.andWhere('harvest.harvestDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('harvest.harvestDate <= :endDate', { endDate });
    }

    return query.orderBy('harvest.harvestDate', 'DESC').getMany();
  }

  // Sales Management
  async recordFishSale(saleData: {
    pondId?: string;
    saleDate: Date;
    species: string;
    quantity: number;
    totalWeight: number;
    pricePerKg: number;
    totalAmount: number;
    buyerName: string;
    buyerContact?: string;
    buyerAddress?: string;
    paymentMethod?: string;
    paymentReference?: string;
    notes?: string;
    soldById: string;
  }): Promise<FishSale> {
    let pond: Pond | undefined = undefined;
    if (saleData.pondId) {
      pond = await this.getPondById(saleData.pondId);
    }

    const fishSale = this.fishSaleRepository.create({
      saleDate: saleData.saleDate,
      quantity: saleData.quantity,
      totalWeight: saleData.totalWeight,
      pricePerKg: saleData.pricePerKg,
      totalAmount: saleData.totalAmount,
      buyerName: saleData.buyerName,
      buyerContact: saleData.buyerContact,
      buyerAddress: saleData.buyerAddress,
      paymentMethod: saleData.paymentMethod,
      paymentReference: saleData.paymentReference,
      notes: saleData.notes,
      pond: pond,
      pondId: pond ? pond.id : '',
      soldById: saleData.soldById,
    });

    const savedSale = await this.fishSaleRepository.save(fishSale);

    // Record sales revenue if finance service is available
    if (this.financeService) {
      try {
        await this.financeService.createTransaction({
          type: FinanceTransactionType.INCOME,
          amount: saleData.totalAmount,
          description: `Fish sale: ${saleData.species} (${saleData.quantity} units)`,
          category_id: 'fish_sales',
          date: saleData.saleDate,
          paymentMethod: saleData.paymentMethod
            ? PaymentMethod[saleData.paymentMethod as keyof typeof PaymentMethod]
            : PaymentMethod.CASH,
          referenceType: 'fish_sale',
          referenceId: savedSale.id,
          recordedById: saleData.soldById,
        });
      } catch (error) {
        console.warn('Failed to record fish sale revenue:', error);
      }
    }

    return savedSale;
  }

  async getFishSales(pondId?: string, startDate?: Date, endDate?: Date): Promise<FishSale[]> {
    const query = this.fishSaleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.pond', 'pond');

    if (pondId) {
      query.where('sale.pondId = :pondId', { pondId });
    }

    if (startDate) {
      query.andWhere('sale.saleDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('sale.saleDate <= :endDate', { endDate });
    }

    return query.orderBy('sale.saleDate', 'DESC').getMany();
  }

  // Analytics and Reporting
  async getPondPerformanceReport(pondId: string): Promise<{
    pond: Pond;
    totalStockingCost: number;
    totalFeedCost: number;
    totalHarvestValue: number;
    totalSalesRevenue: number;
    profitLoss: number;
    survivalRate: number;
    feedConversionRatio: number;
    averageGrowthRate: number;
    cycleCount: number;
  }> {
    const pond = await this.getPondById(pondId);

    const stockingCost = await this.calculateStockingCosts(pondId);
    const feedCost = await this.calculateFeedCosts(pondId);
    const harvestValue = await this.calculateHarvestValue(pondId);
    const salesRevenue = await this.calculateSalesRevenue(pondId);

    const totalCosts = stockingCost + feedCost;
    const totalRevenue = harvestValue + salesRevenue;
    const profitLoss = totalRevenue - totalCosts;

    const survivalRate = await this.calculateSurvivalRate(pondId);
    const feedConversionRatio = await this.calculateFeedConversionRatio(pondId);
    const averageGrowthRate = await this.calculateAverageGrowthRate(pondId);
    const cycleCount = await this.getCycleCount(pondId);

    return {
      pond,
      totalStockingCost: stockingCost,
      totalFeedCost: feedCost,
      totalHarvestValue: harvestValue,
      totalSalesRevenue: salesRevenue,
      profitLoss,
      survivalRate,
      feedConversionRatio,
      averageGrowthRate,
      cycleCount,
    };
  }

  private async calculateStockingCosts(pondId: string): Promise<number> {
    const fishStocks = await this.getFishStocks(pondId);
    return fishStocks.reduce((sum, stock) => sum + (stock.totalCost || 0), 0);
  }

  private async calculateFeedCosts(pondId: string): Promise<number> {
    const feedingLogs = await this.getFeedingLogs(pondId);
    let totalCost = 0;

    // Note: Feed cost calculation can be done separately with inventory service
    console.log(
      `Calculating feed costs for pond ${pondId} - Feed cost calculation should be done separately`,
    );

    return totalCost;
  }

  private async calculateHarvestValue(pondId: string): Promise<number> {
    const harvests = await this.getHarvests(pondId);

    // Default fish price per kg - could be made configurable
    const fishPricePerKg = 5.0;

    return harvests.reduce((sum, harvest) => sum + harvest.totalWeight * fishPricePerKg, 0);
  }

  private async calculateSalesRevenue(pondId: string): Promise<number> {
    const sales = await this.getFishSales(pondId);
    return sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  }

  private async calculateSurvivalRate(pondId: string): Promise<number> {
    const fishStocks = await this.getFishStocks(pondId);
    const harvests = await this.getHarvests(pondId);

    const totalStocked = fishStocks.reduce((sum, stock) => sum + stock.initialQuantity, 0);
    const totalHarvested = harvests.reduce((sum, harvest) => sum + harvest.quantityHarvested, 0);

    return totalStocked > 0 ? (totalHarvested / totalStocked) * 100 : 0;
  }

  private async calculateFeedConversionRatio(pondId: string): Promise<number> {
    const harvests = await this.getHarvests(pondId);

    const totalHarvestedWeight = harvests.reduce((sum, harvest) => sum + harvest.totalWeight, 0);

    return totalHarvestedWeight > 0 ? totalHarvestedWeight / totalHarvestedWeight : 0;
  }

  private async calculateAverageGrowthRate(pondId: string): Promise<number> {
    const fishStocks = await this.getFishStocks(pondId);
    const harvests = await this.getHarvests(pondId);

    if (fishStocks.length === 0 || harvests.length === 0) return 0;

    const initialWeight =
      fishStocks.reduce((sum, stock) => sum + (stock.averageWeight ?? 0), 0) / fishStocks.length;
    const finalWeight =
      harvests.reduce((sum, harvest) => sum + harvest.averageWeight, 0) / harvests.length;

    return finalWeight - initialWeight;
  }

  private async getCycleCount(pondId: string): Promise<number> {
    const fishStocks = await this.getFishStocks(pondId);
    return fishStocks.length;
  }

  // Utility methods
  async getFisheryOverview(): Promise<{
    totalPonds: number;
    activePonds: number;
    totalFishStocked: number;
    totalHarvested: number;
    totalSales: number;
    totalRevenue: number;
    averageSurvivalRate: number;
    averageFCR: number;
  }> {
    const ponds = await this.getPonds();
    const fishStocks = await this.getFishStocks();
    const harvests = await this.getHarvests();
    const sales = await this.getFishSales();

    const totalPonds = ponds.length;
    const activePonds = ponds.filter((p) => p.status === PondStatus.ACTIVE).length;
    const totalFishStocked = fishStocks.reduce((sum, stock) => sum + stock.initialQuantity, 0);
    const totalHarvested = harvests.reduce((sum, harvest) => sum + harvest.quantityHarvested, 0);
    const totalSales = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    const averageSurvivalRate =
      totalFishStocked > 0 ? (totalHarvested / totalFishStocked) * 100 : 0;
    const totalHarvestedWeight = harvests.reduce((sum, harvest) => sum + harvest.totalWeight, 0);
    const averageFCR = totalHarvestedWeight > 0 ? totalHarvestedWeight / totalHarvestedWeight : 0;

    return {
      totalPonds,
      activePonds,
      totalFishStocked,
      totalHarvested,
      totalSales,
      totalRevenue,
      averageSurvivalRate,
      averageFCR,
    };
  }
}
