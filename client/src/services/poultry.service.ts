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
} from '@/types/poultry.types';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { apiClient } from './api';

export class PoultryService {
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
    const response = await apiClient.get('/poultry/batches', { params });
    return response.data;
  }

  static async getBirdBatch(id: string): Promise<ApiResponse<BirdBatch>> {
    const response = await apiClient.get(`/poultry/batches/${id}`);
    return response.data;
  }

  static async createBirdBatch(data: CreateBirdBatchRequest): Promise<ApiResponse<BirdBatch>> {
    const response = await apiClient.post('/poultry/batches', data);
    return response.data;
  }

  static async updateBirdBatch(id: string, data: UpdateBirdBatchRequest): Promise<ApiResponse<BirdBatch>> {
    const response = await apiClient.put(`/poultry/batches/${id}`, data);
    return response.data;
  }

  static async deleteBirdBatch(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/poultry/batches/${id}`);
    return response.data;
  }

  // Feeding Logs
  static async getFeedingLogs(batchId: string, params?: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<BirdFeedingLog>> {
    const response = await apiClient.get(`/poultry/batches/${batchId}/feeding-logs`, { params });
    return response.data;
  }

  static async createFeedingLog(data: CreatePoultryFeedingLogRequest): Promise<ApiResponse<BirdFeedingLog>> {
    const response = await apiClient.post('/poultry/feeding-logs', data);
    return response.data;
  }

  static async deleteFeedingLog(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/poultry/feeding-logs/${id}`);
    return response.data;
  }

  // Health Records
  static async getHealthRecords(batchId: string, params?: {
    page?: number;
    limit?: number;
    type?: 'vaccination' | 'treatment' | 'disease' | 'inspection';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<BirdHealthRecord>> {
    const response = await apiClient.get(`/poultry/batches/${batchId}/health-records`, { params });
    return response.data;
  }

  static async createHealthRecord(data: CreatePoultryHealthRecordRequest): Promise<ApiResponse<BirdHealthRecord>> {
    const response = await apiClient.post('/poultry/health-records', data);
    return response.data;
  }

  static async deleteHealthRecord(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/poultry/health-records/${id}`);
    return response.data;
  }

  // Egg Production
  static async getEggProductionLogs(batchId: string, params?: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<EggProductionLog>> {
    const response = await apiClient.get(`/poultry/batches/${batchId}/egg-production`, { params });
    return response.data;
  }

  static async createEggProductionLog(data: CreateEggProductionLogRequest): Promise<ApiResponse<EggProductionLog>> {
    const response = await apiClient.post('/poultry/egg-production', data);
    return response.data;
  }

  static async deleteEggProductionLog(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/poultry/egg-production/${id}`);
    return response.data;
  }

  // Bird Sales
  static async getBirdSales(batchId: string, params?: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<BirdSale>> {
    const response = await apiClient.get(`/poultry/batches/${batchId}/sales`, { params });
    return response.data;
  }

  static async createBirdSale(batchId: string, data: {
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
  }): Promise<ApiResponse<BirdSale>> {
    const response = await apiClient.post(`/poultry/batches/${batchId}/sales`, data);
    return response.data;
  }

  // Analytics and Reports
  static async getPoultryStats(params?: {
    dateFrom?: string;
    dateTo?: string;
    batchId?: string;
  }): Promise<ApiResponse<PoultryStats>> {
    const response = await apiClient.get('/poultry/analytics', { params });
    return response.data;
  }

  static async getBatchPerformance(batchId: string, params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<{
    totalEggsProduced: number;
    averageProductionRate: number;
    totalFeedConsumed: number;
    feedConversionRatio: number;
    mortalityRate: number;
    totalRevenue: number;
    profitMargin: number;
  }>> {
    const response = await apiClient.get(`/poultry/batches/${batchId}/performance`, { params });
    return response.data;
  }

  static async getProductionSummary(params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<{
    totalBatches: number;
    activeBatches: number;
    totalBirds: number;
    totalEggProduction: number;
    totalSales: number;
    totalRevenue: number;
    averageMortalityRate: number;
  }>> {
    const response = await apiClient.get('/poultry/production-summary', { params });
    return response.data;
  }

  // Dashboard Summary
  static async getDashboardSummary(): Promise<ApiResponse<{
    activeBatches: number;
    totalBirds: number;
    todayEggProduction: number;
    monthlyEggProduction: number;
    averageProductionRate: number;
    mortalityRate: number;
    upcomingVaccinations: number;
    lowStockFeeds: number;
  }>> {
    const response = await apiClient.get('/poultry/dashboard-summary');
    return response.data;
  }
}