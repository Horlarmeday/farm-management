import { apiClient } from './api';
import {
  InventoryItem,
  InventoryTransaction,
  StockAlert,
  Supplier,
  PurchaseOrder,
  StockAdjustment,
  InventoryStats,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  CreateInventoryTransactionRequest,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  CreateStockAdjustmentRequest,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  InventoryCategory,
  TransactionType,
  PurchaseOrderStatus
} from '@/types/inventory.types';

export class InventoryService {
  // Inventory Items
  static async getInventoryItems(params?: {
    category?: InventoryCategory;
    status?: 'active' | 'inactive';
    lowStock?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get<InventoryItem[]>('/api/inventory/items', { params });
    if (!response.data) {
      throw new Error('Failed to fetch inventory items');
    }
    return response.data;
  }

  static async getInventoryItem(id: string) {
    const response = await apiClient.get<InventoryItem>(`/api/inventory/items/${id}`);
    if (!response.data) {
      throw new Error('Failed to fetch inventory item');
    }
    return response.data;
  }

  static async createInventoryItem(data: CreateInventoryItemRequest) {
    const response = await apiClient.post<InventoryItem>('/api/inventory/items', data);
    if (!response.data) {
      throw new Error('Failed to create inventory item');
    }
    return response.data;
  }

  static async updateInventoryItem(id: string, data: UpdateInventoryItemRequest) {
    const response = await apiClient.put<InventoryItem>(`/api/inventory/items/${id}`, data);
    if (!response.data) {
      throw new Error('Failed to update inventory item');
    }
    return response.data;
  }

  static async deleteInventoryItem(id: string) {
    const response = await apiClient.delete(`/api/inventory/items/${id}`);
    return response.data;
  }

  // Inventory Transactions
  static async getInventoryTransactions(params?: {
    itemId?: string;
    type?: TransactionType;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get<InventoryTransaction[]>('/api/inventory/transactions', { params });
    if (!response.data) {
      throw new Error('Failed to fetch inventory transactions');
    }
    return response.data;
  }

  static async createInventoryTransaction(data: CreateInventoryTransactionRequest) {
    const response = await apiClient.post<InventoryTransaction>('/api/inventory/transactions', data);
    if (!response.data) {
      throw new Error('Failed to create inventory transaction');
    }
    return response.data;
  }

  // Stock Alerts
  static async getStockAlerts(params?: {
    alertType?: 'low_stock' | 'out_of_stock' | 'expiry_warning' | 'expired' | 'overstock';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    acknowledged?: boolean;
    resolved?: boolean;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get<StockAlert[]>('/api/inventory/alerts', { params });
    if (!response.data) {
      throw new Error('Failed to fetch stock alerts');
    }
    return response.data;
  }

  static async acknowledgeStockAlert(id: string) {
    const response = await apiClient.patch<StockAlert>(`/api/inventory/alerts/${id}/acknowledge`);
    if (!response.data) {
      throw new Error('Failed to acknowledge stock alert');
    }
    return response.data;
  }

  static async resolveStockAlert(id: string, notes?: string) {
    const response = await apiClient.patch<StockAlert>(`/api/inventory/alerts/${id}/resolve`, { notes });
    if (!response.data) {
      throw new Error('Failed to resolve stock alert');
    }
    return response.data;
  }

  // Suppliers
  static async getSuppliers(params?: {
    active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get<Supplier[]>('/api/inventory/suppliers', { params });
    if (!response.data) {
      throw new Error('Failed to fetch suppliers');
    }
    return response.data;
  }

  static async getSupplier(id: string) {
    const response = await apiClient.get<Supplier>(`/api/inventory/suppliers/${id}`);
    if (!response.data) {
      throw new Error('Failed to fetch supplier');
    }
    return response.data;
  }

  static async createSupplier(data: CreateSupplierRequest) {
    const response = await apiClient.post<Supplier>('/api/inventory/suppliers', data);
    if (!response.data) {
      throw new Error('Failed to create supplier');
    }
    return response.data;
  }

  static async updateSupplier(id: string, data: UpdateSupplierRequest) {
    const response = await apiClient.put<Supplier>(`/api/inventory/suppliers/${id}`, data);
    if (!response.data) {
      throw new Error('Failed to update supplier');
    }
    return response.data;
  }

  static async deleteSupplier(id: string) {
    const response = await apiClient.delete(`/api/inventory/suppliers/${id}`);
    return response.data;
  }

  // Purchase Orders
  static async getPurchaseOrders(params?: {
    supplierId?: string;
    status?: PurchaseOrderStatus;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get<PurchaseOrder[]>('/api/inventory/purchase-orders', { params });
    if (!response.data) {
      throw new Error('Failed to fetch purchase orders');
    }
    return response.data;
  }

  static async getPurchaseOrder(id: string) {
    const response = await apiClient.get<PurchaseOrder>(`/api/inventory/purchase-orders/${id}`);
    if (!response.data) {
      throw new Error('Failed to fetch purchase order');
    }
    return response.data;
  }

  static async createPurchaseOrder(data: CreatePurchaseOrderRequest) {
    const response = await apiClient.post<PurchaseOrder>('/api/inventory/purchase-orders', data);
    if (!response.data) {
      throw new Error('Failed to create purchase order');
    }
    return response.data;
  }

  static async updatePurchaseOrder(id: string, data: UpdatePurchaseOrderRequest) {
    const response = await apiClient.put<PurchaseOrder>(`/api/inventory/purchase-orders/${id}`, data);
    if (!response.data) {
      throw new Error('Failed to update purchase order');
    }
    return response.data;
  }

  static async approvePurchaseOrder(id: string) {
    const response = await apiClient.patch<PurchaseOrder>(`/api/inventory/purchase-orders/${id}/approve`);
    if (!response.data) {
      throw new Error('Failed to approve purchase order');
    }
    return response.data;
  }

  static async receivePurchaseOrder(id: string, items: Array<{ itemId: string; quantityReceived: number }>) {
    const response = await apiClient.patch<PurchaseOrder>(`/api/inventory/purchase-orders/${id}/receive`, { items });
    if (!response.data) {
      throw new Error('Failed to receive purchase order');
    }
    return response.data;
  }

  // Stock Adjustments
  static async getStockAdjustments(params?: {
    itemId?: string;
    adjustmentType?: 'physical_count' | 'damaged' | 'lost' | 'expired' | 'theft' | 'other';
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get<StockAdjustment[]>('/api/inventory/adjustments', { params });
    if (!response.data) {
      throw new Error('Failed to fetch stock adjustments');
    }
    return response.data;
  }

  static async createStockAdjustment(data: CreateStockAdjustmentRequest) {
    const response = await apiClient.post<StockAdjustment>('/api/inventory/adjustments', data);
    if (!response.data) {
      throw new Error('Failed to create stock adjustment');
    }
    return response.data;
  }

  static async approveStockAdjustment(id: string) {
    const response = await apiClient.patch<StockAdjustment>(`/api/inventory/adjustments/${id}/approve`);
    if (!response.data) {
      throw new Error('Failed to approve stock adjustment');
    }
    return response.data;
  }

  // Analytics and Statistics
  static async getInventoryStats(params?: {
    dateFrom?: string;
    dateTo?: string;
    category?: InventoryCategory;
  }) {
    const response = await apiClient.get<InventoryStats>('/api/inventory/stats', { params });
    if (!response.data) {
      throw new Error('Failed to fetch inventory statistics');
    }
    return response.data;
  }

  static async getLowStockItems() {
    const response = await apiClient.get<InventoryItem[]>('/api/inventory/low-stock');
    if (!response.data) {
      throw new Error('Failed to fetch low stock items');
    }
    return response.data;
  }

  static async getExpiringItems(days: number = 30) {
    const response = await apiClient.get<InventoryItem[]>('/api/inventory/expiring', { params: { days } });
    if (!response.data) {
      throw new Error('Failed to fetch expiring items');
    }
    return response.data;
  }

  static async getInventoryValuation() {
    const response = await apiClient.get<{ totalValue: number; itemCount: number; categories: Record<string, number> }>('/api/inventory/valuation');
    if (!response.data) {
      throw new Error('Failed to fetch inventory valuation');
    }
    return response.data;
  }
}