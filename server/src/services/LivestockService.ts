import {
  AnimalStatus,
  AnimalType,
  FeedType,
  FinanceTransactionType,
  PaymentMethod,
  ProductionType,
  TransactionType,
} from '@kuyash/shared';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Animal } from '../entities/Animal';
import { AnimalFeedingLog } from '../entities/AnimalFeedingLog';
import { AnimalHealthRecord } from '../entities/AnimalHealthRecord';
import { AnimalSale } from '../entities/AnimalSale';
import { BreedingRecord } from '../entities/BreedingRecord';
import { ProductionLog } from '../entities/ProductionLog';
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

export class LivestockService {
  private animalRepository: Repository<Animal>;
  private animalHealthRecordRepository: Repository<AnimalHealthRecord>;
  private breedingRecordRepository: Repository<BreedingRecord>;
  private productionLogRepository: Repository<ProductionLog>;
  private animalSaleRepository: Repository<AnimalSale>;
  private animalFeedingLogRepository: Repository<AnimalFeedingLog>;
  private inventoryService: InventoryService;
  private financeService: FinanceService;
  private notificationService: NotificationService;

  constructor() {
    this.animalRepository = AppDataSource.getRepository(Animal);
    this.animalHealthRecordRepository = AppDataSource.getRepository(AnimalHealthRecord);
    this.breedingRecordRepository = AppDataSource.getRepository(BreedingRecord);
    this.productionLogRepository = AppDataSource.getRepository(ProductionLog);
    this.animalSaleRepository = AppDataSource.getRepository(AnimalSale);
    this.animalFeedingLogRepository = AppDataSource.getRepository(AnimalFeedingLog);

    // Use ServiceFactory for dependency injection
    const serviceFactory = ServiceFactory.getInstance();
    this.inventoryService = serviceFactory.getInventoryService();
    this.financeService = serviceFactory.getFinanceService();
    this.notificationService = serviceFactory.getNotificationService();
  }

  // Animal Management
  async createAnimal(animalData: {
    tagNumber: string;
    species: AnimalType;
    breed: string;
    gender: 'male' | 'female';
    dateOfBirth?: Date;
    acquisitionDate: Date;
    source: string;
    locationId: string;
    weight?: number;
    acquisitionCost?: number;
    notes?: string;
    assignedUserId?: string;
    createdById: string;
  }): Promise<Animal> {
    // Check if tag number already exists
    const existingAnimal = await this.animalRepository.findOne({
      where: { tagNumber: animalData.tagNumber },
    });

    if (existingAnimal) {
      throw new BadRequestError(`Animal with tag number ${animalData.tagNumber} already exists`);
    }

    const animal = this.animalRepository.create({
      tagNumber: animalData.tagNumber,
      species: animalData.species,
      breed: animalData.breed,
      gender: animalData.gender,
      dateOfBirth: animalData.dateOfBirth,
      acquisitionDate: animalData.acquisitionDate,
      source: animalData.source,
      locationId: animalData.locationId,
      weight: animalData.weight,
      acquisitionCost: animalData.acquisitionCost,
      notes: animalData.notes,
      assignedUserId: animalData.assignedUserId,
      status: AnimalStatus.ACTIVE,
    });

    const savedAnimal = await this.animalRepository.save(animal);

    // Record initial expense if finance service is available
    if (this.financeService && animalData.acquisitionCost) {
      try {
        await this.financeService.createTransaction({
          type: FinanceTransactionType.EXPENSE,
          amount: animalData.acquisitionCost,
          description: `Animal acquisition - ${animalData.tagNumber} (${animalData.breed})`,
          category_id: 'feed',
          date: animalData.acquisitionDate,
          paymentMethod: PaymentMethod.CASH,
          referenceType: 'ANIMAL',
          referenceId: savedAnimal.id,
          recordedById: animalData.createdById,
        });
      } catch (error) {
        console.warn('Failed to record animal acquisition cost:', error);
      }
    }

    return savedAnimal;
  }

