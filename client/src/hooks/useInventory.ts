import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryService } from '@/services/inventory.service';
import { queryKeys } from '@/lib/queryKeys';
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

// Inventory Items Hooks
export function useInventoryItems(params?: {
  category?: InventoryCategory;
  status?: 'active' | 'inactive';
  lowStock?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.inventory.items(params),
    queryFn: () => InventoryService.getInventoryItems(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: queryKeys.inventory.item(id),
    queryFn: () => InventoryService.getInventoryItem(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateInventoryItemRequest) => InventoryService.createInventoryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.items() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.stats() });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInventoryItemRequest }) => 
      InventoryService.updateInventoryItem(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.item(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.items() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.stats() });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => InventoryService.deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.items() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.stats() });
    },
  });
}

// Inventory Transactions Hooks
export function useInventoryTransactions(params?: {
  itemId?: string;
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.inventory.transactions(params),
    queryFn: () => InventoryService.getInventoryTransactions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateInventoryTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateInventoryTransactionRequest) => 
      InventoryService.createInventoryTransaction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.transactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.item(variables.itemId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.items() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.stats() });
    },
  });
}

// Stock Alerts Hooks
export function useStockAlerts(params?: {
  alertType?: 'low_stock' | 'out_of_stock' | 'expiry_warning' | 'expired' | 'overstock';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  acknowledged?: boolean;
  resolved?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.inventory.alerts(params),
    queryFn: () => InventoryService.getStockAlerts(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useAcknowledgeStockAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => InventoryService.acknowledgeStockAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.alerts() });
    },
  });
}

export function useResolveStockAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => 
      InventoryService.resolveStockAlert(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.alerts() });
    },
  });
}

// Suppliers Hooks
export function useSuppliers(params?: {
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.inventory.suppliers(params),
    queryFn: () => InventoryService.getSuppliers(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: queryKeys.inventory.supplier(id),
    queryFn: () => InventoryService.getSupplier(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSupplierRequest) => InventoryService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.suppliers() });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierRequest }) => 
      InventoryService.updateSupplier(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.supplier(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.suppliers() });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => InventoryService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.suppliers() });
    },
  });
}

// Purchase Orders Hooks
export function usePurchaseOrders(params?: {
  supplierId?: string;
  status?: PurchaseOrderStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.inventory.purchaseOrders(params),
    queryFn: () => InventoryService.getPurchaseOrders(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.inventory.purchaseOrder(id),
    queryFn: () => InventoryService.getPurchaseOrder(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePurchaseOrderRequest) => InventoryService.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.purchaseOrders() });
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePurchaseOrderRequest }) => 
      InventoryService.updatePurchaseOrder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.purchaseOrder(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.purchaseOrders() });
    },
  });
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => InventoryService.approvePurchaseOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.purchaseOrder(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.purchaseOrders() });
    },
  });
}

export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: Array<{ itemId: string; quantityReceived: number }> }) => 
      InventoryService.receivePurchaseOrder(id, items),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.purchaseOrder(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.purchaseOrders() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.items() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.stats() });
    },
  });
}

// Stock Adjustments Hooks
export function useStockAdjustments(params?: {
  itemId?: string;
  adjustmentType?: 'physical_count' | 'damaged' | 'lost' | 'expired' | 'theft' | 'other';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.inventory.adjustments(params),
    queryFn: () => InventoryService.getStockAdjustments(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateStockAdjustmentRequest) => InventoryService.createStockAdjustment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.adjustments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.item(variables.itemId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.items() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.stats() });
    },
  });
}

export function useApproveStockAdjustment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => InventoryService.approveStockAdjustment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.adjustments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.items() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.stats() });
    },
  });
}

// Analytics and Statistics Hooks
export function useInventoryStats(params?: {
  dateFrom?: string;
  dateTo?: string;
  category?: InventoryCategory;
}) {
  return useQuery({
    queryKey: queryKeys.inventory.stats(params),
    queryFn: () => InventoryService.getInventoryStats(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: queryKeys.inventory.lowStock(),
    queryFn: () => InventoryService.getLowStockItems(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useExpiringItems(days: number = 30) {
  return useQuery({
    queryKey: queryKeys.inventory.expiring(days),
    queryFn: () => InventoryService.getExpiringItems(days),
    staleTime: 5 * 60 * 1000,
  });
}

export function useInventoryValuation() {
  return useQuery({
    queryKey: queryKeys.inventory.valuation(),
    queryFn: () => InventoryService.getInventoryValuation(),
    staleTime: 10 * 60 * 1000,
  });
}

// Combined hook for inventory dashboard data
export function useInventoryData() {
  const inventoryItems = useInventoryItems({ limit: 10 });
  const stockAlerts = useStockAlerts({ limit: 5 });
  const lowStockItems = useLowStockItems();
  const inventoryStats = useInventoryStats();
  const inventoryValuation = useInventoryValuation();

  return {
    inventoryItems,
    stockAlerts,
    lowStockItems,
    inventoryStats,
    inventoryValuation,
    isLoading: inventoryItems.isLoading || stockAlerts.isLoading || lowStockItems.isLoading || inventoryStats.isLoading,
    error: inventoryItems.error || stockAlerts.error || lowStockItems.error || inventoryStats.error,
  };
}