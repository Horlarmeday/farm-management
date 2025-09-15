export enum InventoryCategory {
  FEED = 'feed',
  MEDICINE = 'medicine',
  EQUIPMENT = 'equipment',
  SUPPLIES = 'supplies',
  PACKAGING = 'packaging',
  FUEL = 'fuel',
  OTHER = 'other',
}

export type UnitType =
  | 'kg'
  | 'liters'
  | 'pieces'
  | 'bags'
  | 'boxes'
  | 'bottles'
  | 'packs'
  | 'tons'
  | 'meters';

export enum TransactionType {
  IN = 'in',
  OUT = 'out',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  WASTE = 'waste',
  RETURN = 'return'
}

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  ORDERED = 'ordered',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

export interface CreateStockAdjustmentRequest {
  itemId: string;
  adjustmentType: 'increase' | 'decrease';
  quantity: number;
  reason: string;
  notes?: string;
}

// Stock Adjustment Interface
export interface StockAdjustment {
  id: string;
  itemId: string;
  adjustmentType: 'increase' | 'decrease';
  quantity: number;
  reason: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Inventory Statistics Interface
export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringItems: number;
  totalTransactions: number;
  monthlyConsumption: number;
  averageStockLevel: number;
  topConsumingItems: Array<{
    itemId: string;
    itemName: string;
    consumption: number;
  }>;
  categoryBreakdown: Array<{
    category: InventoryCategory;
    itemCount: number;
    totalValue: number;
  }>;
}

// Additional Request Types
export interface CreateInventoryItemRequest {
  farmId: string;
  name: string;
  category: InventoryCategory;
  description?: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  unitCost?: number;
  supplierId?: string;
  location?: string;
  expiryDate?: Date;
  batchNumber?: string;
  notes?: string;
}

export interface UpdateInventoryItemRequest {
  name?: string;
  category?: InventoryCategory;
  description?: string;
  unit?: string;
  currentStock?: number;
  minimumStock?: number;
  maximumStock?: number;
  unitCost?: number;
  supplierId?: string;
  location?: string;
  expiryDate?: Date;
  batchNumber?: string;
  notes?: string;
}

export interface CreateInventoryTransactionRequest {
  itemId: string;
  type: TransactionType;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  reference?: string;
  notes?: string;
  performedBy?: string;
}

export interface CreatePurchaseOrderRequest {
  farmId: string;
  supplierId: string;
  orderNumber?: string;
  items: Array<{
    itemId: string;
    quantity: number;
    unitCost: number;
  }>;
  notes?: string;
  expectedDeliveryDate?: Date;
}

export interface UpdatePurchaseOrderRequest {
  status?: PurchaseOrderStatus;
  orderNumber?: string;
  items?: Array<{
    itemId: string;
    quantity: number;
    unitCost: number;
  }>;
  notes?: string;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
}

export interface CreateSupplierRequest {
  farmId: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  notes?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentTerms?: string;
  notes?: string;
}

// Core Entities
export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: InventoryCategory;
  unit: string;
  currentStock: number;
  reorderPoint: number;
  maxStock?: number;
  standardCost?: number;
  lastPurchasePrice?: number;
  supplier?: string;
  location?: string;
  expiryDate?: string;
  batchNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: TransactionType;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  reference?: string;
  notes?: string;
  performedBy: string;
  createdAt: string;
}

export interface StockAlert {
  id: string;
  itemId: string;
  type: 'low_stock' | 'expired' | 'expiring_soon';
  message: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  resolvedAt?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentTerms?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  totalAmount: number;
  notes?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}