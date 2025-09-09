import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import {
  User,
  UserResponse,
  CreateUserRequest,
  AdminCreateUserRequest,
  UpdateUserRequest,
  UserStats,
  AttendanceRecord,
  PayrollRecord,
  LeaveRequest,
  Role,
  Permission,
  UserRole,
  AttendanceStatus,
  PayrollStatus,
  LeaveStatus,
  LeaveType
} from '../../../shared/src/types/user.types';
import { UsersService } from '../services/users.service';

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: any) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  departments: () => [...userKeys.all, 'departments'] as const,
  roles: () => [...userKeys.all, 'roles'] as const,
  permissions: () => [...userKeys.all, 'permissions'] as const,
  attendance: (userId?: string, startDate?: Date, endDate?: Date) => 
    [...userKeys.all, 'attendance', { userId, startDate, endDate }] as const,
  payroll: (userId?: string, month?: number, year?: number) => 
    [...userKeys.all, 'payroll', { userId, month, year }] as const,
  leave: (userId?: string) => [...userKeys.all, 'leave', { userId }] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
};

// User Queries
export const useUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  role?: UserRole;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => UsersService.getUsers(params),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => UsersService.getUserById(id),
    enabled: !!id,
  });
};

// User Mutations
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => UsersService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    },
  });
};

export const useAdminCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminCreateUserRequest) => UsersService.adminCreateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      UsersService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.details() });
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UsersService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    },
  });
};

// Department Queries and Mutations
export const useDepartments = () => {
  return useQuery({
    queryKey: userKeys.departments(),
    queryFn: () => UsersService.getDepartments(),
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => UsersService.createDepartment(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.departments() });
      toast({
        title: 'Success',
        description: 'Department created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create department',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ oldName, newName }: { oldName: string; newName: string }) =>
      UsersService.updateDepartment(oldName, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.departments() });
      toast({
        title: 'Success',
        description: 'Department updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update department',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => UsersService.deleteDepartment(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.departments() });
      toast({
        title: 'Success',
        description: 'Department deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete department',
        variant: 'destructive',
      });
    },
  });
};

// Role Queries and Mutations
export const useRoles = () => {
  return useQuery({
    queryKey: userKeys.roles(),
    queryFn: () => UsersService.getRoles(),
  });
};

export const useRole = (id: string) => {
  return useQuery({
    queryKey: [...userKeys.roles(), id],
    queryFn: () => UsersService.getRoleById(id),
    enabled: !!id,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      displayName: string;
      description: string;
      permissions: string[];
    }) => UsersService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.roles() });
      toast({
        title: 'Success',
        description: 'Role created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create role',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: {
      displayName?: string;
      description?: string;
      permissions?: string[];
    }}) => UsersService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.roles() });
      toast({
        title: 'Success',
        description: 'Role updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UsersService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.roles() });
      toast({
        title: 'Success',
        description: 'Role deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete role',
        variant: 'destructive',
      });
    },
  });
};

export const usePermissions = () => {
  return useQuery({
    queryKey: userKeys.permissions(),
    queryFn: () => UsersService.getPermissions(),
  });
};

// Attendance Queries and Mutations
export const useAttendance = (userId: string, startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: userKeys.attendance(userId, startDate, endDate),
    queryFn: () => UsersService.getUserAttendance(userId, {
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    }),
    enabled: !!userId,
  });
};

export const useClockIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      location?: string;
      notes?: string;
    }) => UsersService.clockIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.attendance() });
      toast({
        title: 'Success',
        description: 'Clocked in successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to clock in',
        variant: 'destructive',
      });
    },
  });
};

export const useClockOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      notes?: string;
    }) => UsersService.clockOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.attendance() });
      toast({
        title: 'Success',
        description: 'Clocked out successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to clock out',
        variant: 'destructive',
      });
    },
  });
};

// Payroll Queries and Mutations
export const usePayroll = (userId?: string, month?: number, year?: number) => {
  return useQuery({
    queryKey: userKeys.payroll(userId, month, year),
    queryFn: () => userId ? UsersService.getUserPayroll(userId, { month, year }) : UsersService.getPayrollRecords(),
  });
};

export const useCreatePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      payPeriodStart: Date;
      payPeriodEnd: Date;
      baseSalary: number;
      overtime?: number;
      bonuses?: number;
      deductions?: number;
      taxDeductions?: number;
    }) => UsersService.createPayrollRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.payroll() });
      toast({
        title: 'Success',
        description: 'Payroll record created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create payroll record',
        variant: 'destructive',
      });
    },
  });
};

// Leave Queries and Mutations
export const useUserLeaveRequests = (userId: string) => {
  return useQuery({
    queryKey: userKeys.leave(userId),
    queryFn: () => UsersService.getUserLeaves(userId),
    enabled: !!userId,
  });
};

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      type: LeaveType;
      startDate: Date;
      endDate: Date;
      reason: string;
    }) => UsersService.createLeaveRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.leave() });
      toast({
        title: 'Success',
        description: 'Leave request submitted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit leave request',
        variant: 'destructive',
      });
    },
  });
};

// Statistics
export const useUserStats = () => {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => UsersService.getUserStats(),
  });
};

// User Profile Management
export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: (id: string) => UsersService.resetUserPassword(id),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Password reset successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      bio?: string;
      dateOfBirth?: Date;
      gender?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      emergencyContact?: string;
    }}) => UsersService.updateUserProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.details() });
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });
};

export const useUploadUserAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => 
      UsersService.uploadUserAvatar(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.details() });
      toast({
        title: 'Success',
        description: 'Avatar uploaded successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload avatar',
        variant: 'destructive',
      });
    },
  });
};