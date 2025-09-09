import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LivestockService } from '../services/livestock.service';
import { queryKeys } from '../lib/queryKeys';
import {
  Animal,
  AnimalHealthRecord,
  BreedingRecord,
  AnimalProductionLog,
  AnimalFeedingLog,
  WeightRecord,
  AnimalSale,
  PastureManagement,
  GrazingLog,
  LivestockStats,
  CreateAnimalRequest,
  UpdateAnimalRequest,
  CreateLivestockHealthRecordRequest,
  CreateBreedingRecordRequest,
  CreateAnimalProductionLogRequest,
  CreateWeightRecordRequest,
} from '../../../shared/src/types/livestock.types';

// Animal Management Hooks
export const useAnimals = (params?: {
  species?: string;
  status?: string;
  location?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.livestock.animals(params),
    queryFn: () => LivestockService.getAnimals(params),
  });
};

export const useAnimal = (id: string) => {
  return useQuery({
    queryKey: queryKeys.livestock.animal(id),
    queryFn: () => LivestockService.getAnimal(id),
    enabled: !!id,
  });
};

export const useCreateAnimal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAnimalRequest) => LivestockService.createAnimal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.all });
    },
  });
};

export const useUpdateAnimal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnimalRequest }) => 
      LivestockService.updateAnimal(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.animal(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.animals() });
    },
  });
};

export const useDeleteAnimal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => LivestockService.deleteAnimal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.all });
    },
  });
};

// Health Records Hooks
export const useHealthRecords = (animalId?: string, params?: {
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.livestock.healthRecords(animalId, params),
    queryFn: () => LivestockService.getHealthRecords(animalId, params),
  });
};

export const useCreateHealthRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLivestockHealthRecordRequest) => 
      LivestockService.createHealthRecord(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.livestock.healthRecords(data.animalId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.livestock.animal(data.animalId) 
      });
    },
  });
};

export const useUpdateHealthRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: Partial<CreateLivestockHealthRecordRequest> 
    }) => LivestockService.updateHealthRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.healthRecords() });
    },
  });
};

export const useDeleteHealthRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => LivestockService.deleteHealthRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.healthRecords() });
    },
  });
};

// Breeding Records Hooks
export const useBreedingRecords = (params?: {
  femaleId?: string;
  maleId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.livestock.breedingRecords(params),
    queryFn: () => LivestockService.getBreedingRecords(params),
  });
};

export const useCreateBreedingRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBreedingRecordRequest) => 
      LivestockService.createBreedingRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.breedingRecords() });
    },
  });
};

export const useUpdateBreedingRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: Partial<CreateBreedingRecordRequest> 
    }) => LivestockService.updateBreedingRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.breedingRecords() });
    },
  });
};

export const useDeleteBreedingRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => LivestockService.deleteBreedingRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.breedingRecords() });
    },
  });
};

// Production Logs Hooks
export const useProductionLogs = (animalId?: string, params?: {
  productionType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.livestock.productionLogs(animalId, params),
    queryFn: () => LivestockService.getProductionLogs(animalId, params),
  });
};

export const useCreateProductionLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAnimalProductionLogRequest) => 
      LivestockService.createProductionLog(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.livestock.productionLogs(data.animalId) 
      });
    },
  });
};

export const useUpdateProductionLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: Partial<CreateAnimalProductionLogRequest> 
    }) => LivestockService.updateProductionLog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.productionLogs() });
    },
  });
};

export const useDeleteProductionLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => LivestockService.deleteProductionLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.productionLogs() });
    },
  });
};

// Feeding Logs Hooks
export const useFeedingLogs = (animalId?: string, params?: {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.livestock.feedingLogs(animalId, params),
    queryFn: () => LivestockService.getFeedingLogs(animalId, params),
  });
};

export const useCreateFeedingLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      animalId: string;
      date: Date;
      feedType: string;
      quantityKg: number;
      feedCostPerKg: number;
      supplementsUsed?: string;
      notes?: string;
    }) => LivestockService.createFeedingLog(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.livestock.feedingLogs(data.animalId) 
      });
    },
  });
};

export const useUpdateFeedingLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: Partial<{
        feedType: string;
        quantityKg: number;
        feedCostPerKg: number;
        supplementsUsed?: string;
        notes?: string;
      }>
    }) => LivestockService.updateFeedingLog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.feedingLogs() });
    },
  });
};

export const useDeleteFeedingLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => LivestockService.deleteFeedingLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.feedingLogs() });
    },
  });
};

