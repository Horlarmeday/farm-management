import { apiClient } from './api';
import {
  Notification,
  NotificationTemplate,
  NotificationSubscription,
  NotificationLog,
  Alert,
  Task,
  Reminder,
  NotificationStats,
  TaskStats,
  AlertStats,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  CreateNotificationTemplateRequest,
  UpdateNotificationTemplateRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateReminderRequest,
  UpdateReminderRequest,
  CreateAlertRequest,
  UpdateAlertRequest,
  NotificationType,
  NotificationStatus,
} from '../../../shared/src/types/notification.types';
import { Priority } from '../../../shared/src/types/common.types';
import { ApiResponse, PaginatedResponse } from './api';

const prefix = '/api/notifications';

export class NotificationsService {
  // Notification Management
  static async getNotifications(params?: {
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
  }): Promise<PaginatedResponse<Notification>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get<Notification[]>(`${prefix}?${queryParams}`);
    return response as PaginatedResponse<Notification>;
  }

  static async getNotificationById(id: string): Promise<ApiResponse<Notification>> {
    return apiClient.get<Notification>(`${prefix}/${id}`);
  }

  static async createNotification(data: CreateNotificationRequest): Promise<ApiResponse<Notification>> {
    return apiClient.post<Notification>(`${prefix}`, data);
  }

  static async updateNotification(id: string, data: UpdateNotificationRequest): Promise<ApiResponse<Notification>> {
    return apiClient.put<Notification>(`${prefix}/${id}`, data);
  }

  static async deleteNotification(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${prefix}/${id}`);
  }

  static async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    return apiClient.patch<Notification>(`${prefix}/${id}/read`);
  }

  static async markAllAsRead(userId?: string): Promise<ApiResponse<void>> {
    const data = userId ? { userId } : {};
    return apiClient.patch(`${prefix}/mark-all-read`, data);
  }

  static async getUnreadCount(userId?: string): Promise<ApiResponse<{ count: number }>> {
    const params = userId ? `?userId=${userId}` : '';
    return apiClient.get<{ count: number }>(`${prefix}/unread-count${params}`);
  }

  // Notification Templates
  static async getNotificationTemplates(params?: {
    type?: NotificationType;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<NotificationTemplate>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get<NotificationTemplate[]>(`${prefix}/templates?${queryParams}`);
    return response as PaginatedResponse<NotificationTemplate>;
  }

  static async getNotificationTemplateById(id: string): Promise<ApiResponse<NotificationTemplate>> {
    return apiClient.get<NotificationTemplate>(`${prefix}/templates/${id}`);
  }

  static async createNotificationTemplate(data: CreateNotificationTemplateRequest): Promise<ApiResponse<NotificationTemplate>> {
    return apiClient.post<NotificationTemplate>(`${prefix}/templates`, data);
  }

  static async updateNotificationTemplate(id: string, data: UpdateNotificationTemplateRequest): Promise<ApiResponse<NotificationTemplate>> {
    return apiClient.put<NotificationTemplate>(`${prefix}/templates/${id}`, data);
  }

  static async deleteNotificationTemplate(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${prefix}/templates/${id}`);
  }

  // Notification Subscriptions
  static async getNotificationSubscriptions(userId?: string): Promise<ApiResponse<NotificationSubscription[]>> {
    const params = userId ? `?userId=${userId}` : '';
    return apiClient.get<NotificationSubscription[]>(`${prefix}/subscriptions${params}`);
  }

  static async updateNotificationSubscription(
    id: string,
    data: {
      methods?: string[];
      isEnabled?: boolean;
      frequency?: string;
      quietHours?: { start: string; end: string };
      filters?: Record<string, any>;
    }
  ): Promise<ApiResponse<NotificationSubscription>> {
    return apiClient.put<NotificationSubscription>(`${prefix}/subscriptions/${id}`, data);
  }

  // Notification Logs
  static async getNotificationLogs(params?: {
    notificationId?: string;
    method?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<NotificationLog>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get<NotificationLog[]>(`${prefix}/logs?${queryParams}`);
    return response as PaginatedResponse<NotificationLog>;
  }

  // Alerts Management
  static async getAlerts(params?: {
    type?: string;
    priority?: Priority;
    status?: string;
    moduleType?: string;
    source?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Alert>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get<Alert[]>(`/alerts?${queryParams}`);
    return response as PaginatedResponse<Alert>;
  }

  static async getAlertById(id: string): Promise<ApiResponse<Alert>> {
    return apiClient.get<Alert>(`/alerts/${id}`);
  }

  static async createAlert(data: CreateAlertRequest): Promise<ApiResponse<Alert>> {
    return apiClient.post<Alert>('/alerts', data);
  }

  static async updateAlert(id: string, data: UpdateAlertRequest): Promise<ApiResponse<Alert>> {
    return apiClient.put<Alert>(`/alerts/${id}`, data);
  }

  static async deleteAlert(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/alerts/${id}`);
  }

  static async acknowledgeAlert(id: string): Promise<ApiResponse<Alert>> {
    return apiClient.patch<Alert>(`/alerts/${id}/acknowledge`);
  }

  static async resolveAlert(id: string, actionTaken?: string): Promise<ApiResponse<Alert>> {
    const data = actionTaken ? { actionTaken } : {};
    return apiClient.patch<Alert>(`/alerts/${id}/resolve`, data);
  }

  // Tasks Management
  static async getTasks(params?: {
    type?: string;
    priority?: Priority;
    status?: string;
    assignedToId?: string;
    dueDate?: Date;
    isOverdue?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Task>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get<Task[]>(`/tasks?${queryParams}`);
    return response as PaginatedResponse<Task>;
  }

  static async getTaskById(id: string): Promise<ApiResponse<Task>> {
    return apiClient.get<Task>(`/tasks/${id}`);
  }

  static async createTask(data: CreateTaskRequest): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>('/tasks', data);
  }

  static async updateTask(id: string, data: UpdateTaskRequest): Promise<ApiResponse<Task>> {
    return apiClient.put<Task>(`/tasks/${id}`, data);
  }

  static async deleteTask(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/tasks/${id}`);
  }

  static async completeTask(id: string, completionNotes?: string): Promise<ApiResponse<Task>> {
    const data = { status: 'completed', completionNotes };
    return apiClient.patch<Task>(`/tasks/${id}/complete`, data);
  }

  static async startTask(id: string): Promise<ApiResponse<Task>> {
    return apiClient.patch<Task>(`/tasks/${id}/start`);
  }

  // Reminders Management
  static async getReminders(params?: {
    type?: string;
    isActive?: boolean;
    assignedToId?: string;
    targetDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Reminder>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get<Reminder[]>(`/reminders?${queryParams}`);
    return response as PaginatedResponse<Reminder>;
  }

  static async getReminderById(id: string): Promise<ApiResponse<Reminder>> {
    return apiClient.get<Reminder>(`/reminders/${id}`);
  }

  static async createReminder(data: CreateReminderRequest): Promise<ApiResponse<Reminder>> {
    return apiClient.post<Reminder>('/reminders', data);
  }

  static async updateReminder(id: string, data: UpdateReminderRequest): Promise<ApiResponse<Reminder>> {
    return apiClient.put<Reminder>(`/reminders/${id}`, data);
  }

  static async deleteReminder(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/reminders/${id}`);
  }

  // Analytics and Statistics
  static async getNotificationStats(params?: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ApiResponse<NotificationStats>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get<NotificationStats>(`/notifications/stats?${queryParams}`);
  }

  static async getTaskStats(params?: {
    assignedToId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ApiResponse<TaskStats>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get<TaskStats>(`/tasks/stats?${queryParams}`);
  }

  static async getAlertStats(params?: {
    moduleType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ApiResponse<AlertStats>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get<AlertStats>(`/alerts/stats?${queryParams}`);
  }

  // Bulk Operations
  static async bulkDeleteNotifications(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.request('/notifications/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  static async bulkMarkAsRead(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.patch('/notifications/bulk/read', { ids });
  }

  static async bulkDeleteTasks(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.request('/tasks/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  static async bulkDeleteAlerts(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.request('/alerts/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Search and Filtering
  static async searchNotifications(query: string, filters?: {
    type?: NotificationType;
    status?: NotificationStatus;
    priority?: Priority;
  }): Promise<ApiResponse<Notification[]>> {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    return apiClient.get<Notification[]>(`/notifications/search?${params}`);
  }

  static async searchTasks(query: string, filters?: {
    type?: string;
    status?: string;
    priority?: Priority;
  }): Promise<ApiResponse<Task[]>> {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    return apiClient.get<Task[]>(`/tasks/search?${params}`);
  }

  static async searchAlerts(query: string, filters?: {
    type?: string;
    status?: string;
    priority?: Priority;
  }): Promise<ApiResponse<Alert[]>> {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    return apiClient.get<Alert[]>(`/alerts/search?${params}`);
  }

  // Utility Methods
  static async testNotification(data: {
    type: NotificationType;
    title: string;
    message: string;
    userId: string;
    methods: string[];
  }): Promise<ApiResponse<void>> {
    return apiClient.post('/notifications/test', data);
  }

  static async getNotificationPreview(templateId: string, data: Record<string, any>): Promise<ApiResponse<{
    subject: string;
    message: string;
    htmlContent?: string;
  }>> {
    return apiClient.post(`/notifications/templates/${templateId}/preview`, { data });
  }

  static async exportNotifications(params?: {
    type?: NotificationType;
    status?: NotificationStatus;
    startDate?: Date;
    endDate?: Date;
    format?: 'csv' | 'excel' | 'pdf';
  }): Promise<ApiResponse<{ downloadUrl: string }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get<{ downloadUrl: string }>(`/notifications/export?${queryParams}`);
  }
}

export default NotificationsService;