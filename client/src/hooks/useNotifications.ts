import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationsService } from '../services/notifications.service';
import { queryKeys } from '../lib/queryKeys';
import type {
  Notification,
  NotificationTemplate,
  NotificationSubscription,
  NotificationStats,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  CreateNotificationTemplateRequest,
  UpdateNotificationTemplateRequest,
  NotificationType,
  NotificationStatus,
} from '../../../shared/src/types/notification.types';
import type { Priority } from '../../../shared/src/types/common.types';

// Notifications
export const useNotifications = (params?: {
  type?: NotificationType;
  status?: NotificationStatus;
  priority?: Priority;
  category?: string;
  userId?: string;
  isGlobal?: boolean;
  actionRequired?: boolean;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.notifications.lists(),
    queryFn: () => NotificationsService.getNotifications(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useNotification = (id: string) => {
  return useQuery({
    queryKey: ['notifications', 'detail', id],
    queryFn: () => NotificationsService.getNotificationById(id),
    enabled: !!id,
  });
};

export const useUnreadNotificationCount = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.notifications.count(),
    queryFn: () => NotificationsService.getUnreadCount(userId),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // 1 minute
  });
};

// Notification Templates
export const useNotificationTemplates = (params?: {
  type?: NotificationType;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['notifications', 'templates', { params }],
    queryFn: () => NotificationsService.getNotificationTemplates(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useNotificationTemplate = (id: string) => {
  return useQuery({
    queryKey: ['notifications', 'template', id],
    queryFn: () => NotificationsService.getNotificationTemplateById(id),
    enabled: !!id,
  });
};

// Notification Subscriptions
export const useNotificationSubscriptions = (userId?: string) => {
  return useQuery({
    queryKey: ['notifications', 'subscriptions', { userId }],
    queryFn: () => NotificationsService.getNotificationSubscriptions(userId),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Notification Stats
export const useNotificationStats = (params?: {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  return useQuery({
    queryKey: ['notifications', 'stats', { params }],
    queryFn: () => NotificationsService.getNotificationStats(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Mutations
export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateNotificationRequest) => 
      NotificationsService.createNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNotificationRequest }) => 
      NotificationsService.updateNotification(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => NotificationsService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => NotificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.count() });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId?: string) => NotificationsService.markAllAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.count() });
    },
  });
};

export const useBulkDeleteNotifications = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => NotificationsService.bulkDeleteNotifications(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

// Template Mutations
export const useCreateNotificationTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateNotificationTemplateRequest) => 
      NotificationsService.createNotificationTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'templates'] });
    },
  });
};

export const useUpdateNotificationTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNotificationTemplateRequest }) => 
      NotificationsService.updateNotificationTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'templates'] });
    },
  });
};

export const useDeleteNotificationTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => NotificationsService.deleteNotificationTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'templates'] });
    },
  });
};

// Subscription Mutations
export const useUpdateNotificationSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: {
        methods?: string[];
        isEnabled?: boolean;
        frequency?: string;
        quietHours?: { start: string; end: string };
        filters?: Record<string, any>;
      }
    }) => NotificationsService.updateNotificationSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'subscriptions'] });
    },
  });
};

// Testing and Preview
export const useTestNotification = () => {
  return useMutation({
    mutationFn: (data: {
      type: NotificationType;
      title: string;
      message: string;
      userId: string;
      methods: string[];
    }) => NotificationsService.testNotification(data),
  });
};