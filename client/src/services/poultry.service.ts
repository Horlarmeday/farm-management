import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import {
  BirdBatch,
  BirdFeedingLog,
  BirdHealthRecord,
  BirdSale,
  BirdStatus,
  BirdType,
  CreateBirdBatchRequest,
  CreateEggProductionLogRequest,
  CreatePoultryFeedingLogRequest,
  CreatePoultryHealthRecordRequest,
  EggProductionLog,
  PoultryStats,
  UpdateBirdBatchRequest,
} from '@/types/poultry.types';
import { apiClient } from './api';

export class PoultryService {
  private static readonly BASE_URL = '/api/poultry';
  // Bird Batch Management
  static async getBirdBatches(params?: {
    page?: number;
    limit?: number;
    birdType?: BirdType;
    status?: BirdStatus;
    locationId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<BirdBatch>> {
    const response = await apiClient.get(`${this.BASE_URL}/batches`, { params });
    return response.data;
  }

  static async getBirdBatch(id: string): Promise<ApiResponse<BirdBatch>> {
    const response = await apiClient.get(`${this.BASE_URL}/batches/${id}`);
    return response.data;
  }

  static async createBirdBatch(data: CreateBirdBatchRequest): Promise<ApiResponse<BirdBatch>> {
    const response = await apiClient.post(`${this.BASE_URL}/batches`, data);
    return response.data;
  }

  static async updateBirdBatch(
    id: string,
    data: UpdateBirdBatchRequest,
  ): Promise<ApiResponse<BirdBatch>> {
    const response = await apiClient.put(`${this.BASE_URL}/batches/${id}`, data);
    return response.data;
  }

  static async deleteBirdBatch(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.BASE_URL}/batches/${id}`);
    return response.data;
  }

  // Feeding Logs
  static async getFeedingLogs(
    batchId: string,
    params?: {
      page?: number;
      limit?: number;
      dateFrom?: string;
      dateTo?: string;
    },
  ): Promise<PaginatedResponse<BirdFeedingLog>> {
    // Server expects batchId as query parameter: GET /api/poultry/feeding?batchId=xxx
    const response = await apiClient.get(`${this.BASE_URL}/feeding`, {
      params: { ...params, batchId },
    });
    return response.data;
  }

  static async createFeedingLog(
    data: CreatePoultryFeedingLogRequest,
  ): Promise<ApiResponse<BirdFeedingLog>> {
    // Server endpoint: POST /api/poultry/feeding
    const response = await apiClient.post(`${this.BASE_URL}/feeding`, data);
    return response.data;
  }

  static async deleteFeedingLog(id: string): Promise<ApiResponse<void>> {
    // TODO: Server endpoint not implemented yet - DELETE /api/poultry/feeding/:id
    const response = await apiClient.delete(`${this.BASE_URL}/feeding/${id}`);
    return response.data;
  }

  // Health Records
  static async getHealthRecords(
    batchId: string,
    params?: {
      page?: number;
      limit?: number;
      type?: 'vaccination' | 'treatment' | 'disease' | 'inspection';
      dateFrom?: string;
      dateTo?: string;
    },
  ): Promise<PaginatedResponse<BirdHealthRecord>> {
    // Server expects batchId as query parameter: GET /api/poultry/health?batchId=xxx
    const response = await apiClient.get(`${this.BASE_URL}/health`, {
      params: { ...params, batchId },
    });
    return response.data;
  }

  static async createHealthRecord(
    data: CreatePoultryHealthRecordRequest,
  ): Promise<ApiResponse<BirdHealthRecord>> {
    // Server endpoint: POST /api/poultry/health
    const response = await apiClient.post(`${this.BASE_URL}/health`, data);
    return response.data;
  }

  static async deleteHealthRecord(id: string): Promise<ApiResponse<void>> {
    // TODO: Server endpoint not implemented yet - DELETE /api/poultry/health/:id
    const response = await apiClient.delete(`${this.BASE_URL}/health/${id}`);
    return response.data;
  }

  // Egg Production
  static async getEggProductionLogs(
    batchId: string,
    params?: {
      page?: number;
      limit?: number;
      dateFrom?: string;
      dateTo?: string;
    },
  ): Promise<PaginatedResponse<EggProductionLog>> {
    // Server expects batchId as query parameter: GET /api/poultry/egg-production?batchId=xxx
    const response = await apiClient.get(`${this.BASE_URL}/egg-production`, {
      params: { ...params, batchId },
    });
    return response.data;
  }

  static async createEggProductionLog(
    data: CreateEggProductionLogRequest,
  ): Promise<ApiResponse<EggProductionLog>> {
    // Server endpoint: POST /api/poultry/egg-production
    const response = await apiClient.post(`${this.BASE_URL}/egg-production`, data);
    return response.data;
  }

  static async deleteEggProductionLog(id: string): Promise<ApiResponse<void>> {
    // TODO: Server endpoint not implemented yet - DELETE /api/poultry/egg-production/:id
    const response = await apiClient.delete(`${this.BASE_URL}/egg-production/${id}`);
    return response.data;
  }

  // Bird Sales
  static async getBirdSales(
    batchId: string,
    params?: {
      page?: number;
      limit?: number;
      dateFrom?: string;
      dateTo?: string;
    },
  ): Promise<PaginatedResponse<BirdSale>> {
    // Server expects batchId as query parameter: GET /api/poultry/sales?batchId=xxx
    const response = await apiClient.get(`${this.BASE_URL}/sales`, {
      params: { ...params, batchId },
    });
    return response.data;
  }

  static async createBirdSale(
    batchId: string,
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
    },
  ): Promise<ApiResponse<BirdSale>> {
    // Server endpoint: POST /api/poultry/sales
    const response = await apiClient.post(`${this.BASE_URL}/sales`, { ...data, batchId });
    return response.data;
  }

  // Analytics and Reports
  static async getPoultryStats(params?: {
    dateFrom?: string;
    dateTo?: string;
    batchId?: string;
  }): Promise<ApiResponse<PoultryStats>> {
    // TODO: Server endpoint not implemented yet - GET /api/poultry/analytics
    const response = await apiClient.get(`${this.BASE_URL}/analytics`, { params });
    return response.data;
  }

  static async getBatchPerformance(
    batchId: string,
    params?: {
      dateFrom?: string;
      dateTo?: string;
    },
  ): Promise<
    ApiResponse<{
      totalEggsProduced: number;
      averageProductionRate: number;
      totalFeedConsumed: number;
      feedConversionRatio: number;
      mortalityRate: number;
      totalRevenue: number;
      profitMargin: number;
    }>
  > {
    // Server endpoint: GET /api/poultry/batches/:id/performance
    const response = await apiClient.get(`${this.BASE_URL}/batches/${batchId}/performance`, {
      params,
    });
    return response.data;
  }

  static async getProductionSummary(params?: { dateFrom?: string; dateTo?: string }): Promise<
    ApiResponse<{
      totalBatches: number;
      activeBatches: number;
      totalBirds: number;
      totalEggProduction: number;
      totalSales: number;
      totalRevenue: number;
      averageMortalityRate: number;
    }>
  > {
    // TODO: Server endpoint not implemented yet - GET /api/poultry/production-summary
    const response = await apiClient.get(`${this.BASE_URL}/production-summary`, { params });
    return response.data;
  }

  // Dashboard Summary
  static async getDashboardSummary(): Promise<
    ApiResponse<{
      activeBatches: number;
      totalBirds: number;
      todayEggProduction: number;
      monthlyEggProduction: number;
      averageProductionRate: number;
      mortalityRate: number;
      upcomingVaccinations: number;
      lowStockFeeds: number;
    }>
  > {
    // TODO: Server endpoint not implemented yet - GET /api/poultry/dashboard-summary
    const response = await apiClient.get(`${this.BASE_URL}/dashboard-summary`);
    return response.data;
  }
}
