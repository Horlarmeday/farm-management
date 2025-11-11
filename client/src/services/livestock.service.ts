import { ApiResponse, PaginatedResponse } from '../../../shared/src/types/api.types';
import {
  Animal,
  AnimalFeedingLog,
  AnimalHealthRecord,
  AnimalProductionLog,
  AnimalSale,
  BreedingRecord,
  CreateAnimalProductionLogRequest,
  CreateAnimalRequest,
  CreateBreedingRecordRequest,
  CreateLivestockHealthRecordRequest,
  CreateWeightRecordRequest,
  GrazingLog,
  LivestockStats,
  PastureManagement,
  UpdateAnimalRequest,
  WeightRecord,
} from '../../../shared/src/types/livestock.types';
import { apiClient } from './api';

export class LivestockService {
  private static readonly BASE_URL = '/api/livestock';
  // Animal Management
  static async getAnimals(params?: {
    species?: string;
    status?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Animal>> {
    const response = await apiClient.get(`${this.BASE_URL}/animals`, params);
    return response.data;
  }

  static async getAnimal(id: string): Promise<ApiResponse<Animal>> {
    const response = await apiClient.get(`${this.BASE_URL}/animals/${id}`);
    return response.data;
  }

  static async createAnimal(data: CreateAnimalRequest): Promise<ApiResponse<Animal>> {
    const response = await apiClient.post(`${this.BASE_URL}/animals`, data);
    return response.data;
  }

  static async updateAnimal(id: string, data: UpdateAnimalRequest): Promise<ApiResponse<Animal>> {
    const response = await apiClient.put(`${this.BASE_URL}/animals/${id}`, data);
    return response.data;
  }

  static async deleteAnimal(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.BASE_URL}/animals/${id}`);
    return response.data;
  }

  // Health Records
  static async getHealthRecords(
    animalId?: string,
    params?: {
      type?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResponse<AnimalHealthRecord>> {
    const url = animalId
      ? `${this.BASE_URL}/animals/${animalId}/health`
      : `${this.BASE_URL}/health`;
    const response = await apiClient.get(url, params);
    return response.data;
  }

  static async createHealthRecord(
    data: CreateLivestockHealthRecordRequest,
  ): Promise<ApiResponse<AnimalHealthRecord>> {
    const response = await apiClient.post(`${this.BASE_URL}/health`, data);
    return response.data;
  }

  static async updateHealthRecord(
    id: string,
    data: Partial<CreateLivestockHealthRecordRequest>,
  ): Promise<ApiResponse<AnimalHealthRecord>> {
    const response = await apiClient.put(`${this.BASE_URL}/health/${id}`, data);
    return response.data;
  }

  static async deleteHealthRecord(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.BASE_URL}/health/${id}`);
    return response.data;
  }

  // Breeding Records
  static async getBreedingRecords(params?: {
    femaleId?: string;
    maleId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<BreedingRecord>> {
    const response = await apiClient.get(`${this.BASE_URL}/breeding`, params);
    return response.data;
  }

  static async createBreedingRecord(
    data: CreateBreedingRecordRequest,
  ): Promise<ApiResponse<BreedingRecord>> {
    const response = await apiClient.post(`${this.BASE_URL}/breeding`, data);
    return response.data;
  }

  static async updateBreedingRecord(
    id: string,
    data: Partial<CreateBreedingRecordRequest>,
  ): Promise<ApiResponse<BreedingRecord>> {
    const response = await apiClient.put(`${this.BASE_URL}/breeding/${id}`, data);
    return response.data;
  }

  static async deleteBreedingRecord(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.BASE_URL}/breeding/${id}`);
    return response.data;
  }

  // Production Logs
  static async getProductionLogs(
    animalId?: string,
    params?: {
      productionType?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResponse<AnimalProductionLog>> {
    const url = animalId
      ? `${this.BASE_URL}/animals/${animalId}/production`
      : `${this.BASE_URL}/production`;
    const response = await apiClient.get(url, params);
    return response.data;
  }

  static async createProductionLog(
    data: CreateAnimalProductionLogRequest,
  ): Promise<ApiResponse<AnimalProductionLog>> {
    const response = await apiClient.post(`${this.BASE_URL}/production`, data);
    return response.data;
  }

  static async updateProductionLog(
    id: string,
    data: Partial<CreateAnimalProductionLogRequest>,
  ): Promise<ApiResponse<AnimalProductionLog>> {
    const response = await apiClient.put(`${this.BASE_URL}/production/${id}`, data);
    return response.data;
  }

  static async deleteProductionLog(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.BASE_URL}/production/${id}`);
    return response.data;
  }

