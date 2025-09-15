export enum AssetType {
  VEHICLE = 'vehicle',
  MACHINERY = 'machinery',
  EQUIPMENT = 'equipment',
  TOOLS = 'tools',
  FURNITURE = 'furniture',
  BUILDING = 'building',
  LAND = 'land',
  TECHNOLOGY = 'technology',
  OTHER = 'other',
}

export enum AssetStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  DISPOSED = 'disposed',
  LOST = 'lost',
}

export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'out_of_service';

export enum MaintenanceType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
  EMERGENCY = 'emergency',
  ROUTINE = 'routine',
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

export enum DepreciationMethod {
  STRAIGHT_LINE = 'straight_line',
  DECLINING_BALANCE = 'declining_balance',
  UNITS_OF_PRODUCTION = 'units_of_production',
}

export enum AuxiliaryProductType {
  PAPER_CRATE = 'paper_crate',
  ICE_BLOCK = 'ice_block',
  MANUAL_PACKAGING = 'manual_packaging',
  SERVICE = 'service',
  OTHER = 'other',
}

export type ProductionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

// Asset Interface
export interface Asset {
  id: string;
  farmId: string;
  name: string;
  type: AssetType;
  category?: string;
  description?: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  currentValue?: number;
  condition: AssetCondition;
  status: AssetStatus;
  location?: string;
  assignedTo?: string;
  warrantyExpiry?: Date;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  depreciationMethod?: DepreciationMethod;
  usefulLife?: number;
  salvageValue?: number;
  notes?: string;
  attachments?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Maintenance Log Interface
export interface MaintenanceLog {
  id: string;
  assetId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  title: string;
  description?: string;
  scheduledDate: Date;
  completedDate?: Date;
  cost?: number;
  performedBy?: string;
  notes?: string;
  attachments?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Equipment Interface
export interface Equipment {
  id: string;
  farmId: string;
  name: string;
  type: string;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  condition: AssetCondition;
  status: AssetStatus;
  location?: string;
  assignedTo?: string;
  specifications?: Record<string, any>;
  maintenanceSchedule?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Machinery Interface
export interface Machinery {
  id: string;
  farmId: string;
  name: string;
  type: string;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  condition: AssetCondition;
  status: AssetStatus;
  location?: string;
  assignedTo?: string;
  operatingHours?: number;
  fuelType?: string;
  specifications?: Record<string, any>;
  maintenanceSchedule?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request Types
export interface CreateAssetRequest {
  farmId: string;
  name: string;
  type: AssetType;
  category?: string;
  description?: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  condition: AssetCondition;
  status: AssetStatus;
  location?: string;
  assignedTo?: string;
  warrantyExpiry?: Date;
  depreciationMethod?: DepreciationMethod;
  usefulLife?: number;
  salvageValue?: number;
  notes?: string;
}

export interface UpdateAssetRequest {
  name?: string;
  type?: AssetType;
  category?: string;
  description?: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  currentValue?: number;
  condition?: AssetCondition;
  status?: AssetStatus;
  location?: string;
  assignedTo?: string;
  warrantyExpiry?: Date;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  depreciationMethod?: DepreciationMethod;
  usefulLife?: number;
  salvageValue?: number;
  notes?: string;
}

export interface CreateMaintenanceLogRequest {
  assetId: string;
  type: MaintenanceType;
  title: string;
  description?: string;
  scheduledDate: Date;
  cost?: number;
  performedBy?: string;
  notes?: string;
}

export interface UpdateMaintenanceLogRequest {
  type?: MaintenanceType;
  status?: MaintenanceStatus;
  title?: string;
  description?: string;
  scheduledDate?: Date;
  completedDate?: Date;
  cost?: number;
  performedBy?: string;
  notes?: string;
}

// Additional interfaces
export interface AssetUsageLog {
  id: string;
  assetId: string;
  usageDate: string;
  hoursUsed: number;
  operatorId?: string;
  operatorName?: string;
  fuelConsumed?: number;
  notes?: string;
  createdAt: string;
}

export interface AssetDepreciation {
  id: string;
  assetId: string;
  method: DepreciationMethod;
  usefulLife: number;
  salvageValue: number;
  currentValue: number;
  annualDepreciation: number;
  accumulatedDepreciation: number;
  calculatedAt: string;
}

export interface AssetStats {
  totalAssets: number;
  totalValue: number;
  activeAssets: number;
  maintenanceAssets: number;
  inactiveAssets: number;
  disposedAssets: number;
  averageAge: number;
  totalMaintenanceCost: number;
  utilizationRate: number;
}

export interface CreateAssetUsageLogRequest {
  assetId: string;
  usageDate: string;
  hoursUsed: number;
  operatorId?: string;
  operatorName?: string;
  fuelConsumed?: number;
  notes?: string;
}

export interface CreateEquipmentRequest {
  farmId: string;
  name: string;
  type: string;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  condition: AssetCondition;
  status: AssetStatus;
  location?: string;
  assignedTo?: string;
  specifications?: Record<string, any>;
  maintenanceSchedule?: string;
  notes?: string;
}

export interface UpdateEquipmentRequest {
  name?: string;
  type?: string;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  condition?: AssetCondition;
  status?: AssetStatus;
  location?: string;
  assignedTo?: string;
  specifications?: Record<string, any>;
  maintenanceSchedule?: string;
  notes?: string;
}

export interface CreateMachineryRequest {
  farmId: string;
  name: string;
  type: string;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  condition: AssetCondition;
  status: AssetStatus;
  location?: string;
  assignedTo?: string;
  operatingHours?: number;
  fuelType?: string;
  specifications?: Record<string, any>;
  maintenanceSchedule?: string;
  notes?: string;
}

export interface UpdateMachineryRequest {
  name?: string;
  type?: string;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  condition?: AssetCondition;
  status?: AssetStatus;
  location?: string;
  assignedTo?: string;
  operatingHours?: number;
  fuelType?: string;
  specifications?: Record<string, any>;
  maintenanceSchedule?: string;
  notes?: string;
}