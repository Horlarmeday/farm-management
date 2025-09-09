import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BirdBatch,
  BirdFeedingLog,
  BirdHealthRecord,
  BirdSale,
  EggProductionLog,
  CreateBirdBatchRequest,
  UpdateBirdBatchRequest,
  CreatePoultryFeedingLogRequest,
  CreatePoultryHealthRecordRequest,
  CreateEggProductionLogRequest,
  PoultryStats,
  BirdType,
  BirdStatus,
} from '../../../shared/src/types/poultry.types';
import { PoultryService } from '../services/poultry.service';
import { queryKeys } from '../lib/queryKeys';

// Bird Batch Hooks
export const useBirdBatches = (params?: {
  page?: number;
  limit?: number;
  birdType?: BirdType;
  status?: BirdStatus;
  locationId?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.poultry.batches(params),
    queryFn: () => PoultryService.getBirdBatches(params),
  });
};

export const useBirdBatch = (id: string) => {
  return useQuery({
    queryKey: queryKeys.poultry.batch(id),
    queryFn: () => PoultryService.getBirdBatch(id),
    enabled: !!id,
  });
};

export const useCreateBirdBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBirdBatchRequest) => PoultryService.createBirdBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.poultry.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

export const useUpdateBirdBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBirdBatchRequest }) => 
      PoultryService.updateBirdBatch(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.poultry.batch(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.poultry.batches() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

export const useDeleteBirdBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => PoultryService.deleteBirdBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.poultry.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

// Feeding Log Hooks
export const useFeedingLogs = (batchId: string, params?: {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.poultry.feedingLogs(batchId, params),
    queryFn: () => PoultryService.getFeedingLogs(batchId, params),
    enabled: !!batchId,
  });
};

export const useCreateFeedingLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePoultryFeedingLogRequest) => PoultryService.createFeedingLog(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.poultry.feedingLogs(data.batchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.poultry.batch(data.batchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

export const useDeleteFeedingLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => PoultryService.deleteFeedingLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.poultry.all });
    },
  });
};

// Health Record Hooks
export const useHealthRecords = (batchId: string, params?: {
  page?: number;
  limit?: number;
  type?: 'vaccination' | 'treatment' | 'disease' | 'inspection';
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.poultry.healthRecords(batchId, params),
    queryFn: () => PoultryService.getHealthRecords(batchId, params),
    enabled: !!batchId,
  });
};

export const useCreateHealthRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePoultryHealthRecordRequest) => PoultryService.createHealthRecord(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.poultry.healthRecords(data.batchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.poultry.batch(data.batchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

export const useDeleteHealthRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => PoultryService.deleteHealthRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.poultry.all });
    },
  });
};

// Egg Production Hooks
export const useEggProductionLogs = (batchId: string, params?: {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.poultry.eggProduction(batchId, params),
    queryFn: () => PoultryService.getEggProductionLogs(batchId, params),
    enabled: !!batchId,
  });
};

export const useCreateEggProductionLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateEggProductionLogRequest) => PoultryService.createEggProductionLog(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.poultry.eggProduction(data.batchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.poultry.batch(data.batchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

export const useDeleteEggProductionLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => PoultryService.deleteEggProductionLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.poultry.all });
    },
  });
};

// Bird Sales Hooks
export const useBirdSales = (batchId: string, params?: {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.poultry.sales(batchId, params),
    queryFn: () => PoultryService.getBirdSales(batchId, params),
    enabled: !!batchId,
  });
};

export const useCreateBirdSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ batchId, data }: { 
      batchId: string; 
      data: {
        saleDate: string;
        saleType: 'live_bird' | 'dressed' | 'spent_layer' | 'manure';
        quantity: number;
        unit: 'piece' | 'kg' | 'bag';
        unitPrice: number;
        buyerName: string;
        buyerContact?: string;
        paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'credit';
        paymentStatus: 'pending' | 'partial' | 'paid';
        deliveryDate?: string;
        deliveryLocation?: string;
        transportCost?: number;
        notes?: string;
      }
    }) => PoultryService.createBirdSale(batchId, data),
    onSuccess: (_, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.poultry.sales(batchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.poultry.batch(batchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

// Analytics and Reports Hooks
export const usePoultryStats = (params?: {
  dateFrom?: string;
  dateTo?: string;
  batchId?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.poultry.stats(params),
    queryFn: () => PoultryService.getPoultryStats(params),
  });
};

export const useBatchPerformance = (batchId: string, params?: {
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.poultry.performance(batchId, params),
    queryFn: () => PoultryService.getBatchPerformance(batchId, params),
    enabled: !!batchId,
  });
};

export const useProductionSummary = (params?: {
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.poultry.productionSummary(params),
    queryFn: () => PoultryService.getProductionSummary(params),
  });
};

export const usePoultryDashboardSummary = () => {
  return useQuery({
    queryKey: queryKeys.poultry.dashboardSummary(),
    queryFn: () => PoultryService.getDashboardSummary(),
  });
};