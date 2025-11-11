import { ApiResponse } from '../../../shared/src/types/api.types';
import {
  CreateFarmRequest,
  Farm,
  FarmInvitation,
  FarmRole,
  FarmUser,
  InviteUserToFarmRequest,
  UpdateFarmRequest,
} from '../../../shared/src/types/farm.types';
import { apiClient } from './api';

export class FarmService {
  private static readonly BASE_URL = '/api/farms';
  /**
   * Get all farms for the current user
   */
  static async getUserFarms(): Promise<ApiResponse<FarmUser[]>> {
    return apiClient.get<FarmUser[]>(`${this.BASE_URL}/user`);
  }

  /**
   * Get a specific farm by ID
   */
  static async getFarm(id: string): Promise<ApiResponse<Farm>> {
    return apiClient.get<Farm>(`${this.BASE_URL}/${id}`);
  }

  /**
   * Create a new farm
   */
  static async createFarm(data: CreateFarmRequest): Promise<ApiResponse<Farm>> {
    return apiClient.post<Farm>(`${this.BASE_URL}`, data);
  }

  /**
   * Update a farm
   */
  static async updateFarm(id: string, data: UpdateFarmRequest): Promise<ApiResponse<Farm>> {
    return apiClient.put<Farm>(`${this.BASE_URL}/${id}`, data);
  }

  /**
   * Delete a farm
   */
  static async deleteFarm(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.BASE_URL}/${id}`);
  }

  /**
   * Get farm users
   * TODO: Implement on server - GET /api/farms/:farmId/users
   * For now, this will return 404 until server endpoint is added
   */
  static async getFarmUsers(farmId: string): Promise<ApiResponse<FarmUser[]>> {
    return apiClient.get<FarmUser[]>(`${this.BASE_URL}/${farmId}/users`);
  }

  /**
   * Invite user to farm
   * Routes to /api/invitations/farm/invitations (requires X-Farm-Id header)
   */
  static async inviteUserToFarm(
    farmId: string,
    data: InviteUserToFarmRequest,
  ): Promise<ApiResponse<FarmInvitation>> {
    // Set farm context in header for this request
    return apiClient.post<FarmInvitation>('/api/invitations/farm/invitations', data);
  }

  /**
   * Update farm user role
   * TODO: Implement on server - PUT /api/farms/:farmId/users/:userId
   * For now, this will return 404 until server endpoint is added
   */
  static async updateFarmUserRole(
    farmId: string,
    userId: string,
    role: FarmRole,
  ): Promise<ApiResponse<FarmUser>> {
    return apiClient.put<FarmUser>(`${this.BASE_URL}/${farmId}/users/${userId}`, { role });
  }

  /**
   * Remove user from farm
   * TODO: Implement on server - DELETE /api/farms/:farmId/users/:userId
   * For now, this will return 404 until server endpoint is added
   */
  static async removeUserFromFarm(farmId: string, userId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.BASE_URL}/${farmId}/users/${userId}`);
  }

  /**
   * Accept farm invitation
   * Routes to /api/invitations/invitation/:token/accept
   */
  static async acceptInvitation(token: string): Promise<ApiResponse<Farm>> {
    return apiClient.post<Farm>(`/api/invitations/invitation/${token}/accept`, {});
  }

  /**
   * Get pending invitations for current user
   * Routes to /api/invitations/user/invitations
   */
  static async getPendingInvitations(): Promise<ApiResponse<FarmInvitation[]>> {
    return apiClient.get<FarmInvitation[]>('/api/invitations/user/invitations');
  }

  /**
   * Get farm invitations (for farm owners/managers)
   * Routes to /api/invitations/farm/invitations
   */
  static async getFarmInvitations(): Promise<ApiResponse<FarmInvitation[]>> {
    return apiClient.get<FarmInvitation[]>('/api/invitations/farm/invitations');
  }

  /**
   * Cancel/delete a farm invitation
   * Routes to /api/invitations/farm/invitations/:invitationId
   */
  static async cancelInvitation(invitationId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/invitations/farm/invitations/${invitationId}`);
  }

  /**
   * Get invitation details by token (public, for preview)
   * Routes to /api/invitations/invitation/:token
   */
  static async getInvitationDetails(token: string): Promise<ApiResponse<FarmInvitation>> {
    return apiClient.get<FarmInvitation>(`/api/invitations/invitation/${token}`);
  }

  /**
   * Decline farm invitation
   * Routes to /api/invitations/invitation/:token/decline
   */
  static async declineInvitation(token: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/api/invitations/invitation/${token}/decline`, {});
  }
}
