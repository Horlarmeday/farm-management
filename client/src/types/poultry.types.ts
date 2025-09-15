// Poultry Management Types

export enum BirdType {
  BROILER = 'broiler',
  LAYER = 'layer',
  BREEDER = 'breeder',
  DUCK = 'duck',
  TURKEY = 'turkey',
  GOOSE = 'goose'
}

export enum BirdStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  DECEASED = 'deceased',
  TRANSFERRED = 'transferred'
}

export enum EggGrade {
  AA = 'AA',
  A = 'A',
  B = 'B',
  C = 'C'
}

export enum HealthRecordType {
  VACCINATION = 'vaccination',
  TREATMENT = 'treatment',
  DISEASE = 'disease',
  INSPECTION = 'inspection'
}

// Bird Batch Interface
export interface BirdBatch {
  id: string;
  batchNumber: string;
  birdType: BirdType;
  breed: string;
  initialCount: number;
  currentCount: number;
  hatchDate: Date;
  arrivalDate: Date;
  supplier: string;
  locationId: string;
  status: BirdStatus;
  notes?: string;
  farmId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Bird Feeding Log
export interface BirdFeedingLog {
  id: string;
  batchId: string;
  feedType: string;
  quantity: number;
  unit: string;
  feedingTime: Date;
  cost: number;
  notes?: string;
  recordedBy: string;
  createdAt: Date;
}

// Bird Health Record
export interface BirdHealthRecord {
  id: string;
  batchId: string;
  type: HealthRecordType;
  description: string;
  treatmentDate: Date;
  medication?: string;
  dosage?: string;
  veterinarian?: string;
  cost?: number;
  notes?: string;
  recordedBy: string;
  createdAt: Date;
}

// Egg Production Log
export interface EggProductionLog {
  id: string;
  batchId: string;
  collectionDate: Date;
  totalEggs: number;
  gradeAA?: number;
  gradeA?: number;
  gradeB?: number;
  gradeC?: number;
  cracked?: number;
  dirty?: number;
  notes?: string;
  recordedBy: string;
  createdAt: Date;
}

// Bird Sale
export interface BirdSale {
  id: string;
  batchId: string;
  saleDate: Date;
  saleType: 'live_bird' | 'dressed' | 'spent_layer' | 'manure';
  quantity: number;
  unit: 'piece' | 'kg' | 'bag';
  unitPrice: number;
  totalAmount: number;
  buyerName: string;
  buyerContact?: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'credit';
  paymentStatus: 'pending' | 'partial' | 'paid';
  deliveryDate?: Date;
  deliveryLocation?: string;
  transportCost?: number;
  notes?: string;
  recordedBy: string;
  createdAt: Date;
}

// Request Types
export interface CreateBirdBatchRequest {
  batchNumber: string;
  birdType: BirdType;
  breed: string;
  initialCount: number;
  hatchDate: Date;
  arrivalDate: Date;
  supplier: string;
  locationId: string;
  notes?: string;
}

export interface UpdateBirdBatchRequest {
  batchNumber?: string;
  breed?: string;
  currentCount?: number;
  locationId?: string;
  status?: BirdStatus;
  notes?: string;
}

export interface CreatePoultryFeedingLogRequest {
  batchId: string;
  feedType: string;
  quantity: number;
  unit: string;
  feedingTime: Date;
  cost: number;
  notes?: string;
}

export interface CreatePoultryHealthRecordRequest {
  batchId: string;
  type: HealthRecordType;
  description: string;
  treatmentDate: Date;
  medication?: string;
  dosage?: string;
  veterinarian?: string;
  cost?: number;
  notes?: string;
}

export interface CreateEggProductionLogRequest {
  batchId: string;
  collectionDate: Date;
  totalEggs: number;
  gradeAA?: number;
  gradeA?: number;
  gradeB?: number;
  gradeC?: number;
  cracked?: number;
  dirty?: number;
  notes?: string;
}

// Analytics Types
export interface PoultryStats {
  totalBatches: number;
  activeBatches: number;
  totalBirds: number;
  totalEggProduction: number;
  averageProductionRate: number;
  mortalityRate: number;
  totalRevenue: number;
  totalCosts: number;
  profitMargin: number;
  feedConversionRatio: number;
}

export interface BatchPerformance {
  batchId: string;
  totalEggsProduced: number;
  averageProductionRate: number;
  totalFeedConsumed: number;
  feedConversionRatio: number;
  mortalityRate: number;
  totalRevenue: number;
  profitMargin: number;
}

export interface ProductionSummary {
  totalBatches: number;
  activeBatches: number;
  totalBirds: number;
  totalEggProduction: number;
  totalSales: number;
  totalRevenue: number;
  averageMortalityRate: number;
}