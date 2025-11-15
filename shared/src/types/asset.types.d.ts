import { BaseEntity, Status, Location } from './common.types';
import { User } from './user.types';
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'out_of_service';
export declare enum AssetType {
    VEHICLE = "vehicle",
    MACHINERY = "machinery",
    EQUIPMENT = "equipment",
    TOOLS = "tools",
    FURNITURE = "furniture",
    BUILDING = "building",
    LAND = "land",
    TECHNOLOGY = "technology",
    OTHER = "other"
}
export declare enum AssetStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    MAINTENANCE = "maintenance",
    DISPOSED = "disposed",
    LOST = "lost"
}
export declare enum MaintenanceType {
    PREVENTIVE = "preventive",
    CORRECTIVE = "corrective",
    EMERGENCY = "emergency",
    ROUTINE = "routine"
}
export declare enum MaintenanceStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    OVERDUE = "overdue"
}
export declare enum DepreciationMethod {
    STRAIGHT_LINE = "straight_line",
    DECLINING_BALANCE = "declining_balance",
    UNITS_OF_PRODUCTION = "units_of_production"
}
export interface Asset extends BaseEntity {
    assetNumber: string;
    name: string;
    category: AssetType;
    description?: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    purchaseDate: Date;
    purchasePrice: number;
    currentValue: number;
    depreciationRate?: number;
    depreciationMethod?: 'straight_line' | 'declining_balance' | 'units_of_production';
    usefulLife?: number;
    location: Location;
    condition: AssetCondition;
    status: AssetStatus;
    warrantyExpiry?: Date;
    insuranceExpiry?: Date;
    lastMaintenanceDate?: Date;
    nextMaintenanceDate?: Date;
    assignedTo?: User;
    notes?: string;
    isActive: boolean;
    maintenanceLogs: MaintenanceLog[];
    usageLogs: AssetUsageLog[];
    documents: AssetDocument[];
}
export interface MaintenanceLog extends BaseEntity {
    assetId: string;
    asset: Asset;
    maintenanceNumber: string;
    type: MaintenanceType;
    status: MaintenanceStatus;
    scheduledDate: Date;
    actualDate?: Date;
    description: string;
    partsReplaced?: string;
    laborHours?: number;
    cost: number;
    contractor?: string;
    contractorContact?: string;
    warranty?: string;
    nextMaintenanceDate?: Date;
    notes?: string;
    recordedBy: User;
    performedBy?: User;
    documents: AssetDocument[];
}
export interface AssetUsageLog extends BaseEntity {
    assetId: string;
    asset: Asset;
    usageDate: Date;
    operatorId?: string;
    operator?: User;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    fuelUsed?: number;
    mileage?: number;
    location?: string;
    purpose: string;
    notes?: string;
    recordedBy: User;
}
export interface AssetDocument extends BaseEntity {
    assetId?: string;
    asset?: Asset;
    maintenanceLogId?: string;
    maintenanceLog?: MaintenanceLog;
    documentType: 'manual' | 'warranty' | 'insurance' | 'invoice' | 'receipt' | 'photo' | 'other';
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    description?: string;
    uploadedBy: User;
}
export interface AssetDepreciation extends BaseEntity {
    assetId: string;
    asset: Asset;
    depreciationDate: Date;
    depreciationAmount: number;
    accumulatedDepreciation: number;
    bookValue: number;
    depreciationMethod: 'straight_line' | 'declining_balance' | 'units_of_production';
    calculatedBy: User;
}
export type ProductionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export declare enum AuxiliaryProductType {
    PAPER_CRATE = "paper_crate",
    ICE_BLOCK = "ice_block",
    MANUAL_PACKAGING = "manual_packaging",
    SERVICE = "service",
    OTHER = "other"
}
export interface AuxiliaryProduction extends BaseEntity {
    productionNumber: string;
    productType: AuxiliaryProductType;
    productName: string;
    description?: string;
    productionDate: Date;
    quantityProduced: number;
    unit: string;
    costPerUnit: number;
    totalCost: number;
    sellingPricePerUnit?: number;
    quantityDispatched: number;
    quantityRemaining: number;
    status: ProductionStatus;
    location?: Location;
    notes?: string;
    recordedBy: User;
    productionLogs: ProductionLog[];
    dispatchLogs: DispatchLog[];
    sales: AuxiliaryProductSale[];
}
export interface ProductionLog extends BaseEntity {
    productionId: string;
    production: AuxiliaryProduction;
    date: Date;
    startTime: Date;
    endTime?: Date;
    laborHours?: number;
    materialsUsed?: string;
    quantityProduced: number;
    qualityNotes?: string;
    cost: number;
    operatorId?: string;
    operator?: User;
    notes?: string;
    recordedBy: User;
}
export interface DispatchLog extends BaseEntity {
    productionId: string;
    production: AuxiliaryProduction;
    dispatchDate: Date;
    quantity: number;
    destination: string;
    customerName?: string;
    customerContact?: string;
    transportMethod?: string;
    transportCost?: number;
    driverId?: string;
    driver?: User;
    notes?: string;
    recordedBy: User;
}
export interface AuxiliaryProductSale extends BaseEntity {
    productionId: string;
    production: AuxiliaryProduction;
    saleDate: Date;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    customerName: string;
    customerContact?: string;
    paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'credit';
    paymentStatus: 'pending' | 'partial' | 'paid';
    deliveryDate?: Date;
    deliveryLocation?: string;
    transportCost?: number;
    notes?: string;
    recordedBy: User;
}
export interface CreateAssetRequest {
    assetNumber: string;
    name: string;
    category: AssetType;
    description?: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    purchaseDate: Date;
    purchasePrice: number;
    currentValue: number;
    depreciationRate?: number;
    depreciationMethod?: 'straight_line' | 'declining_balance' | 'units_of_production';
    usefulLife?: number;
    locationId: string;
    condition: AssetCondition;
    warrantyExpiry?: Date;
    insuranceExpiry?: Date;
    assignedToId?: string;
    notes?: string;
}
export interface UpdateAssetRequest {
    name?: string;
    category?: AssetType;
    description?: string;
    brand?: string;
    model?: string;
    currentValue?: number;
    depreciationRate?: number;
    locationId?: string;
    condition?: AssetCondition;
    status?: Status;
    warrantyExpiry?: Date;
    insuranceExpiry?: Date;
    assignedToId?: string;
    notes?: string;
}
export interface CreateMaintenanceLogRequest {
    assetId: string;
    type: MaintenanceType;
    scheduledDate: Date;
    description: string;
    cost: number;
    contractor?: string;
    contractorContact?: string;
    warranty?: string;
    nextMaintenanceDate?: Date;
    notes?: string;
}
export interface UpdateMaintenanceLogRequest {
    status?: MaintenanceStatus;
    actualDate?: Date;
    description?: string;
    partsReplaced?: string;
    laborHours?: number;
    cost?: number;
    contractor?: string;
    contractorContact?: string;
    warranty?: string;
    nextMaintenanceDate?: Date;
    notes?: string;
    performedById?: string;
}
export interface CreateAssetUsageLogRequest {
    assetId: string;
    usageDate: Date;
    operatorId?: string;
    startTime: Date;
    endTime?: Date;
    fuelUsed?: number;
    mileage?: number;
    location?: string;
    purpose: string;
    notes?: string;
}
export interface CreateAuxiliaryProductionRequest {
    productType: AuxiliaryProductType;
    productName: string;
    description?: string;
    productionDate: Date;
    quantityProduced: number;
    unit: string;
    costPerUnit: number;
    sellingPricePerUnit?: number;
    locationId?: string;
    notes?: string;
}
export interface UpdateAuxiliaryProductionRequest {
    productName?: string;
    description?: string;
    quantityProduced?: number;
    costPerUnit?: number;
    sellingPricePerUnit?: number;
    quantityDispatched?: number;
    status?: ProductionStatus;
    locationId?: string;
    notes?: string;
}
export interface CreateAuxiliaryProductionLogRequest {
    productionId: string;
    date: Date;
    startTime: Date;
    endTime?: Date;
    laborHours?: number;
    materialsUsed?: string;
    quantityProduced: number;
    qualityNotes?: string;
    cost: number;
    operatorId?: string;
    notes?: string;
}
export interface CreateDispatchLogRequest {
    productionId: string;
    dispatchDate: Date;
    quantity: number;
    destination: string;
    customerName?: string;
    customerContact?: string;
    transportMethod?: string;
    transportCost?: number;
    driverId?: string;
    notes?: string;
}
export interface AssetStats {
    totalAssets: number;
    totalAssetValue: number;
    assetsByCategory: Record<AssetType, number>;
    assetsByCondition: Record<AssetCondition, number>;
    assetsNeedingMaintenance: number;
    totalMaintenanceCost: number;
    averageAssetAge: number;
    depreciationValue: number;
    mostUsedAssets: Array<{
        assetId: string;
        assetName: string;
        usageHours: number;
        maintenanceCost: number;
    }>;
    upcomingMaintenances: Array<{
        assetId: string;
        assetName: string;
        maintenanceDate: Date;
        maintenanceType: MaintenanceType;
    }>;
}
export interface AuxiliaryProductionStats {
    totalProductions: number;
    totalQuantityProduced: number;
    totalProductionCost: number;
    totalRevenue: number;
    profitMargin: number;
    productionByType: Record<AuxiliaryProductType, number>;
    productionByMonth: Array<{
        month: string;
        quantity: number;
        cost: number;
        revenue: number;
    }>;
    topSellingProducts: Array<{
        productType: AuxiliaryProductType;
        productName: string;
        quantitySold: number;
        revenue: number;
    }>;
}
//# sourceMappingURL=asset.types.d.ts.map