  // Feeding Logs
  static async getFeedingLogs(
    animalId?: string,
    params?: {
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResponse<AnimalFeedingLog>> {
    const url = animalId
      ? `${this.BASE_URL}/animals/${animalId}/feeding`
      : `${this.BASE_URL}/feeding`;
    const response = await apiClient.get(url, params);
    return response.data;
  }

  static async createFeedingLog(data: {
    animalId: string;
    date: Date;
    feedType: string;
    quantityKg: number;
    feedCostPerKg: number;
    supplementsUsed?: string;
    notes?: string;
  }): Promise<ApiResponse<AnimalFeedingLog>> {
    const response = await apiClient.post(`${this.BASE_URL}/feeding`, data);
    return response.data;
  }

  static async updateFeedingLog(
    id: string,
    data: Partial<{
      feedType: string;
      quantityKg: number;
      feedCostPerKg: number;
      supplementsUsed?: string;
      notes?: string;
    }>,
  ): Promise<ApiResponse<AnimalFeedingLog>> {
    const response = await apiClient.put(`${this.BASE_URL}/feeding/${id}`, data);
    return response.data;
  }

  static async deleteFeedingLog(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.BASE_URL}/feeding/${id}`);
    return response.data;
  }

  // Weight Records
  static async getWeightRecords(
    animalId?: string,
    params?: {
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResponse<WeightRecord>> {
    const url = animalId
      ? `${this.BASE_URL}/animals/${animalId}/weight`
      : `${this.BASE_URL}/weight`;
    const response = await apiClient.get(url, params);
    return response.data;
  }

  static async createWeightRecord(
    data: CreateWeightRecordRequest,
  ): Promise<ApiResponse<WeightRecord>> {
    const response = await apiClient.post(`${this.BASE_URL}/weight`, data);
    return response.data;
  }

  static async updateWeightRecord(
    id: string,
    data: Partial<CreateWeightRecordRequest>,
  ): Promise<ApiResponse<WeightRecord>> {
    const response = await apiClient.put(`${this.BASE_URL}/weight/${id}`, data);
    return response.data;
  }

  static async deleteWeightRecord(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.BASE_URL}/weight/${id}`);
    return response.data;
  }

  // Sales
  static async getSales(params?: {
    animalId?: string;
    startDate?: string;
    endDate?: string;
    saleType?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AnimalSale>> {
    const response = await apiClient.get(`${this.BASE_URL}/sales`, params);
    return response.data;
  }

  static async createSale(data: {
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
  }): Promise<ApiResponse<AnimalSale>> {
    const response = await apiClient.post(`${this.BASE_URL}/sales`, data);
    return response.data;
  }

  static async updateSale(
    id: string,
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
    }>,
  ): Promise<ApiResponse<AnimalSale>> {
    const response = await apiClient.put(`${this.BASE_URL}/sales/${id}`, data);
    return response.data;
  }

  static async deleteSale(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.BASE_URL}/sales/${id}`);
    return response.data;
  }

  // Pasture Management
  static async getPastures(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<PastureManagement>> {
    const response = await apiClient.get(`${this.BASE_URL}/pastures`, params);
    return response.data;
  }

  static async getPasture(id: string): Promise<ApiResponse<PastureManagement>> {
    const response = await apiClient.get(`${this.BASE_URL}/pastures/${id}`);
    return response.data;
  }

  static async createPasture(data: {
    name: string;
    locationId: string;
    area: number;
    grassType: string;
    capacity: number;
    rotationSchedule?: string;
    notes?: string;
  }): Promise<ApiResponse<PastureManagement>> {
    const response = await apiClient.post(`${this.BASE_URL}/pastures`, data);
    return response.data;
  }

  static async updatePasture(
    id: string,
    data: Partial<{
      name: string;
      area: number;
      grassType: string;
      capacity: number;
      rotationSchedule?: string;
      status: 'available' | 'occupied' | 'resting' | 'maintenance';
      notes?: string;
    }>,
  ): Promise<ApiResponse<PastureManagement>> {
    const response = await apiClient.put(`${this.BASE_URL}/pastures/${id}`, data);
    return response.data;
  }

  static async deletePasture(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.BASE_URL}/pastures/${id}`);
    return response.data;
  }

  // Grazing Logs
  static async getGrazingLogs(
    pastureId?: string,
    params?: {
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResponse<GrazingLog>> {
    const url = pastureId
      ? `${this.BASE_URL}/pastures/${pastureId}/grazing`
      : `${this.BASE_URL}/grazing`;
    const response = await apiClient.get(url, params);
    return response.data;
  }

  static async createGrazingLog(data: {
    pastureId: string;
    animalIds: string[];
    startDate: Date;
    endDate?: Date;
    grassQuality: 'excellent' | 'good' | 'fair' | 'poor';
    weatherConditions?: string;
    notes?: string;
  }): Promise<ApiResponse<GrazingLog>> {
    const response = await apiClient.post(`${this.BASE_URL}/grazing`, data);
    return response.data;
  }

  static async updateGrazingLog(
    id: string,
    data: Partial<{
      endDate?: Date;
      grassQuality: 'excellent' | 'good' | 'fair' | 'poor';
      weatherConditions?: string;
      notes?: string;
    }>,
  ): Promise<ApiResponse<GrazingLog>> {
    const response = await apiClient.put(`${this.BASE_URL}/grazing/${id}`, data);
    return response.data;
  }

  static async deleteGrazingLog(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.BASE_URL}/grazing/${id}`);
    return response.data;
  }

  // Analytics and Reports
  static async getLivestockStats(params?: {
    species?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<LivestockStats>> {
    const response = await apiClient.get(`${this.BASE_URL}/stats`, params);
    return response.data;
  }

  static async getPerformanceReport(params?: {
    animalId?: string;
    species?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`${this.BASE_URL}/reports/performance`, params);
    return response.data;
  }

  static async getProductionSummary(params?: {
    productionType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`${this.BASE_URL}/reports/production`, params);
    return response.data;
  }

  static async getBreedingReport(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`${this.BASE_URL}/reports/breeding`, params);
    return response.data;
  }

  static async getHealthReport(params?: {
    animalId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`${this.BASE_URL}/reports/health`, params);
    return response.data;
  }

  static async getDashboardSummary(): Promise<
    ApiResponse<{
      totalAnimals: number;
      activeAnimals: number;
      pregnantAnimals: number;
      sickAnimals: number;
      recentBirths: number;
      recentDeaths: number;
      totalMilkProduction: number;
      totalRevenue: number;
      upcomingTasks: any[];
    }>
  > {
    const response = await apiClient.get(`${this.BASE_URL}/dashboard`);
    return response.data;
  }
}
