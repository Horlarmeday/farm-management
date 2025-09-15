import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryKeys';
import { AssetsService } from '@/services/assets.service';
import type {
  Asset,
  MaintenanceLog,
  AssetType,
  AssetStatus,
  AssetCondition,
  MaintenanceType,
  MaintenanceStatus,
  CreateAssetRequest,
  UpdateAssetRequest,
  CreateMaintenanceLogRequest,
  UpdateMaintenanceLogRequest
} from '@/types/asset.types';
import type { PaginatedResponse, ApiResponse } from '@/types/api.types';

// Asset Management Hooks
export const useAssets = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.assets.list(params),
    queryFn: () => AssetsService.getAssets(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAsset = (id: string) => {
  return useQuery({
    queryKey: queryKeys.assets.detail(id),
    queryFn: () => AssetsService.getAsset(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssetRequest) => AssetsService.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.stats() });
      toast({
        title: 'Success',
        description: 'Asset created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create asset',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssetRequest }) =>
      AssetsService.updateAsset(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.stats() });
      toast({
        title: 'Success',
        description: 'Asset updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update asset',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => AssetsService.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.stats() });
      toast({
        title: 'Success',
        description: 'Asset deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete asset',
        variant: 'destructive',
      });
    },
  });
};

// Equipment Management Hooks
export const useEquipment = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.assets.equipment(params),
    queryFn: () => AssetsService.getEquipment(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Machinery Management Hooks
export const useMachinery = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.assets.machinery(params),
    queryFn: () => AssetsService.getMachinery(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Maintenance Management Hooks
export const useMaintenanceLogs = (assetId?: string, params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.assets.maintenanceLogs(assetId, params),
    queryFn: () => AssetsService.getMaintenanceRecords(assetId, params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMaintenanceLog = (id: string) => {
  return useQuery({
    queryKey: queryKeys.assets.maintenanceLog(id),
    queryFn: () => AssetsService.getMaintenanceRecord(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateMaintenanceLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMaintenanceLogRequest) =>
      AssetsService.createMaintenanceRecord(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.assets.maintenanceLogs(data.assetId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.assets.detail(data.assetId) 
      });
      toast({
        title: 'Success',
        description: 'Maintenance log created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create maintenance log',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateMaintenanceLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, assetId }: { id: string; data: UpdateMaintenanceLogRequest; assetId: string }) =>
      AssetsService.updateMaintenanceRecord(id, data),
    onSuccess: (result, { assetId }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.assets.maintenanceLogs(assetId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.assets.detail(assetId) 
      });
      toast({
        title: 'Success',
        description: 'Maintenance log updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update maintenance log',
        variant: 'destructive',
      });
    },
  });
};

// Asset Usage Hooks
// Note: Asset usage logs functionality not implemented in service yet
// export const useAssetUsageLogs = (assetId?: string, params?: Record<string, any>) => {
//   return useQuery({
//     queryKey: queryKeys.assets.usageLogs(assetId, params),
//     queryFn: () => AssetsService.getAssetUsageLogs(assetId, params),
//     staleTime: 5 * 60 * 1000,
//   });
// };

// Note: Asset usage logging functionality not implemented in service yet
// export const useLogAssetUsage = () => {
//   const queryClient = useQueryClient();
//
//   return useMutation({
//     mutationFn: (data: { assetId: string; hours: number; operatorId: string; notes?: string }) =>
//       AssetsService.logAssetUsage(data.assetId, data.hours, data.operatorId, data.notes),
//     onSuccess: (_, data) => {
//       queryClient.invalidateQueries({ 
//         queryKey: queryKeys.assets.usageLogs(data.assetId) 
//       });
//       queryClient.invalidateQueries({ 
//         queryKey: queryKeys.assets.detail(data.assetId) 
//       });
//       toast({
//         title: "Success",
//         description: "Asset usage logged successfully.",
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Error",
//         description: error.response?.data?.message || "Failed to log asset usage.",
//         variant: "destructive",
//       });
//     },
//   });
// };

// Asset Depreciation Hooks
export const useAssetDepreciation = (assetId: string, params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.assets.depreciation(assetId),
    queryFn: () => AssetsService.getDepreciationRecords(assetId, params),
    enabled: !!assetId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCalculateDepreciation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: string) => AssetsService.calculateDepreciation(assetId),
    onSuccess: (_, assetId) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.assets.depreciation(assetId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.assets.detail(assetId) 
      });
      toast({
        title: 'Success',
        description: 'Depreciation calculated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to calculate depreciation',
        variant: 'destructive',
      });
    },
  });
};

// Asset Performance Hooks
export const useAssetPerformance = (assetId: string, params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.assets.performance(assetId, params),
    queryFn: () => AssetsService.getAssetPerformanceReport(assetId, params),
    enabled: !!assetId,
    staleTime: 10 * 60 * 1000,
  });
};

// Asset Location Hooks
export const useAssetsByLocation = (location: string, params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.assets.byLocation(location, params),
    queryFn: () => AssetsService.getAssetsByLocation(location, params),
    enabled: !!location,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateAssetLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assetId, location }: { assetId: string; location: string }) =>
      AssetsService.updateAssetLocation(assetId, location),
    onSuccess: (_, { assetId, location }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.detail(assetId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.byLocation(location) });
      toast({
        title: 'Success',
        description: 'Asset location updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update asset location',
        variant: 'destructive',
      });
    },
  });
};

// Asset Statistics Hooks
export const useAssetStats = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.assets.stats(params),
    queryFn: () => AssetsService.getAssetStats(params),
    staleTime: 10 * 60 * 1000,
  });
};

export const useAssetDashboardSummary = () => {
  return useQuery({
    queryKey: queryKeys.assets.dashboardSummary(),
    queryFn: () => AssetsService.getDashboardSummary(),
    staleTime: 5 * 60 * 1000,
  });
};

// Asset Transfer/Assignment Hooks
export const useTransferAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      assetId, 
      data 
    }: { 
      assetId: string; 
      data: {
        newLocationId: string;
        transferDate: Date;
        reason?: string;
        transferredBy: string;
        notes?: string;
      }
    }) => AssetsService.transferAsset(assetId, data),
    onSuccess: (_, { assetId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.detail(assetId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.lists() });
      toast({
        title: 'Success',
        description: 'Asset transferred successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to transfer asset',
        variant: 'destructive',
      });
    },
  });
};

export const useAssignAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      assetId, 
      data 
    }: { 
      assetId: string; 
      data: {
        assignedTo: string;
        assignmentDate: Date;
        purpose?: string;
        expectedReturnDate?: Date;
        notes?: string;
      }
    }) => AssetsService.assignAsset(assetId, data),
    onSuccess: (_, { assetId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.detail(assetId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.lists() });
      toast({
        title: 'Success',
        description: 'Asset assigned successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign asset',
        variant: 'destructive',
      });
    },
  });
};