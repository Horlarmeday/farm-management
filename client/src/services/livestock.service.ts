import { apiClient } from './api';
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
import { ApiResponse, PaginatedResponse } from '../../../shared/src/types/api.types';

export class LivestockService {
  // Animal Management
  static async getAnimals(params?: {
    species?: string;
    status?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Animal>> {
    const response = await apiClient.get('/api/livestock/animals', { params });
    return response.data;
  }

  static async getAnimal(id: string): Promise<ApiResponse<Animal>> {
    const response = await apiClient.get(`/api/livestock/animals/${id}`);
    return response.data;
  }

  static async createAnimal(data: CreateAnimalRequest): Promise<ApiResponse<Animal>> {
    const response = await apiClient.post('/api/livestock/animals', data);
    return response.data;
  }

  static async updateAnimal(id: string, data: UpdateAnimalRequest): Promise<ApiResponse<Animal>> {
    const response = await apiClient.put(`/api/livestock/animals/${id}`, data);
    return response.data;
  }

  static async deleteAnimal(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/livestock/animals/${id}`);
    return response.data;
  }

  // Health Records
  static async getHealthRecords(animalId?: string, params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AnimalHealthRecord>> {
    const url = animalId ? `/api/livestock/animals/${animalId}/health` : '/api/livestock/health';
    const response = await apiClient.get(url, { params });
    return response.data;
  }

  static async createHealthRecord(data: CreateLivestockHealthRecordRequest): Promise<ApiResponse<AnimalHealthRecord>> {
    const response = await apiClient.post('/api/livestock/health', data);
    return response.data;
  }

  static async updateHealthRecord(id: string, data: Partial<CreateLivestockHealthRecordRequest>): Promise<ApiResponse<AnimalHealthRecord>> {
    const response = await apiClient.put(`/api/livestock/health/${id}`, data);
    return response.data;
  }

  static async deleteHealthRecord(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/livestock/health/${id}`);
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
    const response = await apiClient.get('/api/livestock/breeding', { params });
    return response.data;
  }

  static async createBreedingRecord(data: CreateBreedingRecordRequest): Promise<ApiResponse<BreedingRecord>> {
    const response = await apiClient.post('/api/livestock/breeding', data);
    return response.data;
  }

  static async updateBreedingRecord(id: string, data: Partial<CreateBreedingRecordRequest>): Promise<ApiResponse<BreedingRecord>> {
    const response = await apiClient.put(`/api/livestock/breeding/${id}`, data);
    return response.data;
  }

  static async deleteBreedingRecord(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/livestock/breeding/${id}`);
    return response.data;
  }

  // Production Logs
  static async getProductionLogs(animalId?: string, params?: {
    productionType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AnimalProductionLog>> {
    const url = animalId ? `/api/livestock/animals/${animalId}/production` : '/api/livestock/production';
    const response = await apiClient.get(url, { params });
    return response.data;
  }

  static async createProductionLog(data: CreateAnimalProductionLogRequest): Promise<ApiResponse<AnimalProductionLog>> {
    const response = await apiClient.post('/api/livestock/production', data);
    return response.data;
  }

  static async updateProductionLog(id: string, data: Partial<CreateAnimalProductionLogRequest>): Promise<ApiResponse<AnimalProductionLog>> {
    const response = await apiClient.put(`/api/livestock/production/${id}`, data);
    return response.data;
  }

  static async deleteProductionLog(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/livestock/production/${id}`);
    return response.data;
  }