// Weight Records Hooks
export const useWeightRecords = (animalId?: string, params?: {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.livestock.weightRecords(animalId, params),
    queryFn: () => LivestockService.getWeightRecords(animalId, params),
  });
};

export const useCreateWeightRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateWeightRecordRequest) => 
      LivestockService.createWeightRecord(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.livestock.weightRecords(data.animalId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.livestock.animal(data.animalId) 
      });
    },
  });
};

export const useUpdateWeightRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: Partial<CreateWeightRecordRequest> 
    }) => LivestockService.updateWeightRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.weightRecords() });
    },
  });
};

export const useDeleteWeightRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => LivestockService.deleteWeightRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.weightRecords() });
    },
  });
};

// Sales Hooks
export const useLivestockSales = (params?: {
  animalId?: string;
  startDate?: string;
  endDate?: string;
  saleType?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.livestock.sales(params),
    queryFn: () => LivestockService.getSales(params),
  });
};

export const useCreateLivestockSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      animalId: string;
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
    }) => LivestockService.createSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.sales() });
    },
  });
};

export const useUpdateLivestockSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: Partial<{
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
      }>
    }) => LivestockService.updateSale(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.sales() });
    },
  });
};

export const useDeleteLivestockSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => LivestockService.deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.sales() });
    },
  });
};

// Pasture Management Hooks
export const usePastures = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.livestock.pastures(params),
    queryFn: () => LivestockService.getPastures(params),
  });
};

export const usePasture = (id: string) => {
  return useQuery({
    queryKey: queryKeys.livestock.pasture(id),
    queryFn: () => LivestockService.getPasture(id),
    enabled: !!id,
  });
};

export const useCreatePasture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      name: string;
      locationId: string;
      area: number;
      grassType: string;
      capacity: number;
      rotationSchedule?: string;
      notes?: string;
    }) => LivestockService.createPasture(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.pastures() });
    },
  });
};

export const useUpdatePasture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: Partial<{
        name: string;
        area: number;
        grassType: string;
        capacity: number;
        rotationSchedule?: string;
        status: 'available' | 'occupied' | 'resting' | 'maintenance';
        notes?: string;
      }>
    }) => LivestockService.updatePasture(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.pasture(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.pastures() });
    },
  });
};

export const useDeletePasture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => LivestockService.deletePasture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.pastures() });
    },
  });
};

// Grazing Logs Hooks
export const useGrazingLogs = (pastureId?: string, params?: {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.livestock.grazingLogs(pastureId, params),
    queryFn: () => LivestockService.getGrazingLogs(pastureId, params),
  });
};

export const useCreateGrazingLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      pastureId: string;
      animalIds: string[];
      startDate: Date;
      endDate?: Date;
      grassQuality: 'excellent' | 'good' | 'fair' | 'poor';
      weatherConditions?: string;
      notes?: string;
    }) => LivestockService.createGrazingLog(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.livestock.grazingLogs(data.pastureId) 
      });
    },
  });
};

export const useUpdateGrazingLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: Partial<{
        endDate?: Date;
        grassQuality: 'excellent' | 'good' | 'fair' | 'poor';
        weatherConditions?: string;
        notes?: string;
      }>
    }) => LivestockService.updateGrazingLog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.grazingLogs() });
    },
  });
};

export const useDeleteGrazingLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => LivestockService.deleteGrazingLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.livestock.grazingLogs() });
    },
  });
};

// Analytics and Reports Hooks
export const useLivestockStats = (params?: {
  species?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.livestock.stats(params),
    queryFn: () => LivestockService.getLivestockStats(params),
  });
};

export const useLivestockPerformanceReport = (params?: {
  animalId?: string;
  species?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.livestock.performanceReport(params),
    queryFn: () => LivestockService.getPerformanceReport(params),
  });
};

export const useLivestockProductionSummary = (params?: {
  productionType?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.livestock.productionSummary(params),
    queryFn: () => LivestockService.getProductionSummary(params),
  });
};

export const useLivestockBreedingReport = (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.livestock.breedingReport(params),
    queryFn: () => LivestockService.getBreedingReport(params),
  });
};

export const useLivestockHealthReport = (params?: {
  animalId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.livestock.healthReport(params),
    queryFn: () => LivestockService.getHealthReport(params),
  });
};

export const useLivestockDashboardSummary = () => {
  return useQuery({
    queryKey: queryKeys.livestock.dashboardSummary(),
    queryFn: () => LivestockService.getDashboardSummary(),
  });
};