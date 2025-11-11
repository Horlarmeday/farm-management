import {
  CreateInventoryItemRequest,
  CreateInventoryTransactionRequest,
  CreatePurchaseOrderRequest,
  CreateStockAdjustmentRequest,
  CreateSupplierRequest,
  InventoryCategory,
  InventoryItem,
  InventoryStats,
  InventoryTransaction,
  PurchaseOrder,
  PurchaseOrderStatus,
  StockAdjustment,
  StockAlert,
  Supplier,
  TransactionType,
  UpdateInventoryItemRequest,
  UpdatePurchaseOrderRequest,
  UpdateSupplierRequest,
} from '@/types/inventory.types';
import { apiClient } from './api';

export class InventoryService {
  private static readonly BASE_URL = '/api/inventory';
  // Inventory Items
  static async getInventoryItems(params?: {
    category?: InventoryCategory;
    status?: 'active' | 'inactive';
    lowStock?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get<InventoryItem[]>(`${this.BASE_URL}/items`, params);
    if (!response.data) {
      throw new Error('Failed to fetch inventory items');
    }
    return response.data;
  }

  static async getInventoryItem(id: string) {
    const response = await apiClient.get<InventoryItem>(`${this.BASE_URL}/items/${id}`);
    if (!response.data) {
      throw new Error('Failed to fetch inventory item');
    }
    return response.data;
  }

  static async createInventoryItem(data: CreateInventoryItemRequest) {
    const response = await apiClient.post<InventoryItem>(`${this.BASE_URL}/items`, data);
    if (!response.data) {
      throw new Error('Failed to create inventory item');
    }
    return response.data;
  }

  static async updateInventoryItem(id: string, data: UpdateInventoryItemRequest) {
    const response = await apiClient.put<InventoryItem>(`${this.BASE_URL}/items/${id}`, data);
    if (!response.data) {
      throw new Error('Failed to update inventory item');
    }
    return response.data;
  }

  static async deleteInventoryItem(id: string) {
    const response = await apiClient.delete(`${this.BASE_URL}/items/${id}`);
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
    const response = await apiClient.get<InventoryTransaction[]>(
      `${this.BASE_URL}/transactions`,
      params,
    );
    if (!response.data) {
      throw new Error('Failed to fetch inventory transactions');
    }
    return response.data;
  }

  static async createInventoryTransaction(data: CreateInventoryTransactionRequest) {
    const response = await apiClient.post<InventoryTransaction>(
      `${this.BASE_URL}/transactions`,
      data,
    );
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
    const response = await apiClient.get<StockAlert[]>(`${this.BASE_URL}/alerts`, params);
    if (!response.data) {
      throw new Error('Failed to fetch stock alerts');
    }
    return response.data;
  }

  static async acknowledgeStockAlert(id: string) {
    const response = await apiClient.patch<StockAlert>(`${this.BASE_URL}/alerts/${id}/acknowledge`);
    if (!response.data) {
      throw new Error('Failed to acknowledge stock alert');
    }
    return response.data;
  }

  static async resolveStockAlert(id: string, notes?: string) {
    const response = await apiClient.patch<StockAlert>(`${this.BASE_URL}/alerts/${id}/resolve`, {
      notes,
    });
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
    const response = await apiClient.get<Supplier[]>(`${this.BASE_URL}/suppliers`, params);
    if (!response.data) {
      throw new Error('Failed to fetch suppliers');
    }
    return response.data;
  }

  static async getSupplier(id: string) {
    const response = await apiClient.get<Supplier>(`${this.BASE_URL}/suppliers/${id}`);
    if (!response.data) {
      throw new Error('Failed to fetch supplier');
    }
    return response.data;
  }

  static async createSupplier(data: CreateSupplierRequest) {
    const response = await apiClient.post<Supplier>(`${this.BASE_URL}/suppliers`, data);
    if (!response.data) {
      throw new Error('Failed to create supplier');
    }
    return response.data;
  }

  static async updateSupplier(id: string, data: UpdateSupplierRequest) {
    const response = await apiClient.put<Supplier>(`${this.BASE_URL}/suppliers/${id}`, data);
    if (!response.data) {
      throw new Error('Failed to update supplier');
    }
    return response.data;
  }

  static async deleteSupplier(id: string) {
    const response = await apiClient.delete(`${this.BASE_URL}/suppliers/${id}`);
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
    const response = await apiClient.get<PurchaseOrder[]>(
      `${this.BASE_URL}/purchase-orders`,
      params,
    );
    if (!response.data) {
      throw new Error('Failed to fetch purchase orders');
    }
    return response.data;
  }

  static async getPurchaseOrder(id: string) {
    const response = await apiClient.get<PurchaseOrder>(`${this.BASE_URL}/purchase-orders/${id}`);
    if (!response.data) {
      throw new Error('Failed to fetch purchase order');
    }
    return response.data;
  }

  static async createPurchaseOrder(data: CreatePurchaseOrderRequest) {
    const response = await apiClient.post<PurchaseOrder>(`${this.BASE_URL}/purchase-orders`, data);
    if (!response.data) {
      throw new Error('Failed to create purchase order');
    }
    return response.data;
  }

  static async updatePurchaseOrder(id: string, data: UpdatePurchaseOrderRequest) {
    const response = await apiClient.put<PurchaseOrder>(
      `${this.BASE_URL}/purchase-orders/${id}`,
      data,
    );
    if (!response.data) {
      throw new Error('Failed to update purchase order');
    }
    return response.data;
  }

  static async approvePurchaseOrder(id: string) {
    const response = await apiClient.patch<PurchaseOrder>(
      `${this.BASE_URL}/purchase-orders/${id}/approve`,
    );
    if (!response.data) {
      throw new Error('Failed to approve purchase order');
    }
    return response.data;
  }

  static async receivePurchaseOrder(
    id: string,
    items: Array<{ itemId: string; quantityReceived: number }>,
  ) {
    const response = await apiClient.patch<PurchaseOrder>(
      `${this.BASE_URL}/purchase-orders/${id}/receive`,
      { items },
    );
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
    const response = await apiClient.get<StockAdjustment[]>(`${this.BASE_URL}/adjustments`, params);
    if (!response.data) {
      throw new Error('Failed to fetch stock adjustments');
    }
    return response.data;
  }

  static async createStockAdjustment(data: CreateStockAdjustmentRequest) {
    const response = await apiClient.post<StockAdjustment>(`${this.BASE_URL}/adjustments`, data);
    if (!response.data) {
      throw new Error('Failed to create stock adjustment');
    }
    return response.data;
  }

  static async approveStockAdjustment(id: string) {
    const response = await apiClient.patch<StockAdjustment>(
      `${this.BASE_URL}/adjustments/${id}/approve`,
    );
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
    const response = await apiClient.get<InventoryStats>(`${this.BASE_URL}/stats`, params);
    if (!response.data) {
      throw new Error('Failed to fetch inventory statistics');
    }
    return response.data;
  }

  static async getLowStockItems() {
    const response = await apiClient.get<InventoryItem[]>(`${this.BASE_URL}/low-stock`);
    if (!response.data) {
      throw new Error('Failed to fetch low stock items');
    }
    return response.data;
  }

  static async getExpiringItems(days: number = 30) {
    const response = await apiClient.get<InventoryItem[]>(`${this.BASE_URL}/expiring`, { days });
    if (!response.data) {
      throw new Error('Failed to fetch expiring items');
    }
    return response.data;
  }

  static async getInventoryValuation() {
    const response = await apiClient.get<{
      totalValue: number;
      itemCount: number;
      categories: Record<string, number>;
    }>(`${this.BASE_URL}/valuation`);
    if (!response.data) {
      throw new Error('Failed to fetch inventory valuation');
    }
    return response.data;
  }
}
