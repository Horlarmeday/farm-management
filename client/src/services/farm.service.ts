import { apiClient } from './api';
import { ApiResponse, PaginatedResponse } from '../../../shared/src/types/api.types';
import {
  Farm,
  FarmUser,
  CreateFarmRequest,
  UpdateFarmRequest,
  InviteUserToFarmRequest,
  FarmInvitation,
  FarmRole
} from '../../../shared/src/types/farm.types';

export class FarmService {
  /**
   * Get all farms for the current user
   */
  static async getUserFarms(): Promise<ApiResponse<FarmUser[]>> {
    return apiClient.get<FarmUser[]>('/api/farms/user');
  }

  /**
   * Get a specific farm by ID
   */
  static async getFarm(id: string): Promise<ApiResponse<Farm>> {
    return apiClient.get<Farm>(`/api/farms/${id}`);
  }

  /**
   * Create a new farm
   */
  static async createFarm(data: CreateFarmRequest): Promise<ApiResponse<Farm>> {
    return apiClient.post<Farm>('/api/farms', data);
  }

  /**
   * Update a farm
   */
  static async updateFarm(id: string, data: UpdateFarmRequest): Promise<ApiResponse<Farm>> {
    return apiClient.put<Farm>(`/api/farms/${id}`, data);
  }

  /**
   * Delete a farm
   */
  static async deleteFarm(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/farms/${id}`);
  }

  /**
   * Get farm users
   */
  static async getFarmUsers(farmId: string): Promise<ApiResponse<FarmUser[]>> {
    return apiClient.get<FarmUser[]>(`/api/farms/${farmId}/users`);
  }

  /**
   * Invite user to farm
   */
  static async inviteUserToFarm(
    farmId: string,
    data: InviteUserToFarmRequest
  ): Promise<ApiResponse<FarmInvitation>> {
    return apiClient.post<FarmInvitation>(`/api/farms/${farmId}/invite`, data);
  }

  /**
   * Update farm user role
   */
  static async updateFarmUserRole(
    farmId: string,
    userId: string,
    role: FarmRole
  ): Promise<ApiResponse<FarmUser>> {
    return apiClient.put<FarmUser>(`/api/farms/${farmId}/users/${userId}`, { role });
  }

  /**
   * Remove user from farm
   */
  static async removeUserFromFarm(
    farmId: string,
    userId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/farms/${farmId}/users/${userId}`);
  }

  /**
   * Accept farm invitation
   */
  static async acceptInvitation(token: string): Promise<ApiResponse<Farm>> {
    return apiClient.post<Farm>('/api/farms/accept-invitation', { token });
  }

  /**
   * Get pending invitations for current user
   */
  static async getPendingInvitations(): Promise<ApiResponse<FarmInvitation[]>> {
    return apiClient.get<FarmInvitation[]>('/api/farms/invitations/pending');
  }
}