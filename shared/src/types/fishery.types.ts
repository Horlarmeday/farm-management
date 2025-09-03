import { BaseEntity, Status, Location } from './common.types';
import { User } from './user.types';

// Fishery types
export type FishSpecies = 'tilapia' | 'catfish' | 'carp' | 'trout' | 'salmon' | 'bass' | 'other';
export type WaterSource = 'borehole' | 'river' | 'lake' | 'municipal' | 'rainwater';
export type FeedingMethod = 'manual' | 'automatic' | 'demand';

// Fishery enums
export enum PondType {
  EARTHEN = 'earthen',
  CONCRETE = 'concrete',
  PLASTIC_TANK = 'plastic_tank',
  CAGE = 'cage',
  RACEWAYS = 'raceways',
}

export enum PondStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  UNDER_CONSTRUCTION = 'under_construction',
}

export interface Pond extends BaseEntity {
  name: string;
  code: string;
  type: PondType;
  location: Location;
  length: number; // in meters
  width: number; // in meters
  depth: number; // in meters
  capacity: number; // in cubic meters
  waterSource: WaterSource;
  constructionDate: Date;
  lastRenovationDate?: Date;
  status: PondStatus;
  notes?: string;
  managedBy: User;
  isActive: boolean;

  // Relationships
  stockingLogs: FishStockingLog[];
  waterQualityLogs: WaterQualityLog[];
  feedingLogs: FishFeedingLog[];
  samplingLogs: FishSamplingLog[];
  harvestLogs: FishHarvestLog[];
  maintenanceLogs: PondMaintenanceLog[];
}

export interface FishStockingLog extends BaseEntity {
  pondId: string;
  pond: Pond;
  stockingDate: Date;
  fishSpecies: FishSpecies;
  fingerlingSource: string;
  supplier?: string;
  quantity: number;
  averageWeight: number; // in grams
  costPerFingerling: number;
  totalCost: number;
  expectedHarvestDate?: Date;
  notes?: string;
  recordedBy: User;
}

export interface WaterQualityLog extends BaseEntity {
  pondId: string;
  pond: Pond;
  date: Date;
  time: string;
  temperature: number; // in Celsius
  pH: number;
  dissolvedOxygen: number; // in mg/L
  ammonia?: number; // in mg/L
  nitrite?: number; // in mg/L
  nitrate?: number; // in mg/L
  turbidity?: number; // in NTU
  salinity?: number; // in ppt
  alkalinity?: number; // in mg/L
  hardness?: number; // in mg/L
  weatherConditions?: string;
  notes?: string;
  recordedBy: User;
}

export interface FishFeedingLog extends BaseEntity {
  pondId: string;
  pond: Pond;
  date: Date;
  feedType: string;
  feedBrand?: string;
  proteinContent?: number; // percentage
  quantityKg: number;
  feedCostPerKg: number;
  totalCost: number;
  feedingMethod: FeedingMethod;
  feedingTimes: number; // times per day
  feedConversionRatio?: number;
  notes?: string;
  recordedBy: User;
}

export interface FishSamplingLog extends BaseEntity {
  pondId: string;
  pond: Pond;
  date: Date;
  samplingMethod: 'net' | 'seine' | 'electrofishing' | 'random';
  sampleSize: number;
  averageWeight: number; // in grams
  minWeight: number;
  maxWeight: number;
  totalBiomass?: number; // in kg
  survivalRate?: number; // percentage
  growthRate?: number; // grams per day
  feedConversionRatio?: number;
  healthObservations?: string;
  mortalityCount?: number;
  notes?: string;
  recordedBy: User;
}

export interface FishHarvestLog extends BaseEntity {
  pondId: string;
  pond: Pond;
  harvestDate: Date;
  harvestMethod: 'complete' | 'partial' | 'selective';
  quantityHarvested: number; // number of fish
  totalWeight: number; // in kg
  averageWeight: number; // in grams
  pricePerKg?: number;
  totalValue?: number;
  buyerName?: string;
  buyerContact?: string;
  marketDestination?: string;
  survivalRate?: number;
  finalFeedConversionRatio?: number;
  productionCycle: number; // days from stocking to harvest
  notes?: string;
  recordedBy: User;
}

