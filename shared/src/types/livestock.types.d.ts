import { BaseEntity, Location } from './common.types';
import { User } from './user.types';
export type AnimalSpecies = 'cattle' | 'goat' | 'sheep' | 'pig' | 'buffalo' | 'donkey' | 'horse' | 'rabbit' | 'chicken' | 'duck' | 'turkey' | 'guinea_fowl' | 'other';
export type AnimalGender = 'male' | 'female';
export type AnimalBreed = string;
export type BreedingMethod = 'natural' | 'artificial_insemination' | 'embryo_transfer';
export type PregnancyStatus = 'not_pregnant' | 'pregnant' | 'confirmed' | 'delivered' | 'aborted';
export declare enum AnimalStatus {
    ACTIVE = "active",
    ALIVE = "alive",
    SOLD = "sold",
    DEAD = "dead",
    DECEASED = "deceased",
    SICK = "sick",
    PREGNANT = "pregnant",
    LACTATING = "lactating",
    QUARANTINE = "quarantine",
    BREEDING = "breeding"
}
export declare enum AnimalType {
    CATTLE = "cattle",
    GOAT = "goat",
    SHEEP = "sheep",
    PIG = "pig",
    BUFFALO = "buffalo",
    DONKEY = "donkey",
    HORSE = "horse",
    RABBIT = "rabbit"
}
export declare enum ProductionType {
    MILK = "milk",
    EGGS = "eggs",
    WOOL = "wool",
    MANURE = "manure",
    MEAT = "meat"
}
export declare enum FeedType {
    GRASS = "grass",
    HAY = "hay",
    SILAGE = "silage",
    CONCENTRATE = "concentrate",
    PELLETS = "pellets",
    GRAIN = "grain",
    SUPPLEMENT = "supplement",
    OTHER = "other"
}
export interface Animal extends BaseEntity {
    tagNumber: string;
    species: AnimalSpecies;
    breed: string;
    gender: AnimalGender;
    dateOfBirth?: Date;
    acquisitionDate: Date;
    acquisitionSource: string;
    supplier?: string;
    parentMaleId?: string;
    parentFemaleId?: string;
    currentWeight?: number;
    targetWeight?: number;
    location: Location;
    status: AnimalStatus;
    healthStatus: 'healthy' | 'sick' | 'quarantine' | 'treatment';
    pregnancyStatus?: PregnancyStatus;
    expectedDeliveryDate?: Date;
    acquisitionCost: number;
    currentValue?: number;
    notes?: string;
    managedBy: User;
    isActive: boolean;
    healthRecords: AnimalHealthRecord[];
    breedingRecords: BreedingRecord[];
    productionLogs: AnimalProductionLog[];
    sales: AnimalSale[];
    feedingLogs: AnimalFeedingLog[];
    weightRecords: WeightRecord[];
}
export interface AnimalHealthRecord extends BaseEntity {
    animalId: string;
    animal: Animal;
    date: Date;
    type: 'vaccination' | 'treatment' | 'checkup' | 'deworming' | 'surgery';
    description: string;
    symptoms?: string;
    diagnosis?: string;
    treatment?: string;
    medicationUsed?: string;
    dosage?: string;
    cost: number;
    vetId?: string;
    veterinarian?: string;
    followUpDate?: Date;
    notes?: string;
    recordedBy: User;
}
export interface BreedingRecord extends BaseEntity {
    femaleId: string;
    female: Animal;
    maleId?: string;
    male?: Animal;
    breedingDate: Date;
    breedingMethod: BreedingMethod;
    pregnancyConfirmed: boolean;
    pregnancyConfirmDate?: Date;
    expectedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    offspringCount?: number;
    offspringIds?: string[];
    complications?: string;
    cost: number;
    notes?: string;
    recordedBy: User;
}
export interface AnimalProductionLog extends BaseEntity {
    animalId: string;
    animal: Animal;
    date: Date;
    productionType: 'milk' | 'eggs' | 'wool' | 'manure';
    quantity: number;
    unit: 'liters' | 'kg' | 'pieces';
    quality?: 'A' | 'B' | 'C';
    notes?: string;
    recordedBy: User;
}
export interface AnimalFeedingLog extends BaseEntity {
    animalId: string;
    animal: Animal;
    date: Date;
    feedType: string;
    quantityKg: number;
    feedCostPerKg: number;
    totalCost: number;
    supplementsUsed?: string;
    notes?: string;
    recordedBy: User;
}
export interface WeightRecord extends BaseEntity {
    animalId: string;
    animal: Animal;
    date: Date;
    weight: number;
    unit: 'kg' | 'lbs';
    measurementMethod: 'scale' | 'tape' | 'visual_estimate';
    bodyConditionScore?: number;
    notes?: string;
    recordedBy: User;
}
export interface AnimalSale extends BaseEntity {
    animalId: string;
    animal: Animal;
    saleDate: Date;
    saleType: 'live_animal' | 'meat' | 'breeding_stock';
    weight?: number;
    pricePerKg?: number;
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
export interface PastureManagement extends BaseEntity {
    name: string;
    location: Location;
    area: number;
    grassType: string;
    capacity: number;
    currentOccupancy: number;
    rotationSchedule?: string;
    lastGrazingDate?: Date;
    nextGrazingDate?: Date;
    status: 'available' | 'occupied' | 'resting' | 'maintenance';
    notes?: string;
    managedBy: User;
    grazingLogs: GrazingLog[];
}
export interface GrazingLog extends BaseEntity {
    pastureId: string;
    pasture: PastureManagement;
    animalIds: string[];
    animals: Animal[];
    startDate: Date;
    endDate?: Date;
    numberOfAnimals: number;
    averageWeight: number;
    grassQuality: 'excellent' | 'good' | 'fair' | 'poor';
    weatherConditions?: string;
    notes?: string;
    recordedBy: User;
}
export interface CreateAnimalRequest {
    tagNumber: string;
    species: AnimalSpecies;
    breed: string;
    gender: AnimalGender;
    dateOfBirth?: Date;
    acquisitionDate: Date;
    acquisitionSource: string;
    supplier?: string;
    parentMaleId?: string;
    parentFemaleId?: string;
    currentWeight?: number;
    locationId: string;
    acquisitionCost: number;
    notes?: string;
}
export interface UpdateAnimalRequest {
    tagNumber?: string;
    breed?: string;
    currentWeight?: number;
    targetWeight?: number;
    locationId?: string;
    status?: AnimalStatus;
    healthStatus?: 'healthy' | 'sick' | 'quarantine' | 'treatment';
    pregnancyStatus?: PregnancyStatus;
    expectedDeliveryDate?: Date;
    currentValue?: number;
    notes?: string;
}
export interface CreateLivestockHealthRecordRequest {
    animalId: string;
    date: Date;
    type: 'vaccination' | 'treatment' | 'checkup' | 'deworming' | 'surgery';
    description: string;
    symptoms?: string;
    diagnosis?: string;
    treatment?: string;
    medicationUsed?: string;
    dosage?: string;
    cost: number;
    vetId?: string;
    veterinarian?: string;
    followUpDate?: Date;
    notes?: string;
}
export interface CreateBreedingRecordRequest {
    femaleId: string;
    maleId?: string;
    breedingDate: Date;
    breedingMethod: BreedingMethod;
    expectedDeliveryDate?: Date;
    cost: number;
    notes?: string;
}
export interface CreateAnimalProductionLogRequest {
    animalId: string;
    date: Date;
    productionType: 'milk' | 'eggs' | 'wool' | 'manure';
    quantity: number;
    unit: 'liters' | 'kg' | 'pieces';
    quality?: 'A' | 'B' | 'C';
    notes?: string;
}
export interface CreateWeightRecordRequest {
    animalId: string;
    date: Date;
    weight: number;
    unit: 'kg' | 'lbs';
    measurementMethod: 'scale' | 'tape' | 'visual_estimate';
    bodyConditionScore?: number;
    notes?: string;
}
export interface LivestockStats {
    totalAnimals: number;
    animalsBySpecies: Record<AnimalSpecies, number>;
    animalsByStatus: Record<AnimalStatus, number>;
    animalsByGender: Record<AnimalGender, number>;
    pregnantAnimals: number;
    sickAnimals: number;
    totalMilkProduction: number;
    averageWeight: number;
    totalRevenue: number;
    totalCosts: number;
    profitMargin: number;
    mortalityRate: number;
    birthRate: number;
    averageAgeAtSale: number;
}
//# sourceMappingURL=livestock.types.d.ts.map