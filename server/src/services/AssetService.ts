import {
  AssetStatus,
  AssetType,
  AuxiliaryProductType,
  FinanceTransactionType,
  MaintenanceStatus,
  MaintenanceType,
  PaymentMethod,
} from '@kuyash/shared';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Asset } from '../entities/Asset';
import { AssetDepreciation } from '../entities/AssetDepreciation';
import { AuxiliaryProduction } from '../entities/AuxiliaryProduction';
import { MaintenanceLog } from '../entities/MaintenanceLog';
import { MaintenanceRecord } from '../entities/MaintenanceRecord';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { FinanceService } from './FinanceService';
import { InventoryService } from './InventoryService';
import { NotificationService } from './NotificationService';
import { ServiceFactory } from './ServiceFactory';

export class AssetService {
  private assetRepository: Repository<Asset>;
  private assetDepreciationRepository: Repository<AssetDepreciation>;
  private maintenanceRecordRepository: Repository<MaintenanceRecord>;
  private maintenanceLogRepository: Repository<MaintenanceLog>;
  private auxiliaryProductionRepository: Repository<AuxiliaryProduction>;
  private inventoryService: InventoryService;
  private financeService: FinanceService;
  private notificationService: NotificationService;

  constructor() {
    this.assetRepository = AppDataSource.getRepository(Asset);
    this.assetDepreciationRepository = AppDataSource.getRepository(AssetDepreciation);
    this.maintenanceRecordRepository = AppDataSource.getRepository(MaintenanceRecord);
    this.maintenanceLogRepository = AppDataSource.getRepository(MaintenanceLog);
    this.auxiliaryProductionRepository = AppDataSource.getRepository(AuxiliaryProduction);

    // Use ServiceFactory for dependency injection
    const serviceFactory = ServiceFactory.getInstance();
    this.inventoryService = serviceFactory.getInventoryService();
    this.financeService = serviceFactory.getFinanceService();
    this.notificationService = serviceFactory.getNotificationService();
  }

  // Asset Management
  async createAsset(assetData: {
    name: string;
    type: AssetType;
    description?: string;
    serialNumber?: string;
    model?: string;
    manufacturer?: string;
    purchaseDate: Date;
    purchasePrice: number;
    currentValue: number;
    locationId: string;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    usefulLife?: number; // in years
    depreciationMethod?: 'straight_line' | 'declining_balance' | 'units_of_production';
    warrantyExpiry?: Date;
    notes?: string;
    assignedUserId?: string;
  }): Promise<Asset> {
    const asset = this.assetRepository.create({
      ...assetData,
      assetCode: `AST-${Date.now()}`,
      status: AssetStatus.ACTIVE,
      bookValue: assetData.purchasePrice,
      accumulatedDepreciation: 0,
    });

    const savedAsset = await this.assetRepository.save(asset);

    // Record asset purchase expense
    await this.financeService.createTransaction({
      type: FinanceTransactionType.EXPENSE,
      category: 'equipment',
      amount: assetData.purchasePrice,
      description: `Asset purchase - ${assetData.name}`,
      date: assetData.purchaseDate,
      paymentMethod: PaymentMethod.CASH,
      referenceType: 'asset',
      referenceId: savedAsset.id,
      recordedById: assetData.assignedUserId || '',
    });

    return savedAsset;
  }

