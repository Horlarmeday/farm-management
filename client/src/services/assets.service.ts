import { apiClient } from './api';
import {
  Asset,
  MaintenanceLog,
  AssetUsageLog,
  AssetDepreciation,
  AssetStats,
  AssetType,
  AssetStatus,
  AssetCondition,
  MaintenanceType,
  MaintenanceStatus,
  CreateAssetRequest,
  UpdateAssetRequest,
  CreateMaintenanceLogRequest,
  UpdateMaintenanceLogRequest,
  CreateAssetUsageLogRequest,
} from '@/types/asset.types';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

export class AssetsService {
  // Asset Management
  static async getAssets(params?: {
    type?: 'equipment' | 'machinery' | 'infrastructure' | 'vehicle';
    status?: 'active' | 'inactive' | 'maintenance' | 'retired';
    location?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Asset>> {
    const response = await apiClient.get('/api/assets', { params });
    return response.data;
  }

  static async getAsset(id: string): Promise<ApiResponse<Asset>> {
    const response = await apiClient.get(`/api/assets/${id}`);
    return response.data;
  }

  static async createAsset(data: CreateAssetRequest): Promise<ApiResponse<Asset>> {
    const response = await apiClient.post('/api/assets', data);
    return response.data;
  }

  static async updateAsset(id: string, data: UpdateAssetRequest): Promise<ApiResponse<Asset>> {
    const response = await apiClient.put(`/api/assets/${id}`, data);
    return response.data;
  }

  static async deleteAsset(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/assets/${id}`);
    return response.data;
  }

  // Equipment Management (using Asset type with equipment category)
  static async getEquipment(params?: {
    category?: string;
    status?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Asset>> {
    const response = await apiClient.get('/api/assets/equipment', { params });
    return response.data;
  }

  static async getEquipmentItem(id: string): Promise<ApiResponse<Asset>> {
    const response = await apiClient.get(`/api/assets/equipment/${id}`);
    return response.data;
  }

  static async createEquipment(data: {
    name: string;
    category: AssetType;
    model?: string;
    serialNumber?: string;
    purchaseDate: Date;
    purchasePrice: number;
    supplier?: string;
    warranty?: string;
    locationId: string;
    status: AssetStatus;
    specifications?: Record<string, any>;
    notes?: string;
  }): Promise<ApiResponse<Asset>> {
    const response = await apiClient.post('/api/assets/equipment', data);
    return response.data;
  }

  static async updateEquipment(id: string, data: Partial<{
    name: string;
    category: AssetType;
    model?: string;
    locationId: string;
    status: AssetStatus;
    specifications?: Record<string, any>;
    notes?: string;
  }>): Promise<ApiResponse<Asset>> {
    const response = await apiClient.put(`/api/assets/equipment/${id}`, data);
    return response.data;
  }

  static async deleteEquipment(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/assets/equipment/${id}`);
    return response.data;
  }

  // Machinery Management (using Asset type with machinery category)
  static async getMachinery(params?: {
    type?: string;
    status?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Asset>> {
    const response = await apiClient.get('/api/assets/machinery', { params });
    return response.data;
  }

  static async getMachineryItem(id: string): Promise<ApiResponse<Asset>> {
    const response = await apiClient.get(`/api/assets/machinery/${id}`);
    return response.data;
  }

  static async createMachinery(data: {
    name: string;
    category: AssetType;
    model?: string;
    serialNumber?: string;
    purchaseDate: Date;
    purchasePrice: number;
    supplier?: string;
    engineHours?: number;
    fuelType?: string;
    capacity?: string;
    locationId: string;
    status: AssetStatus;
    specifications?: Record<string, any>;
    notes?: string;
  }): Promise<ApiResponse<Asset>> {
    const response = await apiClient.post('/api/assets/machinery', data);
    return response.data;
  }

  static async updateMachinery(id: string, data: Partial<{
    name: string;
    category: AssetType;
    model?: string;
    engineHours?: number;
    fuelType?: string;
    capacity?: string;
    locationId: string;
    status: AssetStatus;
    specifications?: Record<string, any>;
    notes?: string;
  }>): Promise<ApiResponse<Asset>> {
    const response = await apiClient.put(`/api/assets/machinery/${id}`, data);
    return response.data;
  }

  static async deleteMachinery(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/assets/machinery/${id}`);
    return response.data;
  }

  // Maintenance Records
  static async getMaintenanceRecords(assetId?: string, params?: {
    type?: MaintenanceType;
    status?: MaintenanceStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<MaintenanceLog>> {
    const response = await apiClient.get('/api/assets/maintenance/records', { 
      params: { assetId, ...params } 
    });
    return response.data;
  }

  static async getMaintenanceRecord(id: string): Promise<ApiResponse<MaintenanceLog>> {
    const response = await apiClient.get(`/api/assets/maintenance/records/${id}`);
    return response.data;
  }

  static async createMaintenanceRecord(data: CreateMaintenanceLogRequest): Promise<ApiResponse<MaintenanceLog>> {
    const response = await apiClient.post('/api/assets/maintenance/records', data);
    return response.data;
  }

  static async updateMaintenanceRecord(id: string, data: Partial<CreateMaintenanceLogRequest>): Promise<ApiResponse<MaintenanceLog>> {
    const response = await apiClient.put(`/api/assets/maintenance/records/${id}`, data);
    return response.data;
  }

  static async deleteMaintenanceRecord(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/assets/maintenance/records/${id}`);
    return response.data;
  }

  // Maintenance Scheduling (using MaintenanceLog for scheduled maintenance)
  static async getScheduledMaintenance(assetId?: string, params?: {
    status?: MaintenanceStatus;
    type?: MaintenanceType;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<MaintenanceLog>> {
    const response = await apiClient.get('/api/assets/maintenance/scheduled', { 
      params: { assetId, ...params } 
    });
    return response.data;
  }

  static async scheduleMaintenanceTask(data: CreateMaintenanceLogRequest): Promise<ApiResponse<MaintenanceLog>> {
    const response = await apiClient.post('/api/assets/maintenance/schedule', data);
    return response.data;
  }

  // Asset Depreciation
  static async getDepreciationRecords(assetId?: string, params?: {
    method?: 'straight_line' | 'declining_balance' | 'units_of_production';
    year?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AssetDepreciation>> {
    const response = await apiClient.get('/api/assets/depreciation', { 
      params: { assetId, ...params } 
    });
    return response.data;
  }

  static async calculateDepreciation(assetId: string, params?: {
    method?: 'straight_line' | 'declining_balance' | 'units_of_production';
    usefulLife?: number;
    salvageValue?: number;
  }): Promise<ApiResponse<AssetDepreciation>> {
    const response = await apiClient.post(`/api/assets/${assetId}/depreciation/calculate`, params);
    return response.data;
  }

  // Asset Location Management (simplified)
  static async getAssetsByLocation(locationId: string, params?: {
    type?: AssetType;
    status?: AssetStatus;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Asset>> {
    const response = await apiClient.get(`/api/assets/location/${locationId}`, { params });
    return response.data;
  }

  static async updateAssetLocation(assetId: string, locationId: string): Promise<ApiResponse<Asset>> {
    const response = await apiClient.put(`/api/assets/${assetId}/location`, { locationId });
    return response.data;
  }

  // Asset Performance & Analytics
  static async getAssetStats(params?: {
    type?: 'equipment' | 'machinery' | 'infrastructure' | 'vehicle';
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<AssetStats>> {
    const response = await apiClient.get('/api/assets/stats', { params });
    return response.data;
  }

  static async getAssetPerformanceReport(assetId: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/api/assets/${assetId}/performance`, { params });
    return response.data;
  }

  static async getMaintenanceCostReport(params?: {
    assetId?: string;
    type?: 'equipment' | 'machinery' | 'infrastructure' | 'vehicle';
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/api/assets/maintenance/cost-report', { params });
    return response.data;
  }

  static async getUtilizationReport(params?: {
    assetId?: string;
    type?: 'equipment' | 'machinery' | 'infrastructure' | 'vehicle';
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/api/assets/utilization-report', { params });
    return response.data;
  }

  static async getDepreciationReport(params?: {
    assetId?: string;
    year?: number;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.get('/api/assets/depreciation-report', { params });
    return response.data;
  }

  static async getDashboardSummary(): Promise<ApiResponse<{
    totalAssets: number;
    activeAssets: number;
    assetsInMaintenance: number;
    retiredAssets: number;
    totalValue: number;
    depreciatedValue: number;
    maintenanceCosts: number;
    upcomingMaintenance: any[];
    overdueMaintenanceCount: number;
    utilizationRate: number;
  }>> {
    const response = await apiClient.get('/api/assets/dashboard');
    return response.data;
  }

  // Asset Transfer & Assignment
  static async transferAsset(assetId: string, data: {
    newLocationId: string;
    transferDate: Date;
    reason?: string;
    transferredBy: string;
    notes?: string;
  }): Promise<ApiResponse<Asset>> {
    const response = await apiClient.post(`/api/assets/${assetId}/transfer`, data);
    return response.data;
  }

  static async assignAsset(assetId: string, data: {
    assignedTo: string;
    assignmentDate: Date;
    purpose?: string;
    expectedReturnDate?: Date;
    notes?: string;
  }): Promise<ApiResponse<Asset>> {
    const response = await apiClient.post(`/api/assets/${assetId}/assign`, data);
    return response.data;
  }

  static async returnAsset(assetId: string, data: {
    returnDate: Date;
    condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
    notes?: string;
  }): Promise<ApiResponse<Asset>> {
    const response = await apiClient.post(`/api/assets/${assetId}/return`, data);
    return response.data;
  }
}