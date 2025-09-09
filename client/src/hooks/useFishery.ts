import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FisheryService } from '@/services/fishery.service';
import { queryKeys } from '@/lib/queryKeys';
import {
  CreatePondRequest,
  UpdatePondRequest,
  CreateStockingLogRequest,
  CreateWaterQualityLogRequest,
  CreateFishFeedingLogRequest,
  CreateSamplingLogRequest,
  CreateHarvestLogRequest,
  PondType,
  PondStatus,
  FishSpecies,
} from '../../../shared/src/types/fishery.types';

// Pond Management Hooks
export const usePonds = (params?: {
  type?: PondType;
  status?: PondStatus;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.fishery.ponds(params),
    queryFn: () => FisheryService.getPonds(params),
  });
};

export const usePond = (id: string) => {
  return useQuery({
    queryKey: queryKeys.fishery.pond(id),
    queryFn: () => FisheryService.getPondById(id),
    enabled: !!id,
  });
};

export const useCreatePond = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePondRequest) => FisheryService.createPond(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fishery.ponds() });
    },
  });
};

export const useUpdatePond = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePondRequest }) => 
      FisheryService.updatePond(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fishery.pond(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.fishery.ponds() });
    },
  });
};

export const useDeletePond = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => FisheryService.deletePond(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fishery.ponds() });
    },
  });
};

// Fish Stocking Hooks
export const useStockingLogs = (pondId?: string, params?: {
  species?: FishSpecies;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.fishery.stockingLogs(pondId, params),
    queryFn: () => FisheryService.getStockingLogs({ pondId, ...params }),
  });
};

export const useStockingLog = (id: string) => {
  return useQuery({
    queryKey: queryKeys.fishery.stockingLog(id),
    queryFn: () => FisheryService.getStockingLogById(id),
    enabled: !!id,
  });
};

export const useCreateStockingLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateStockingLogRequest) => FisheryService.createStockingLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fishery.stockingLogs() });
    },
  });
};

// Water Quality Hooks
export const useWaterQualityLogs = (pondId?: string, params?: {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.fishery.waterQualityLogs(pondId, params),
    queryFn: () => FisheryService.getWaterQualityLogs({ pondId, ...params }),
  });
};

export const useWaterQualityLog = (id: string) => {
  return useQuery({
    queryKey: queryKeys.fishery.waterQualityLog(id),
    queryFn: () => FisheryService.getWaterQualityLogById(id),
    enabled: !!id,
  });
};

export const useCreateWaterQualityLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateWaterQualityLogRequest) => FisheryService.createWaterQualityLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fishery.waterQualityLogs() });
    },
  });
};

// Feeding Hooks
export const useFeedingLogs = (pondId?: string, params?: {
  feedType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.fishery.feedingLogs(pondId, params),
    queryFn: () => FisheryService.getFeedingLogs({ pondId, ...params }),
  });
};

export const useFeedingLog = (id: string) => {
  return useQuery({
    queryKey: queryKeys.fishery.feedingLog(id),
    queryFn: () => FisheryService.getFeedingLogById(id),
    enabled: !!id,
  });
};

export const useCreateFeedingLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateFishFeedingLogRequest) => FisheryService.createFeedingLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fishery.feedingLogs() });
    },
  });
};

// Sampling Hooks
export const useSamplingLogs = (pondId?: string, params?: {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.fishery.samplingLogs(pondId, params),
    queryFn: () => FisheryService.getSamplingLogs({ pondId, ...params }),
  });
};

export const useSamplingLog = (id: string) => {
  return useQuery({
    queryKey: queryKeys.fishery.samplingLog(id),
    queryFn: () => FisheryService.getSamplingLogById(id),
    enabled: !!id,
  });
};

export const useCreateSamplingLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSamplingLogRequest) => FisheryService.createSamplingLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fishery.samplingLogs() });
    },
  });
};

