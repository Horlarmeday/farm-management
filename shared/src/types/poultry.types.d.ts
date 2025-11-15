import { BaseEntity, Status, Location } from './common.types';
import { User } from './user.types';
export type BirdGrowthStage = 'chick' | 'grower' | 'adult' | 'spent';
export type EggGrade = 'AA' | 'A' | 'B' | 'C' | 'cracked' | 'dirty';
export type VaccineType = 'newcastle' | 'infectious_bronchitis' | 'fowl_pox' | 'marek' | 'other';
export declare enum BirdType {
    LAYER = "layer",
    BROILER = "broiler",
    BREEDER = "breeder",
    DUAL_PURPOSE = "dual_purpose"
}
export declare enum BirdStatus {
    ACTIVE = "active",
    SOLD = "sold",
    DECEASED = "deceased",
    CULLED = "culled"
}
export interface BirdBatch extends BaseEntity {
    batchCode: string;
    birdType: BirdType;
    breed: string;
    initialQuantity: number;
    currentQuantity: number;
    arrivalDate: Date;
    source: string;
    supplier?: string;
    houseLocation: Location;
    growthStage: BirdGrowthStage;
    status: BirdStatus;
    expectedMaturityDate?: Date;
    actualMaturityDate?: Date;
    notes?: string;
    costPerBird: number;
    managedBy: User;
    isActive: boolean;
    feedingLogs: BirdFeedingLog[];
    healthRecords: BirdHealthRecord[];
    eggProductionLogs: EggProductionLog[];
    sales: BirdSale[];
}
export interface BirdFeedingLog extends BaseEntity {
    batchId: string;
    batch: BirdBatch;
    date: Date;
    feedType: string;
    quantityKg: number;
    feedCostPerKg: number;
    totalCost: number;
    feedConversionRatio?: number;
    notes?: string;
    recordedBy: User;
}
export interface BirdHealthRecord extends BaseEntity {
    batchId: string;
    batch: BirdBatch;
    date: Date;
    type: 'vaccination' | 'treatment' | 'disease' | 'inspection';
    vaccineType?: VaccineType;
    disease?: string;
    treatment?: string;
    medicationUsed?: string;
    dosage?: string;
    mortalityCount?: number;
    cullingCount?: number;
    affectedCount?: number;
    symptoms?: string;
    actionTaken: string;
    cost: number;
    vetId?: string;
    veterinarian?: string;
    notes?: string;
    recordedBy: User;
    nextDueDate?: Date;
}
export interface EggProductionLog extends BaseEntity {
    batchId: string;
    batch: BirdBatch;
    date: Date;
    totalEggs: number;
    gradeAA: number;
    gradeA: number;
    gradeB: number;
    gradeC: number;
    crackedEggs: number;
    dirtyEggs: number;
    avgEggWeight: number;
    productionRate: number;
    packagingStatus: 'pending' | 'packed' | 'dispatched';
    notes?: string;
    recordedBy: User;
}
export interface BirdSale extends BaseEntity {
    batchId: string;
    batch: BirdBatch;
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
    recordedBy: User;
}
export interface EggPackaging extends BaseEntity {
    productionLogId: string;
    productionLog: EggProductionLog;
    packagingDate: Date;
    packageType: 'crate' | 'carton' | 'tray';
    packageSize: number;
    totalPackages: number;
    totalEggs: number;
    qualityGrade: EggGrade;
    expiryDate: Date;
    batchNumber: string;
    storageLocation: string;
    status: 'packed' | 'stored' | 'dispatched' | 'sold';
    notes?: string;
    packagedBy: User;
}
export interface EggSale extends BaseEntity {
    packagingId: string;
    packaging: EggPackaging;
    saleDate: Date;
    quantity: number;
    unit: 'piece' | 'crate' | 'carton';
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
    recordedBy: User;
}
export interface CreateBirdBatchRequest {
    batchCode: string;
    birdType: BirdType;
    breed: string;
    initialQuantity: number;
    arrivalDate: Date;
    source: string;
    supplier?: string;
    houseLocationId: string;
    costPerBird: number;
    notes?: string;
}
export interface UpdateBirdBatchRequest {
    birdType?: BirdType;
    breed?: string;
    currentQuantity?: number;
    houseLocationId?: string;
    growthStage?: BirdGrowthStage;
    status?: Status;
    actualMaturityDate?: Date;
    notes?: string;
}
export interface CreatePoultryFeedingLogRequest {
    batchId: string;
    date: Date;
    feedType: string;
    quantityKg: number;
    feedCostPerKg: number;
    notes?: string;
}
export interface CreatePoultryHealthRecordRequest {
    batchId: string;
    date: Date;
    type: 'vaccination' | 'treatment' | 'disease' | 'inspection';
    vaccineType?: VaccineType;
    disease?: string;
    treatment?: string;
    medicationUsed?: string;
    dosage?: string;
    mortalityCount?: number;
    cullingCount?: number;
    affectedCount?: number;
    symptoms?: string;
    actionTaken: string;
    cost: number;
    vetId?: string;
    veterinarian?: string;
    notes?: string;
    nextDueDate?: Date;
}
export interface CreateEggProductionLogRequest {
    batchId: string;
    date: Date;
    totalEggs: number;
    gradeAA: number;
    gradeA: number;
    gradeB: number;
    gradeC: number;
    crackedEggs: number;
    dirtyEggs: number;
    avgEggWeight: number;
    notes?: string;
}
export interface PoultryStats {
    totalBirds: number;
    activeBatches: number;
    totalEggsToday: number;
    totalEggsThisMonth: number;
    avgProductionRate: number;
    mortalityRate: number;
    feedConversionRatio: number;
    totalRevenue: number;
    totalCosts: number;
    profitMargin: number;
    birdsByType: Record<BirdType, number>;
    birdsByStage: Record<BirdGrowthStage, number>;
}
//# sourceMappingURL=poultry.types.d.ts.map