  async getAssets(filters?: {
    status?: AssetStatus;
    type?: AssetType;
    locationId?: string;
    condition?: string;
    manufacturer?: string;
  }): Promise<Asset[]> {
    const query = this.assetRepository.createQueryBuilder('asset');

    if (filters?.status) {
      query.andWhere('asset.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('asset.type = :type', { type: filters.type });
    }

    if (filters?.locationId) {
      query.andWhere('asset.locationId = :locationId', { locationId: filters.locationId });
    }

    if (filters?.condition) {
      query.andWhere('asset.condition = :condition', { condition: filters.condition });
    }

    if (filters?.manufacturer) {
      query.andWhere('asset.manufacturer LIKE :manufacturer', {
        manufacturer: `%${filters.manufacturer}%`,
      });
    }

    return query.getMany();
  }

  async getAssetById(id: string): Promise<Asset> {
    const asset = await this.assetRepository.findOne({
      where: { id },
      relations: ['maintenanceLogs'],
    });

    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    return asset;
  }

  async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset> {
    const asset = await this.getAssetById(id);
    Object.assign(asset, updates);
    return this.assetRepository.save(asset);
  }

  async disposeAsset(
    id: string,
    disposalData: {
      disposalDate: Date;
      disposalMethod: 'sale' | 'scrap' | 'donation' | 'return';
      disposalValue: number;
      notes?: string;
      recordedById: string;
    },
  ): Promise<Asset> {
    const asset = await this.getAssetById(id);

    const disposedAsset = await this.updateAsset(id, {
      status: AssetStatus.DISPOSED,
      disposalDate: disposalData.disposalDate,
      disposalValue: disposalData.disposalValue,
      notes: disposalData.notes,
    });

    // Record disposal transaction
    if (disposalData.disposalValue > 0) {
      await this.financeService.createTransaction({
        type: FinanceTransactionType.INCOME,
        category: 'other_income',
        amount: disposalData.disposalValue,
        description: `Asset disposal - ${asset.name}`,
        date: disposalData.disposalDate,
        paymentMethod: PaymentMethod.CASH,
        referenceType: 'asset',
        referenceId: asset.id,
        recordedById: disposalData.recordedById,
      });
    }

    return disposedAsset;
  }

  // Maintenance Management
  async scheduleMaintenance(maintenanceData: {
    assetId: string;
    maintenanceType: MaintenanceType;
    description: string;
    scheduledDate: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedCost?: number;
    estimatedDuration?: number; // in hours
    assignedToId?: string;
    notes?: string;
    recordedById: string;
  }): Promise<MaintenanceRecord> {
    const asset = await this.getAssetById(maintenanceData.assetId);

    const maintenanceRecord = this.maintenanceRecordRepository.create({
      ...maintenanceData,
      assetId: asset.id,
      asset,
      status: MaintenanceStatus.SCHEDULED,
      cost: maintenanceData.estimatedCost || 0,
    });

    return this.maintenanceRecordRepository.save(maintenanceRecord);
  }

  async recordMaintenanceCompletion(
    maintenanceId: string,
    completionData: {
      completionDate: Date;
      actualCost: number;
      actualDuration?: number; // in hours
      description?: string;
      partsUsed?: string[];
      technicianNotes?: string;
      nextMaintenanceDate?: Date;
      recordedById: string;
    },
  ): Promise<MaintenanceRecord> {
    const maintenance = await this.maintenanceRecordRepository.findOne({
      where: { id: maintenanceId },
      relations: ['asset'],
    });

    if (!maintenance) {
      throw new NotFoundError('Maintenance record not found');
    }

    Object.assign(maintenance, {
      ...completionData,
      status: MaintenanceStatus.COMPLETED,
      completedDate: completionData.completionDate,
      actualCost: completionData.actualCost,
      actualDuration: completionData.actualDuration,
      partsUsed: completionData.partsUsed?.join(', '),
      technicianNotes: completionData.technicianNotes,
      nextMaintenanceDate: completionData.nextMaintenanceDate,
    });

    const savedMaintenance = await this.maintenanceRecordRepository.save(maintenance);

    // Record maintenance expense
    await this.financeService.createTransaction({
      type: FinanceTransactionType.EXPENSE,
      category: 'maintenance',
      amount: completionData.actualCost,
      description: `Maintenance - ${maintenance.asset.name}: ${maintenance.description}`,
      date: completionData.completionDate,
      paymentMethod: PaymentMethod.CASH,
      referenceType: 'maintenance',
      referenceId: maintenance.id,
      recordedById: completionData.recordedById,
    });

    // Update asset maintenance totals
    await this.updateAsset(maintenance.assetId, {
      totalMaintenanceCost:
        (maintenance.asset.totalMaintenanceCost || 0) + completionData.actualCost,
      lastMaintenanceDate: completionData.completionDate,
      nextMaintenanceDate: completionData.nextMaintenanceDate,
    });

    return savedMaintenance;
  }

  async getMaintenanceRecords(
    assetId?: string,
    status?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<MaintenanceRecord[]> {
    const query = this.maintenanceRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.asset', 'asset');

    if (assetId) {
      query.andWhere('record.assetId = :assetId', { assetId });
    }

    if (status) {
      query.andWhere('record.status = :status', { status });
    }

    if (startDate) {
      query.andWhere('record.scheduledDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('record.scheduledDate <= :endDate', { endDate });
    }

    return query.orderBy('record.scheduledDate', 'DESC').getMany();
  }

  async getUpcomingMaintenance(daysAhead: number = 30): Promise<MaintenanceRecord[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    return this.maintenanceRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.asset', 'asset')
      .where('record.status = :status', { status: MaintenanceStatus.SCHEDULED })
      .andWhere('record.scheduledDate BETWEEN :today AND :futureDate', { today, futureDate })
      .orderBy('record.scheduledDate', 'ASC')
      .getMany();
  }

  // Auxiliary Production Management
  async recordAuxiliaryProduction(productionData: {
    productType: AuxiliaryProductType;
    productName: string;
    productionDate: Date;
    quantityProduced: number;
    unit: string;
    materialCost: number;
    laborCost: number;
    overheadCost: number;
    totalCost: number;
    unitCost: number;
    unitPrice: number;
    notes?: string;
    recordedById: string;
  }): Promise<AuxiliaryProduction> {
    const production = this.auxiliaryProductionRepository.create({
      date: productionData.productionDate,
      productType: productionData.productType,
      productName: productionData.productName,
      productionDate: productionData.productionDate,
      quantityProduced: productionData.quantityProduced,
      quantityRemaining: productionData.quantityProduced,
      unit: productionData.unit,
      materialCost: productionData.materialCost,
      laborCost: productionData.laborCost,
      overheadCost: productionData.overheadCost,
      totalCost: productionData.totalCost,
      unitCost: productionData.unitCost,
      unitPrice: productionData.unitPrice,
      totalValue: productionData.quantityProduced * productionData.unitPrice,
      revenue: 0,
      notes: productionData.notes,
    });

    const savedProduction = await this.auxiliaryProductionRepository.save(production);

    // Record production expense
    await this.financeService.createTransaction({
      type: FinanceTransactionType.EXPENSE,
      category: 'other_expense',
      amount: productionData.totalCost,
      description: `Production cost - ${productionData.productName}`,
      date: productionData.productionDate,
      paymentMethod: PaymentMethod.CASH,
      referenceType: 'production',
      referenceId: savedProduction.id,
      recordedById: productionData.recordedById,
    });

    return savedProduction;
  }

  async recordAuxiliaryProductionSale(saleData: {
    productionId: string;
    saleDate: Date;
    quantitySold: number;
    unitPrice: number;
    totalAmount: number;
    buyerName: string;
    buyerContact?: string;
    deliveryLocation?: string;
    notes?: string;
    recordedById: string;
  }): Promise<AuxiliaryProduction> {
    const production = await this.auxiliaryProductionRepository.findOneBy({
      id: saleData.productionId,
    });
    if (!production) {
      throw new NotFoundError('Production record not found');
    }

    if (production.quantityRemaining < saleData.quantitySold) {
      throw new BadRequestError(
        `Insufficient quantity. Available: ${production.quantityRemaining}, Requested: ${saleData.quantitySold}`,
      );
    }

    // Update production record
    production.quantityRemaining -= saleData.quantitySold;
    production.totalSales = (production.totalSales || 0) + saleData.totalAmount;
    production.quantitySold = (production.quantitySold || 0) + saleData.quantitySold;

    const updatedProduction = await this.auxiliaryProductionRepository.save(production);

    // Record sales income
    await this.financeService.createTransaction({
      type: FinanceTransactionType.INCOME,
      category: 'service_income',
      amount: saleData.totalAmount,
      description: `${production.productName} sale - ${saleData.quantitySold} ${production.unit}`,
      date: saleData.saleDate,
      paymentMethod: PaymentMethod.CASH,
      referenceType: 'production_sale',
      referenceId: production.id,
      recordedById: saleData.recordedById,
    });

    return updatedProduction;
  }

  async getAuxiliaryProduction(
    productType?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AuxiliaryProduction[]> {
    const query = this.auxiliaryProductionRepository.createQueryBuilder('production');

    if (productType) {
      query.andWhere('production.productType = :productType', { productType });
    }

    if (startDate) {
      query.andWhere('production.date >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('production.date <= :endDate', { endDate });
    }

    return query.orderBy('production.date', 'DESC').getMany();
  }

  async recordAuxiliaryDispatch(dispatchData: {
    productionId: string;
    dispatchDate: Date;
    quantityDispatched: number;
    destination: string;
    recipientName: string;
    recipientContact?: string;
    transportMethod?: string;
    transportCost?: number;
    notes?: string;
    recordedById: string;
  }): Promise<AuxiliaryProduction> {
    const production = await this.auxiliaryProductionRepository.findOneBy({
      id: dispatchData.productionId,
    });

    if (!production) {
      throw new NotFoundError('Production record not found');
    }

    if (production.quantityRemaining < dispatchData.quantityDispatched) {
      throw new BadRequestError(
        `Insufficient quantity for dispatch. Available: ${production.quantityRemaining}, Requested: ${dispatchData.quantityDispatched}`,
      );
    }

    // Update production record - track dispatch through quantityRemaining
    production.quantityRemaining -= dispatchData.quantityDispatched;

    const updatedProduction = await this.auxiliaryProductionRepository.save(production);

    // Record dispatch expense if transport cost is provided
    if (dispatchData.transportCost && dispatchData.transportCost > 0) {
      await this.financeService.createTransaction({
        type: FinanceTransactionType.EXPENSE,
        category: 'transport',
        amount: dispatchData.transportCost,
        description: `Transport cost for ${production.productName} dispatch to ${dispatchData.destination}`,
        date: dispatchData.dispatchDate,
        paymentMethod: PaymentMethod.CASH,
        referenceType: 'production_dispatch',
        referenceId: production.id,
        recordedById: dispatchData.recordedById,
      });
    }

    return updatedProduction;
  }

  // Depreciation Management
  async calculateDepreciation(assetId: string, depreciationDate: Date): Promise<AssetDepreciation> {
    const asset = await this.getAssetById(assetId);

    if (!asset.usefulLife || !asset.depreciationMethod) {
      throw new BadRequestError('Asset must have useful life and depreciation method defined');
    }

    const depreciationAmount = this.calculateDepreciationAmount(asset, depreciationDate);

    const depreciation = this.assetDepreciationRepository.create({
      assetId: asset.id,
      asset,
      depreciationDate,
      depreciationAmount,
      accumulatedDepreciation: (asset.accumulatedDepreciation || 0) + depreciationAmount,
      bookValue: (asset.bookValue || 0) - depreciationAmount,
      method: asset.depreciationMethod,
      originalValue: asset.purchasePrice || 0,
      residualValue: 0,
      usefulLifeYears: asset.usefulLife,
      depreciationMethod: asset.depreciationMethod as any,
      annualDepreciation: (asset.purchasePrice || 0) / asset.usefulLife,
      currentValue: (asset.bookValue || 0) - depreciationAmount,
      depreciationStartDate: asset.purchaseDate || new Date(),
      depreciationEndDate: new Date(),
    });

    const savedDepreciation = await this.assetDepreciationRepository.save(depreciation);

    // Update asset book value
    await this.updateAsset(assetId, {
      bookValue: savedDepreciation.bookValue,
      accumulatedDepreciation: savedDepreciation.accumulatedDepreciation,
    });

    return savedDepreciation;
  }

  private calculateDepreciationAmount(asset: Asset, depreciationDate: Date): number {
    const purchaseDate = asset.purchaseDate ? new Date(asset.purchaseDate) : new Date();
    const yearsElapsed =
      (depreciationDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    switch (asset.depreciationMethod) {
      case 'straight_line':
        return (asset.purchasePrice || 0) / (asset.usefulLife || 1) / 12; // Monthly depreciation

      case 'declining_balance':
        const rate = 2 / (asset.usefulLife || 1); // Double declining balance
        return ((asset.bookValue || 0) * rate) / 12; // Monthly depreciation

      case 'units_of_production':
        // This would need usage data - simplified for now
        return (asset.purchasePrice || 0) / (asset.usefulLife || 1) / 12;

      default:
        return 0;
    }
  }

  async getDepreciationRecords(
    assetId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AssetDepreciation[]> {
    const query = this.assetDepreciationRepository
      .createQueryBuilder('depreciation')
      .leftJoinAndSelect('depreciation.asset', 'asset');

    if (assetId) {
      query.andWhere('depreciation.assetId = :assetId', { assetId });
    }

    if (startDate) {
      query.andWhere('depreciation.depreciationDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('depreciation.depreciationDate <= :endDate', { endDate });
    }

    return query.orderBy('depreciation.depreciationDate', 'DESC').getMany();
  }

  // Analytics and Reporting
  async getAssetPerformanceReport(assetId: string): Promise<{
    asset: Asset;
    totalMaintenanceCost: number;
    totalDepreciation: number;
    currentBookValue: number;
    utilizationRate: number;
    maintenanceFrequency: number;
    costPerDay: number;
    roi: number;
    remainingUsefulLife: number;
  }> {
    const asset = await this.getAssetById(assetId);

    const maintenanceRecords = await this.getMaintenanceRecords(assetId);
    const depreciationRecords = await this.getDepreciationRecords(assetId);

    const totalMaintenanceCost = maintenanceRecords
      .filter((r) => r.status === MaintenanceStatus.COMPLETED)
      .reduce((sum, r) => sum + (r.actualCost || 0), 0);

    const totalDepreciation = depreciationRecords.reduce(
      (sum, r) => sum + (r.depreciationAmount || 0),
      0,
    );

    const currentBookValue = asset.bookValue || 0;

    const ageInDays = asset.purchaseDate
      ? (new Date().getTime() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24)
      : 0;
    const costPerDay =
      ageInDays > 0 ? ((asset.purchasePrice || 0) + totalMaintenanceCost) / ageInDays : 0;

    const utilizationRate = this.calculateUtilizationRate(asset);
    const maintenanceFrequency =
      ageInDays > 0 ? maintenanceRecords.length / (ageInDays / 365.25) : 0;

    // Calculate ROI based on value generated (simplified)
    const roi = 0; // Would need revenue data generated by this asset

    const remainingUsefulLife = asset.usefulLife
      ? Math.max(0, asset.usefulLife - ageInDays / 365.25)
      : 0;

    return {
      asset,
      totalMaintenanceCost,
      totalDepreciation,
      currentBookValue,
      utilizationRate,
      maintenanceFrequency,
      costPerDay,
      roi,
      remainingUsefulLife,
    };
  }

  private calculateUtilizationRate(asset: Asset): number {
    // This would need actual usage data - simplified for now
    // Could be based on operating hours, production output, etc.
    return 75; // Placeholder percentage
  }

  async getAssetOverview(): Promise<{
    totalAssets: number;
    totalValue: number;
    totalBookValue: number;
    totalDepreciation: number;
    totalMaintenanceCost: number;
    assetsByType: Record<string, number>;
    assetsByStatus: Record<string, number>;
    assetsByCondition: Record<string, number>;
    upcomingMaintenance: number;
    auxiliaryProductionValue: number;
  }> {
    const assets = await this.getAssets();
    const maintenanceRecords = await this.getMaintenanceRecords();
    const depreciationRecords = await this.getDepreciationRecords();
    const auxiliaryProduction = await this.getAuxiliaryProduction();
    const upcomingMaintenance = await this.getUpcomingMaintenance();

    const totalAssets = assets.length;
    const totalValue = assets.reduce((sum, asset) => sum + (asset.purchasePrice || 0), 0);
    const totalBookValue = assets.reduce((sum, asset) => sum + (asset.bookValue || 0), 0);
    const totalDepreciation = depreciationRecords.reduce(
      (sum, record) => sum + (record.depreciationAmount || 0),
      0,
    );
    const totalMaintenanceCost = maintenanceRecords
      .filter((r) => r.status === MaintenanceStatus.COMPLETED)
      .reduce((sum, r) => sum + (r.actualCost || 0), 0);

    const assetsByType = assets.reduce(
      (acc, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const assetsByStatus = assets.reduce(
      (acc, asset) => {
        acc[asset.status] = (acc[asset.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const assetsByCondition = assets.reduce(
      (acc, asset) => {
        acc[asset.condition || 'unknown'] = (acc[asset.condition || 'unknown'] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const auxiliaryProductionValue = auxiliaryProduction.reduce(
      (sum, prod) => sum + (prod.totalValue || 0),
      0,
    );

    return {
      totalAssets,
      totalValue,
      totalBookValue,
      totalDepreciation,
      totalMaintenanceCost,
      assetsByType,
      assetsByStatus,
      assetsByCondition,
      upcomingMaintenance: upcomingMaintenance.length,
      auxiliaryProductionValue,
    };
  }
}