export interface PondMaintenanceLog extends BaseEntity {
  pondId: string;
  pond: Pond;
  date: Date;
  maintenanceType: 'cleaning' | 'repair' | 'liming' | 'fertilizing' | 'pond_preparation';
  description: string;
  materialsUsed?: string;
  cost: number;
  laborHours?: number;
  contractorName?: string;
  nextMaintenanceDate?: Date;
  notes?: string;
  recordedBy: User;
}

export interface FishSale extends BaseEntity {
  harvestLogId: string;
  harvestLog: FishHarvestLog;
  saleDate: Date;
  quantity: number; // in kg
  pricePerKg: number;
  totalAmount: number;
  buyerName: string;
  buyerContact?: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'credit';
  paymentStatus: 'pending' | 'partial' | 'paid';
  deliveryDate?: Date;
  deliveryLocation?: string;
  transportCost?: number;
  notes?: string;
  recordedBy: User;
}

export interface FishMortality extends BaseEntity {
  pondId: string;
  pond: Pond;
  date: Date;
  mortalityCount: number;
  suspectedCause?: string;
  symptoms?: string;
  actionTaken?: string;
  treatmentApplied?: string;
  cost?: number;
  notes?: string;
  recordedBy: User;
}

// Request/Response types
export interface CreatePondRequest {
  name: string;
  code: string;
  type: PondType;
  locationId: string;
  length: number;
  width: number;
  depth: number;
  waterSource: WaterSource;
  constructionDate: Date;
  notes?: string;
}

export interface UpdatePondRequest {
  name?: string;
  type?: PondType;
  locationId?: string;
  length?: number;
  width?: number;
  depth?: number;
  waterSource?: WaterSource;
  lastRenovationDate?: Date;
  status?: Status;
  notes?: string;
}

export interface CreateStockingLogRequest {
  pondId: string;
  stockingDate: Date;
  fishSpecies: FishSpecies;
  fingerlingSource: string;
  supplier?: string;
  quantity: number;
  averageWeight: number;
  costPerFingerling: number;
  expectedHarvestDate?: Date;
  notes?: string;
}

export interface CreateWaterQualityLogRequest {
  pondId: string;
  date: Date;
  time: string;
  temperature: number;
  pH: number;
  dissolvedOxygen: number;
  ammonia?: number;
  nitrite?: number;
  nitrate?: number;
  turbidity?: number;
  salinity?: number;
  alkalinity?: number;
  hardness?: number;
  weatherConditions?: string;
  notes?: string;
}

export interface CreateFishFeedingLogRequest {
  pondId: string;
  date: Date;
  feedType: string;
  feedBrand?: string;
  proteinContent?: number;
  quantityKg: number;
  feedCostPerKg: number;
  feedingMethod: FeedingMethod;
  feedingTimes: number;
  notes?: string;
}

export interface CreateSamplingLogRequest {
  pondId: string;
  date: Date;
  samplingMethod: 'net' | 'seine' | 'electrofishing' | 'random';
  sampleSize: number;
  averageWeight: number;
  minWeight: number;
  maxWeight: number;
  totalBiomass?: number;
  survivalRate?: number;
  mortalityCount?: number;
  healthObservations?: string;
  notes?: string;
}

export interface CreateHarvestLogRequest {
  pondId: string;
  harvestDate: Date;
  harvestMethod: 'complete' | 'partial' | 'selective';
  quantityHarvested: number;
  totalWeight: number;
  averageWeight: number;
  pricePerKg?: number;
  buyerName?: string;
  buyerContact?: string;
  marketDestination?: string;
  notes?: string;
}

// Analytics and Statistics
export interface FisheryStats {
  totalPonds: number;
  activePonds: number;
  totalFishStock: number;
  totalBiomass: number;
  averageWaterQuality: {
    temperature: number;
    pH: number;
    dissolvedOxygen: number;
  };
  totalFeedUsed: number;
  averageFeedConversionRatio: number;
  totalHarvestThisMonth: number;
  totalRevenueThisMonth: number;
  totalCosts: number;
  profitMargin: number;
  mortalityRate: number;
  survivalRate: number;
  pondsByType: Record<PondType, number>;
  fishBySpecies: Record<FishSpecies, number>;
}