// Harvest Hooks
export const useHarvestLogs = (pondId?: string, params?: {
  harvestMethod?: 'complete' | 'partial' | 'selective';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.fishery.harvestLogs(pondId, params),
    queryFn: () => FisheryService.getHarvestLogs({ pondId, ...params }),
  });
};

export const useHarvestLog = (id: string) => {
  return useQuery({
    queryKey: queryKeys.fishery.harvestLog(id),
    queryFn: () => FisheryService.getHarvestLogById(id),
    enabled: !!id,
  });
};

export const useCreateHarvestLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateHarvestLogRequest) => FisheryService.createHarvestLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fishery.harvestLogs() });
    },
  });
};

// Maintenance Hooks
export const useMaintenanceLogs = (pondId?: string, params?: {
  maintenanceType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.fishery.maintenanceLogs(pondId, params),
    queryFn: () => FisheryService.getMaintenanceLogs({ pondId, ...params }),
  });
};

export const useCreateMaintenanceLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      pondId: string;
      date: Date;
      maintenanceType: string;
      description: string;
      materialsUsed?: string;
      cost: number;
      laborHours?: number;
      contractorName?: string;
      nextMaintenanceDate?: Date;
      notes?: string;
    }) => FisheryService.createMaintenanceLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fishery.maintenanceLogs() });
    },
  });
};

// Sales Hooks
export const useFishSales = (params?: {
  startDate?: string;
  endDate?: string;
  buyerName?: string;
  paymentStatus?: 'pending' | 'partial' | 'paid';
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.fishery.sales(params),
    queryFn: () => FisheryService.getSales(params),
  });
};

export const useCreateFishSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      harvestLogId: string;
      saleDate: Date;
      quantity: number;
      pricePerKg: number;
      buyerName: string;
      buyerContact?: string;
      paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'credit';
      paymentStatus: 'pending' | 'partial' | 'paid';
      deliveryDate?: Date;
      deliveryLocation?: string;
      transportCost?: number;
      notes?: string;
    }) => FisheryService.createSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fishery.sales() });
    },
  });
};

// Mortality Hooks
export const useFishMortality = (pondId?: string, params?: {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.fishery.mortality(pondId, params),
    queryFn: () => FisheryService.getMortalityRecords({ pondId, ...params }),
  });
};

export const useCreateFishMortality = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      pondId: string;
      date: Date;
      mortalityCount: number;
      suspectedCause?: string;
      symptoms?: string;
      actionTaken?: string;
      treatmentApplied?: string;
      cost?: number;
      notes?: string;
    }) => FisheryService.createMortalityRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fishery.mortality() });
    },
  });
};

// Analytics and Reports Hooks
export const useFisheryStats = (params?: {
  startDate?: string;
  endDate?: string;
  pondId?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.fishery.stats(params),
    queryFn: () => FisheryService.getFisheryStats(params),
  });
};

export const usePondPerformance = (pondId: string, params?: {
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.fishery.pondPerformance(pondId, params),
    queryFn: () => FisheryService.getPondPerformance(pondId, params),
    enabled: !!pondId,
  });
};

export const useFeedConversionReport = (params?: {
  pondId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.fishery.feedConversionReport(params),
    queryFn: () => FisheryService.getFeedConversionReport(params),
  });
};

export const useProductionSummary = (params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'pond' | 'species' | 'month';
}) => {
  return useQuery({
    queryKey: queryKeys.fishery.productionSummary(params),
    queryFn: () => FisheryService.getProductionSummary(params),
  });
};

export const useFinancialReport = (params?: {
  startDate?: string;
  endDate?: string;
  pondId?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.fishery.financialReport(params),
    queryFn: () => FisheryService.getFinancialReport(params),
  });
};

export const useFisheryDashboardSummary = () => {
  return useQuery({
    queryKey: queryKeys.fishery.dashboardSummary(),
    queryFn: () => FisheryService.getDashboardSummary(),
  });
};