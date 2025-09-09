import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FarmService } from '@/services/farm.service';
import { queryKeys } from '@/lib/queryKeys';
import {
  Farm,
  FarmUser,
  CreateFarmRequest,
  UpdateFarmRequest,
  InviteUserToFarmRequest,
  FarmRole
} from '../../../shared/src/types/farm.types';

// Get user farms
export const useUserFarms = () => {
  return useQuery({
    queryKey: queryKeys.farms.userFarms(),
    queryFn: () => FarmService.getUserFarms(),
    select: (response) => response.data,
  });
};

// Get specific farm
export const useFarm = (id: string) => {
  return useQuery({
    queryKey: queryKeys.farms.detail(id),
    queryFn: () => FarmService.getFarm(id),
    select: (response) => response.data,
    enabled: !!id,
  });
};

// Create farm
export const useCreateFarm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateFarmRequest) => FarmService.createFarm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.farms.userFarms() });
    },
  });
};

// Update farm
export const useUpdateFarm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFarmRequest }) =>
      FarmService.updateFarm(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.farms.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.farms.userFarms() });
    },
  });
};

// Delete farm
export const useDeleteFarm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => FarmService.deleteFarm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.farms.userFarms() });
    },
  });
};

// Get farm users
export const useFarmUsers = (farmId: string) => {
  return useQuery({
    queryKey: queryKeys.farms.users(farmId),
    queryFn: () => FarmService.getFarmUsers(farmId),
    select: (response) => response.data,
    enabled: !!farmId,
  });
};

// Invite user to farm
export const useInviteUserToFarm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ farmId, data }: { farmId: string; data: InviteUserToFarmRequest }) =>
      FarmService.inviteUserToFarm(farmId, data),
    onSuccess: (_, { farmId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.farms.users(farmId) });
    },
  });
};

// Update farm user role
export const useUpdateFarmUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ farmId, userId, role }: { farmId: string; userId: string; role: FarmRole }) =>
      FarmService.updateFarmUserRole(farmId, userId, role),
    onSuccess: (_, { farmId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.farms.users(farmId) });
    },
  });
};

// Remove user from farm
export const useRemoveUserFromFarm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ farmId, userId }: { farmId: string; userId: string }) =>
      FarmService.removeUserFromFarm(farmId, userId),
    onSuccess: (_, { farmId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.farms.users(farmId) });
    },
  });
};

// Accept farm invitation
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (token: string) => FarmService.acceptInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.farms.userFarms() });
      queryClient.invalidateQueries({ queryKey: queryKeys.farms.pendingInvitations() });
    },
  });
};

// Get pending invitations
export const usePendingInvitations = () => {
  return useQuery({
    queryKey: queryKeys.farms.pendingInvitations(),
    queryFn: () => FarmService.getPendingInvitations(),
    select: (response) => response.data,
  });
};