  async getAnimals(filters?: {
    status?: AnimalStatus;
    species?: AnimalType;
    breed?: string;
    gender?: 'male' | 'female';
    minAge?: number;
    maxAge?: number;
  }): Promise<Animal[]> {
    const query = this.animalRepository.createQueryBuilder('animal');

    if (filters?.status) {
      query.andWhere('animal.status = :status', { status: filters.status });
    }

    if (filters?.species) {
      query.andWhere('animal.species = :species', { species: filters.species });
    }

    if (filters?.breed) {
      query.andWhere('animal.breed LIKE :breed', { breed: `%${filters.breed}%` });
    }

    if (filters?.gender) {
      query.andWhere('animal.gender = :gender', { gender: filters.gender });
    }

    if (filters?.minAge) {
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - filters.minAge);
      query.andWhere('animal.dateOfBirth <= :minDate', { minDate });
    }

    if (filters?.maxAge) {
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() - filters.maxAge);
      query.andWhere('animal.dateOfBirth >= :maxDate', { maxDate });
    }

    return query.getMany();
  }

  async getAnimalById(id: string): Promise<Animal> {
    const animal = await this.animalRepository.findOne({
      where: { id },
      relations: ['location', 'assignedUser'],
    });

    if (!animal) {
      throw new NotFoundError('Animal not found');
    }

    return animal;
  }

  async getAnimalByTag(tagNumber: string): Promise<Animal> {
    const animal = await this.animalRepository.findOne({
      where: { tagNumber },
      relations: ['location', 'assignedUser'],
    });

    if (!animal) {
      throw new NotFoundError('Animal not found');
    }

    return animal;
  }

  async updateAnimal(id: string, updates: Partial<Animal>): Promise<Animal> {
    const animal = await this.getAnimalById(id);
    Object.assign(animal, updates);
    return this.animalRepository.save(animal);
  }

  // Health Management
  async recordHealthActivity(healthData: {
    animalId: string;
    type: string;
    description: string;
    treatment?: string;
    veterinarian?: string;
    cost?: number;
    date?: Date;
    recordedById: string;
  }): Promise<AnimalHealthRecord> {
    const animal = await this.getAnimalById(healthData.animalId);

    const healthRecord = this.animalHealthRecordRepository.create({
      date: healthData.date || new Date(),
      type: healthData.type,
      description: healthData.description,
      treatment: healthData.treatment,
      veterinarian: healthData.veterinarian,
      cost: healthData.cost,
      animalId: animal.id,
      animal,
    });

    const savedRecord = await this.animalHealthRecordRepository.save(healthRecord);

    // Record medication expense if finance service is available
    if (this.financeService && healthData.cost && healthData.cost > 0) {
      try {
        await this.financeService.createTransaction({
          type: FinanceTransactionType.EXPENSE,
          amount: healthData.cost,
          description: `${healthData.type} - ${animal.tagNumber}: ${healthData.description}`,
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

    // Update inventory if medication was used and inventory service is available
    if (this.inventoryService && healthData.treatment) {
      try {
        const medication = await this.inventoryService.getInventoryItemByName(healthData.treatment);
        if (medication) {
          // Extract numeric value from treatment (e.g., "10ml" -> 10)
          const dosageAmount = parseFloat(healthData.treatment.replace(/[^\d.]/g, ''));
          if (dosageAmount > 0) {
            await this.inventoryService.recordTransaction({
              itemId: medication.id,
              type: TransactionType.USAGE,
              quantity: dosageAmount,
              reason: `${healthData.type} for ${animal.tagNumber}`,
              userId: healthData.recordedById,
            });
          }
        }
      } catch (error) {
        console.warn('Failed to update medication inventory:', error);
      }
    }

    return savedRecord;
  }

  async getHealthRecords(animalId: string, type?: string): Promise<AnimalHealthRecord[]> {
    const query = this.animalHealthRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.animal', 'animal')
      .where('record.animalId = :animalId', { animalId });

    if (type) {
      query.andWhere('record.type = :type', { type });
    }

    return query.orderBy('record.date', 'DESC').getMany();
  }

  // Breeding Management
  async recordBreeding(breedingData: {
    femaleId: string;
    maleId: string;
    breedingDate: Date;
    breedingMethod: 'natural' | 'artificial_insemination';
    notes?: string;
    recordedById: string;
  }): Promise<BreedingRecord> {
    const female = await this.getAnimalById(breedingData.femaleId);
    const male = await this.getAnimalById(breedingData.maleId);

    if (female.gender !== 'female') {
      throw new BadRequestError('First animal must be female');
    }

    if (male.gender !== 'male') {
      throw new BadRequestError('Second animal must be male');
    }

    if (female.species !== male.species) {
      throw new BadRequestError('Animals must be of the same species');
    }

    const breedingRecord = this.breedingRecordRepository.create({
      matingDate: breedingData.breedingDate,
      breedingMethod: breedingData.breedingMethod,
      notes: breedingData.notes,
      expectedDeliveryDate: this.calculateDueDate(breedingData.breedingDate, female.species),
      femaleId: breedingData.femaleId,
      maleId: breedingData.maleId,
    });

    return this.breedingRecordRepository.save(breedingRecord);
  }

  async recordBirth(
    breedingRecordId: string,
    birthData: {
      birthDate: Date;
      totalOffspring: number;
      aliveOffspring: number;
      deadOffspring: number;
      complications?: string;
      notes?: string;
      recordedById: string;
    },
  ): Promise<BreedingRecord> {
    const breedingRecord = await this.breedingRecordRepository.findOne({
      where: { id: breedingRecordId },
    });

    if (!breedingRecord) {
      throw new NotFoundError('Breeding record not found');
    }

    Object.assign(breedingRecord, {
      actualDeliveryDate: birthData.birthDate,
      notes: birthData.notes,
    });

    return this.breedingRecordRepository.save(breedingRecord);
  }

  async getBreedingRecords(
    animalId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<BreedingRecord[]> {
    const query = this.breedingRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.female', 'female')
      .leftJoinAndSelect('record.male', 'male');

    if (animalId) {
      query.andWhere('(record.femaleId = :animalId OR record.maleId = :animalId)', { animalId });
    }

    if (startDate) {
      query.andWhere('record.matingDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('record.matingDate <= :endDate', { endDate });
    }

    return query.orderBy('record.matingDate', 'DESC').getMany();
  }

  // Production Management
  async recordProduction(productionData: {
    animalId: string;
    date: Date;
    productionType: ProductionType;
    quantity: number;
    unit: string;
    weight?: number;
    quality?: number;
    notes?: string;
    recordedById: string;
  }): Promise<ProductionLog> {
    const animal = await this.getAnimalById(productionData.animalId);

    const productionLog = this.productionLogRepository.create({
      date: productionData.date,
      productionType: productionData.productionType,
      quantity: productionData.quantity,
      unit: productionData.unit,
      weight: productionData.weight,
      quality: productionData.quality,
      notes: productionData.notes,
      animalId: animal.id,
      animal,
    });

    const savedLog = await this.productionLogRepository.save(productionLog);

    return savedLog;
  }

  async getProductionLogs(
    animalId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ProductionLog[]> {
    const query = this.productionLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.animal', 'animal')
      .where('log.animalId = :animalId', { animalId });

    if (startDate) {
      query.andWhere('log.date >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('log.date <= :endDate', { endDate });
    }

    return query.orderBy('log.date', 'DESC').getMany();
  }

  // Feeding Management
  async recordFeeding(feedingData: {
    animalId: string;
    feedType: FeedType;
    quantity: number;
    unit: string;
    feedingTime: Date;
    notes?: string;
    recordedById: string;
  }): Promise<AnimalFeedingLog> {
    const animal = await this.getAnimalById(feedingData.animalId);

    // Check inventory if inventory service is available
    if (this.inventoryService) {
      try {
        const feedInventory = await this.inventoryService.getInventoryItemByName(
          feedingData.feedType,
        );
        if (feedInventory && feedInventory.currentStock < feedingData.quantity) {
          throw new BadRequestError(
            `Insufficient feed stock. Available: ${feedInventory.currentStock}${feedingData.unit}, Required: ${feedingData.quantity}${feedingData.unit}`,
          );
        }

        // Update inventory
        if (feedInventory) {
          await this.inventoryService.recordTransaction({
            itemId: feedInventory.id,
            type: TransactionType.USAGE,
            quantity: feedingData.quantity,
            reason: `Fed to ${animal.tagNumber}`,
            userId: feedingData.recordedById,
          });
        }
      } catch (error) {
        console.warn('Inventory service not available or error occurred:', error);
        // Continue without inventory integration if service is not available
      }
    }

    const feedingLog = this.animalFeedingLogRepository.create({
      feedingTime: feedingData.feedingTime,
      feedType: feedingData.feedType,
      quantity: feedingData.quantity,
      unit: feedingData.unit,
      feedingNotes: feedingData.notes,
      animalId: animal.id,
      animal,
      fedById: feedingData.recordedById,
    });

    const savedLog = await this.animalFeedingLogRepository.save(feedingLog);

    return savedLog;
  }

  async getFeedingLogs(
    animalId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AnimalFeedingLog[]> {
    const query = this.animalFeedingLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.animal', 'animal')
      .where('log.animalId = :animalId', { animalId });

    if (startDate) {
      query.andWhere('log.feedingTime >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('log.feedingTime <= :endDate', { endDate });
    }

    return query.orderBy('log.feedingTime', 'DESC').getMany();
  }

  // Sales Management
  async recordAnimalSale(saleData: {
    animalId: string;
    saleDate: Date;
    salePrice: number;
    buyerName?: string;
    buyerContact?: string;
    notes?: string;
    recordedById: string;
  }): Promise<AnimalSale> {
    const animal = await this.getAnimalById(saleData.animalId);

    if (animal.status !== AnimalStatus.ACTIVE) {
      throw new BadRequestError('Animal is not available for sale');
    }

    const sale = this.animalSaleRepository.create({
      date: saleData.saleDate,
      salePrice: saleData.salePrice,
      buyerName: saleData.buyerName,
      buyerContact: saleData.buyerContact,
      notes: saleData.notes,
      animalId: animal.id,
      animal,
    });

    const savedSale = await this.animalSaleRepository.save(sale);

    // Update animal status
    await this.updateAnimal(animal.id, { status: AnimalStatus.SOLD });

    // Record income if finance service is available
    if (this.financeService) {
      try {
        await this.financeService.createTransaction({
          type: FinanceTransactionType.INCOME,
          amount: saleData.salePrice,
          description: `Sale - ${animal.tagNumber} (${animal.breed})`,
          category_id: 'livestock_sales',
          date: saleData.saleDate,
          paymentMethod: PaymentMethod.CASH,
          referenceType: 'ANIMAL_SALE',
          referenceId: savedSale.id,
          recordedById: saleData.recordedById,
        });
      } catch (error) {
        console.warn('Failed to record animal sale revenue:', error);
      }
    }

    return savedSale;
  }

  async getSales(animalId?: string, startDate?: Date, endDate?: Date): Promise<AnimalSale[]> {
    const query = this.animalSaleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.animal', 'animal');

    if (animalId) {
      query.where('sale.animalId = :animalId', { animalId });
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
  async getAnimalPerformanceReport(animalId: string): Promise<{
    animal: Animal;
    totalHealthCost: number;
    totalFeedCost: number;
    totalProductionValue: number;
    totalSalesValue: number;
    profitLoss: number;
    averageProductionRate: number;
    healthIssuesCount: number;
    age: number;
  }> {
    const animal = await this.getAnimalById(animalId);

    const healthCost = await this.calculateHealthCosts(animalId);
    const feedCost = await this.calculateFeedCosts(animalId);
    const productionValue = await this.calculateProductionValue(animalId);
    const salesValue = await this.calculateSalesValue(animalId);

    const totalCosts = (animal.acquisitionCost || 0) + healthCost + feedCost;
    const totalRevenue = productionValue + salesValue;
    const profitLoss = totalRevenue - totalCosts;

    const averageProductionRate = await this.calculateAverageProductionRate(animalId);
    const healthIssuesCount = await this.getHealthIssuesCount(animalId);
    const age = this.calculateAge(animal.dateOfBirth);

    return {
      animal,
      totalHealthCost: healthCost,
      totalFeedCost: feedCost,
      totalProductionValue: productionValue,
      totalSalesValue: salesValue,
      profitLoss,
      averageProductionRate,
      healthIssuesCount,
      age,
    };
  }

  // Utility Methods
  private calculateDueDate(breedingDate: Date, species: AnimalType): Date {
    const dueDate = new Date(breedingDate);

    // Gestation periods in days
    const gestationPeriods = {
      [AnimalType.CATTLE]: 280,
      [AnimalType.GOAT]: 150,
      [AnimalType.SHEEP]: 147,
      [AnimalType.PIG]: 114,
      [AnimalType.RABBIT]: 31,
      [AnimalType.HORSE]: 340,
      [AnimalType.DONKEY]: 365,
    };

    const gestationDays = gestationPeriods[species as keyof typeof gestationPeriods] || 150;
    dueDate.setDate(dueDate.getDate() + gestationDays);

    return dueDate;
  }

  private calculateAge(dateOfBirth?: Date): number {
    if (!dateOfBirth) return 0;

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const diffTime = Math.abs(today.getTime() - birthDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.floor(diffDays / 365.25); // Age in years
  }

  private async calculateHealthCosts(animalId: string): Promise<number> {
    const healthRecords = await this.getHealthRecords(animalId);
    return healthRecords.reduce((sum, record) => sum + (record.cost || 0), 0);
  }

  private async calculateFeedCosts(animalId: string): Promise<number> {
    const feedingLogs = await this.getFeedingLogs(animalId);
    let totalCost = 0;

    if (this.inventoryService) {
      for (const log of feedingLogs) {
        try {
          const feedItem = await this.inventoryService.getInventoryItemByName(log.feedType);
          if (feedItem) {
            totalCost += log.quantity * (feedItem.unitCost || 0);
          }
        } catch (error) {
          console.warn('Failed to get feed cost for:', log.feedType);
        }
      }
    }

    return totalCost;
  }

  private async calculateProductionValue(animalId: string): Promise<number> {
    const productionLogs = await this.getProductionLogs(animalId);

    // Default production prices - could be made configurable
    const productionPrices = {
      [ProductionType.MILK]: 1.5, // per liter
      [ProductionType.MEAT]: 8.0, // per kg
      [ProductionType.WOOL]: 12.0, // per kg
      [ProductionType.EGGS]: 0.25, // per egg
      [ProductionType.MANURE]: 5.0, // per unit
    };

    return productionLogs.reduce((sum, log) => {
      const pricePerUnit =
        productionPrices[log.productionType as keyof typeof productionPrices] || 0;
      return sum + log.quantity * pricePerUnit;
    }, 0);
  }

  private async calculateSalesValue(animalId: string): Promise<number> {
    const sales = await this.getSales(animalId);
    return sales.reduce((sum, sale) => sum + sale.salePrice, 0);
  }

  private async calculateAverageProductionRate(animalId: string): Promise<number> {
    const productionLogs = await this.getProductionLogs(animalId);

    if (productionLogs.length === 0) return 0;

    const totalProduction = productionLogs.reduce((sum, log) => sum + log.quantity, 0);
    return totalProduction / productionLogs.length;
  }

  private async getHealthIssuesCount(animalId: string): Promise<number> {
    const healthRecords = await this.getHealthRecords(animalId);
    return healthRecords.filter(
      (record) =>
        record.type === 'illness' || record.type === 'injury' || record.type === 'treatment',
    ).length;
  }

  async getHerdSummary(species?: AnimalType): Promise<{
    totalAnimals: number;
    activeAnimals: number;
    soldAnimals: number;
    deadAnimals: number;
    totalProduction: number;
    totalSales: number;
    totalRevenue: number;
    averageAge: number;
    healthIssuesRate: number;
  }> {
    const query = this.animalRepository.createQueryBuilder('animal');

    if (species) {
      query.where('animal.species = :species', { species });
    }

    const animals = await query.getMany();

    const totalAnimals = animals.length;
    const activeAnimals = animals.filter((a) => a.status === AnimalStatus.ACTIVE).length;
    const soldAnimals = animals.filter((a) => a.status === AnimalStatus.SOLD).length;
    const deadAnimals = animals.filter((a) => a.status === AnimalStatus.DEAD).length;

    const totalProduction = animals.reduce((sum, a) => sum + (a.weight || 0), 0);
    const totalSales = animals.reduce((sum, a) => sum + (a.acquisitionCost || 0), 0);
    const totalRevenue = totalSales; // Could include production revenue

    const averageAge =
      totalAnimals > 0
        ? animals.reduce((sum, a) => sum + this.calculateAge(a.dateOfBirth), 0) / totalAnimals
        : 0;

    // Calculate health issues rate (placeholder - would need actual calculation)
    const healthIssuesRate = 0; // Would calculate based on health records

    return {
      totalAnimals,
      activeAnimals,
      soldAnimals,
      deadAnimals,
      totalProduction,
      totalSales,
      totalRevenue,
      averageAge,
      healthIssuesRate,
    };
  }
}
