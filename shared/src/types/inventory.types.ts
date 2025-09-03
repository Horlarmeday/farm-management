import { BaseEntity, Status } from './common.types';
import { User } from './user.types';

// Inventory types
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

// Inventory enums
export enum InventoryCategory {
  FEED = 'feed',
  MEDICINE = 'medicine',
  EQUIPMENT = 'equipment',
  SUPPLIES = 'supplies',
  PACKAGING = 'packaging',
  FUEL = 'fuel',
  OTHER = 'other',
}

export enum TransactionType {
  PURCHASE = 'purchase',
  USAGE = 'usage',
  SALE = 'sale',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  WASTE = 'waste',
  RETURN = 'return',
}

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

export interface InventoryItem extends BaseEntity {
  name: string;
  code: string;
  category: InventoryCategory;
  description?: string;
  unit: UnitType;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  standardCost: number;
  averageCost: number;
  lastCost: number;
  supplier?: string;
  supplierCode?: string;
  barcode?: string;
  location?: string;
  expiryDate?: Date;
  batchNumber?: string;
  status: Status;
  isActive: boolean;

  // Relationships
  transactions: InventoryTransaction[];
  stockAlerts: StockAlert[];
}

export interface InventoryTransaction extends BaseEntity {
  itemId: string;
  item: InventoryItem;
  type: TransactionType;
  quantity: number;
  unit: UnitType;
  unitPrice: number;
  totalAmount: number;
  balanceAfter: number;
  referenceNumber?: string;
  referenceType?: 'purchase_order' | 'invoice' | 'usage_log' | 'sales_order' | 'manual';
  referenceId?: string;
  batchNumber?: string;
  expiryDate?: Date;
  supplier?: string;
  location?: string;
  reason?: string;
  notes?: string;
  recordedBy: User;
}

export interface StockAlert extends BaseEntity {
  itemId: string;
  item: InventoryItem;
  alertType: 'low_stock' | 'out_of_stock' | 'expiry_warning' | 'expired' | 'overstock';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold?: number;
  currentStock: number;
  expiryDate?: Date;
  isAcknowledged: boolean;
  acknowledgedBy?: User;
  acknowledgedAt?: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  notes?: string;
}

export interface Supplier extends BaseEntity {
  name: string;
  code: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  paymentTerms?: string;
  creditLimit?: number;
  rating?: number; // 1-5 stars
  isActive: boolean;
  notes?: string;

  // Relationships
  purchaseOrders: PurchaseOrder[];
  inventoryItems: InventoryItem[];
}

export interface PurchaseOrder extends BaseEntity {
  orderNumber: string;
  supplierId: string;
  supplier: Supplier;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  status: PurchaseOrderStatus;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentTerms?: string;
  notes?: string;
  createdBy: User;
  approvedBy?: User;
  approvedAt?: Date;

  // Relationships
  orderItems: PurchaseOrderItem[];
}

export interface PurchaseOrderItem extends BaseEntity {
  orderId: string;
  order: PurchaseOrder;
  itemId: string;
  item: InventoryItem;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  quantityReceived: number;
  quantityPending: number;
  notes?: string;
}

export interface StockMovement extends BaseEntity {
  itemId: string;
  item: InventoryItem;
  type: 'in' | 'out' | 'transfer';
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  reason: string;
  batchNumber?: string;
  expiryDate?: Date;
  notes?: string;
  recordedBy: User;
}

export interface StockAdjustment extends BaseEntity {
  itemId: string;
  item: InventoryItem;
  adjustmentType: 'physical_count' | 'damaged' | 'lost' | 'expired' | 'theft' | 'other';
  quantityBefore: number;
  quantityAfter: number;
  adjustmentQuantity: number;
  reason: string;
  cost: number;
  notes?: string;
  recordedBy: User;
  approvedBy?: User;
  approvedAt?: Date;
}

export interface InventoryValuation extends BaseEntity {
  valuationDate: Date;
  valuationMethod: 'FIFO' | 'LIFO' | 'weighted_average' | 'standard_cost';
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  notes?: string;
  generatedBy: User;

  // Relationships
  valuationItems: InventoryValuationItem[];
}

export interface InventoryValuationItem extends BaseEntity {
  valuationId: string;
  valuation: InventoryValuation;
  itemId: string;
  item: InventoryItem;
  quantity: number;
  unitCost: number;
  totalValue: number;
  notes?: string;
}

// Request/Response types
export interface CreateInventoryItemRequest {
  name: string;
  code: string;
  category: InventoryCategory;
  description?: string;
  unit: UnitType;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  standardCost: number;
  supplier?: string;
  supplierCode?: string;
  barcode?: string;
  location?: string;
  expiryDate?: Date;
  batchNumber?: string;
}

export interface UpdateInventoryItemRequest {
  name?: string;
  description?: string;
  unit?: UnitType;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  standardCost?: number;
  supplier?: string;
  supplierCode?: string;
  barcode?: string;
  location?: string;
  status?: Status;
}

export interface CreateInventoryTransactionRequest {
  itemId: string;
  type: TransactionType;
  quantity: number;
  unitPrice: number;
  referenceNumber?: string;
  referenceType?: 'purchase_order' | 'invoice' | 'usage_log' | 'sales_order' | 'manual';
  referenceId?: string;
  batchNumber?: string;
  expiryDate?: Date;
  supplier?: string;
  location?: string;
  reason?: string;
  notes?: string;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  paymentTerms?: string;
  notes?: string;
  orderItems: {
    itemId: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }[];
}

export interface UpdatePurchaseOrderRequest {
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  status?: 'draft' | 'submitted' | 'approved' | 'partially_received' | 'received' | 'cancelled';
  paymentTerms?: string;
  notes?: string;
}

export interface CreateStockAdjustmentRequest {
  itemId: string;
  adjustmentType: 'physical_count' | 'damaged' | 'lost' | 'expired' | 'theft' | 'other';
  quantityAfter: number;
  reason: string;
  cost: number;
  notes?: string;
}

export interface CreateSupplierRequest {
  name: string;
  code: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  paymentTerms?: string;
  creditLimit?: number;
  notes?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  paymentTerms?: string;
  creditLimit?: number;
  rating?: number;
  isActive?: boolean;
  notes?: string;
}

// Analytics and Statistics
export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  totalQuantity: number;
  itemsByCategory: Record<InventoryCategory, number>;
  valueByCategory: Record<InventoryCategory, number>;
  lowStockItems: number;
  outOfStockItems: number;
  expiredItems: number;
  expiringItems: number;
  totalSuppliers: number;
  activeSuppliers: number;
  pendingPurchaseOrders: number;
  totalPurchaseValue: number;
  averageStockTurnover: number;
  topMovingItems: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    value: number;
  }>;
}