  // Feeding Logs
  static async getFeedingLogs(animalId?: string, params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AnimalFeedingLog>> {
    const url = animalId ? `/api/livestock/animals/${animalId}/feeding` : '/api/livestock/feeding';
    const response = await apiClient.get(url, { params });
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
    const response = await apiClient.post('/api/livestock/feeding', data);
    return response.data;
  }

  static async updateFeedingLog(id: string, data: Partial<{
    feedType: string;
    quantityKg: number;
    feedCostPerKg: number;
    supplementsUsed?: string;
    notes?: string;
  }>): Promise<ApiResponse<AnimalFeedingLog>> {
    const response = await apiClient.put(`/api/livestock/feeding/${id}`, data);
    return response.data;
  }

  static async deleteFeedingLog(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/livestock/feeding/${id}`);
    return response.data;
  }

  // Weight Records
  static async getWeightRecords(animalId?: string, params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<WeightRecord>> {
    const url = animalId ? `/api/livestock/animals/${animalId}/weight` : '/api/livestock/weight';
    const response = await apiClient.get(url, { params });
    return response.data;
  }

  static async createWeightRecord(data: CreateWeightRecordRequest): Promise<ApiResponse<WeightRecord>> {
    const response = await apiClient.post('/api/livestock/weight', data);
    return response.data;
  }

  static async updateWeightRecord(id: string, data: Partial<CreateWeightRecordRequest>): Promise<ApiResponse<WeightRecord>> {
    const response = await apiClient.put(`/api/livestock/weight/${id}`, data);
    return response.data;
  }

  static async deleteWeightRecord(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/livestock/weight/${id}`);
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
    const response = await apiClient.get('/api/livestock/sales', { params });
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
    const response = await apiClient.post('/api/livestock/sales', data);
    return response.data;
  }

  static async updateSale(id: string, data: Partial<{
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
  }>): Promise<ApiResponse<AnimalSale>> {
    const response = await apiClient.put(`/api/livestock/sales/${id}`, data);
    return response.data;
  }

  static async deleteSale(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/livestock/sales/${id}`);
    return response.data;
  }

  // Pasture Management
  static async getPastures(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<PastureManagement>> {
    const response = await apiClient.get('/api/livestock/pastures', { params });
    return response.data;
  }

  static async getPasture(id: string): Promise<ApiResponse<PastureManagement>> {
    const response = await apiClient.get(`/api/livestock/pastures/${id}`);
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
    const response = await apiClient.post('/api/livestock/pastures', data);
    return response.data;
  }

  static async updatePasture(id: string, data: Partial<{
    name: string;
    area: number;
    grassType: string;
    capacity: number;
    rotationSchedule?: string;
    status: 'available' | 'occupied' | 'resting' | 'maintenance';
    notes?: string;
  }>): Promise<ApiResponse<PastureManagement>> {
    const response = await apiClient.put(`/api/livestock/pastures/${id}`, data);
    return response.data;
  }

  static async deletePasture(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/livestock/pastures/${id}`);
    return response.data;
  }

  // Grazing Logs
  static async getGrazingLogs(pastureId?: string, params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<GrazingLog>> {
    const url = pastureId ? `/api/livestock/pastures/${pastureId}/grazing` : '/api/livestock/grazing';
    const response = await apiClient.get(url, { params });
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
    const response = await apiClient.post('/api/livestock/grazing', data);
    return response.data;
  }

  static async updateGrazingLog(id: string, data: Partial<{
    endDate?: Date;
    grassQuality: 'excellent' | 'good' | 'fair' | 'poor';
    weatherConditions?: string;
    notes?: string;
  }>): Promise<ApiResponse<GrazingLog>> {
    const response = await apiClient.put(`/api/livestock/grazing/${id}`, data);
    return response.data;
  }

  static async deleteGrazingLog(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/livestock/grazing/${id}`);
    return response.data;
  }

  // Analytics and Reports
  static async getLivestockStats(params?: {
    species?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<LivestockStats>> {
    const response = await apiClient.get('/api/livestock/stats', { params });
    return response.data;
  }

  static async getPerformanceReport(params?: {
    animalId?: string;
    species?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/api/livestock/reports/performance', { params });
    return response.data;
  }

  static async getProductionSummary(params?: {
    productionType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/api/livestock/reports/production', { params });
    return response.data;
  }

  static async getBreedingReport(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/api/livestock/reports/breeding', { params });
    return response.data;
  }

  static async getHealthReport(params?: {
    animalId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/api/livestock/reports/health', { params });
    return response.data;
  }

  static async getDashboardSummary(): Promise<ApiResponse<{
    totalAnimals: number;
    activeAnimals: number;
    pregnantAnimals: number;
    sickAnimals: number;
    recentBirths: number;
    recentDeaths: number;
    totalMilkProduction: number;
    totalRevenue: number;
    upcomingTasks: any[];
  }>> {
    const response = await apiClient.get('/api/livestock/dashboard');
    return response.data;
  }
}