import { apiClient } from './api';
import {
  Pond,
  FishStockingLog,
  WaterQualityLog,
  FishFeedingLog,
  FishSamplingLog,
  FishHarvestLog,
  PondMaintenanceLog,
  FishSale,
  FishMortality,
  FisheryStats,
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
import { ApiResponse, PaginatedResponse } from '../../../shared/src/types/api.types';

export class FisheryService {
  // Pond Management
  static async getPonds(params?: {
    type?: PondType;
    status?: PondStatus;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Pond>> {
    const response = await apiClient.get('/fishery/ponds', {
      params,
    });
    return response.data;
  }

  static async getPondById(id: string): Promise<ApiResponse<Pond>> {
    const response = await apiClient.get(`/fishery/ponds/${id}`);
    return response.data;
  }

  static async createPond(data: CreatePondRequest): Promise<ApiResponse<Pond>> {
    const response = await apiClient.post('/fishery/ponds', data);
    return response.data;
  }

  static async updatePond(id: string, data: UpdatePondRequest): Promise<ApiResponse<Pond>> {
    const response = await apiClient.put(`/fishery/ponds/${id}`, data);
    return response.data;
  }

  static async deletePond(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/fishery/ponds/${id}`);
    return response.data;
  }

  // Fish Stocking Management
  static async getStockingLogs(params?: {
    pondId?: string;
    species?: FishSpecies;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<FishStockingLog>> {
    const response = await apiClient.get('/fishery/stocking', {
      params,
    });
    return response.data;
  }

  static async createStockingLog(data: CreateStockingLogRequest): Promise<ApiResponse<FishStockingLog>> {
    const response = await apiClient.post('/fishery/stocking', data);
    return response.data;
  }

  static async getStockingLogById(id: string): Promise<ApiResponse<FishStockingLog>> {
    const response = await apiClient.get(`/fishery/stocking/${id}`);
    return response.data;
  }

  static async updateStockingLog(id: string, data: Partial<CreateStockingLogRequest>): Promise<ApiResponse<FishStockingLog>> {
    const response = await apiClient.put(`/fishery/stocking/${id}`, data);
    return response.data;
  }

  static async deleteStockingLog(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/fishery/stocking/${id}`);
    return response.data;
  }

  // Water Quality Management
  static async getWaterQualityLogs(params?: {
    pondId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<WaterQualityLog>> {
    const response = await apiClient.get('/fishery/water-quality', {
      params,
    });
    return response.data;
  }

  static async createWaterQualityLog(data: CreateWaterQualityLogRequest): Promise<ApiResponse<WaterQualityLog>> {
    const response = await apiClient.post('/fishery/water-quality', data);
    return response.data;
  }

  static async getWaterQualityLogById(id: string): Promise<ApiResponse<WaterQualityLog>> {
    const response = await apiClient.get(`/fishery/water-quality/${id}`);
    return response.data;
  }

  static async updateWaterQualityLog(id: string, data: Partial<CreateWaterQualityLogRequest>): Promise<ApiResponse<WaterQualityLog>> {
    const response = await apiClient.put(`/fishery/water-quality/${id}`, data);
    return response.data;
  }

  static async deleteWaterQualityLog(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/fishery/water-quality/${id}`);
    return response.data;
  }

  // Fish Feeding Management
  static async getFeedingLogs(params?: {
    pondId?: string;
    feedType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<FishFeedingLog>> {
    const response = await apiClient.get('/fishery/feeding', {
      params,
    });
    return response.data;
  }

  static async createFeedingLog(data: CreateFishFeedingLogRequest): Promise<ApiResponse<FishFeedingLog>> {
    const response = await apiClient.post('/fishery/feeding', data);
    return response.data;
  }

  static async getFeedingLogById(id: string): Promise<ApiResponse<FishFeedingLog>> {
    const response = await apiClient.get(`/fishery/feeding/${id}`);
    return response.data;
  }

  static async updateFeedingLog(id: string, data: Partial<CreateFishFeedingLogRequest>): Promise<ApiResponse<FishFeedingLog>> {
    const response = await apiClient.put(`/fishery/feeding/${id}`, data);
    return response.data;
  }

  static async deleteFeedingLog(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/fishery/feeding/${id}`);
    return response.data;
  }

  // Fish Sampling Management
  static async getSamplingLogs(params?: {
    pondId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<FishSamplingLog>> {
    const response = await apiClient.get('/fishery/sampling', {
      params,
    });
    return response.data;
  }

  static async createSamplingLog(data: CreateSamplingLogRequest): Promise<ApiResponse<FishSamplingLog>> {
    const response = await apiClient.post('/fishery/sampling', data);
    return response.data;
  }

  static async getSamplingLogById(id: string): Promise<ApiResponse<FishSamplingLog>> {
    const response = await apiClient.get(`/fishery/sampling/${id}`);
    return response.data;
  }

  static async updateSamplingLog(id: string, data: Partial<CreateSamplingLogRequest>): Promise<ApiResponse<FishSamplingLog>> {
    const response = await apiClient.put(`/fishery/sampling/${id}`, data);
    return response.data;
  }

  static async deleteSamplingLog(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/fishery/sampling/${id}`);
    return response.data;
  }

  // Fish Harvest Management
  static async getHarvestLogs(params?: {
    pondId?: string;
    harvestMethod?: 'complete' | 'partial' | 'selective';
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<FishHarvestLog>> {
    const response = await apiClient.get('/fishery/harvests', {
      params,
    });
    return response.data;
  }

  static async createHarvestLog(data: CreateHarvestLogRequest): Promise<ApiResponse<FishHarvestLog>> {
    const response = await apiClient.post('/fishery/harvests', data);
    return response.data;
  }

  static async getHarvestLogById(id: string): Promise<ApiResponse<FishHarvestLog>> {
    const response = await apiClient.get(`/fishery/harvests/${id}`);
    return response.data;
  }

  static async updateHarvestLog(id: string, data: Partial<CreateHarvestLogRequest>): Promise<ApiResponse<FishHarvestLog>> {
    const response = await apiClient.put(`/fishery/harvests/${id}`, data);
    return response.data;
  }

  static async deleteHarvestLog(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/fishery/harvests/${id}`);
    return response.data;
  }

  // Pond Maintenance Management
  static async getMaintenanceLogs(params?: {
    pondId?: string;
    maintenanceType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<PondMaintenanceLog>> {
    const response = await apiClient.get('/fishery/maintenance', {
      params,
    });
    return response.data;
  }

  static async createMaintenanceLog(data: {
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
  }): Promise<ApiResponse<PondMaintenanceLog>> {
    const response = await apiClient.post('/fishery/maintenance', data);
    return response.data;
  }

  // Fish Sales Management
  static async getSales(params?: {
    startDate?: string;
    endDate?: string;
    buyerName?: string;
    paymentStatus?: 'pending' | 'partial' | 'paid';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<FishSale>> {
    const response = await apiClient.get('/fishery/sales', {
      params,
    });
    return response.data;
  }

  static async createSale(data: {
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
  }): Promise<ApiResponse<FishSale>> {
    const response = await apiClient.post('/fishery/sales', data);
    return response.data;
  }

  // Fish Mortality Management
  static async getMortalityRecords(params?: {
    pondId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<FishMortality>> {
    const response = await apiClient.get('/fishery/mortality', {
      params,
    });
    return response.data;
  }

  static async createMortalityRecord(data: {
    pondId: string;
    date: Date;
    mortalityCount: number;
    suspectedCause?: string;
    symptoms?: string;
    actionTaken?: string;
    treatmentApplied?: string;
    cost?: number;
    notes?: string;
  }): Promise<ApiResponse<FishMortality>> {
    const response = await apiClient.post('/fishery/mortality', data);
    return response.data;
  }

  // Analytics and Reports
  static async getFisheryStats(params?: {
    startDate?: string;
    endDate?: string;
    pondId?: string;
  }): Promise<ApiResponse<FisheryStats>> {
    const response = await apiClient.get('/fishery/stats', {
      params,
    });
    return response.data;
  }

  static async getPondPerformance(pondId: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/fishery/ponds/${pondId}/performance`, {
      params,
    });
    return response.data;
  }

  static async getFeedConversionReport(params?: {
    pondId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/fishery/reports/feed-conversion', {
      params,
    });
    return response.data;
  }

  static async getProductionSummary(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'pond' | 'species' | 'month';
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/fishery/reports/production-summary', {
      params,
    });
    return response.data;
  }

  static async getFinancialReport(params?: {
    startDate?: string;
    endDate?: string;
    pondId?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/fishery/reports/financial', {
      params,
    });
    return response.data;
  }

  static async getDashboardSummary(): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/fishery/dashboard');
    return response.data;
  }
}