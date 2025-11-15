import { BaseEntity, Priority } from './common.types';
import { User } from './user.types';
export type NotificationMethod = 'email' | 'sms' | 'push' | 'in_app' | 'webhook';
export declare enum NotificationType {
    VACCINATION_REMINDER = "vaccination_reminder",
    FEEDING_REMINDER = "feeding_reminder",
    HEALTH_ALERT = "health_alert",
    STOCK_ALERT = "stock_alert",
    MAINTENANCE_REMINDER = "maintenance_reminder",
    HARVEST_REMINDER = "harvest_reminder",
    PAYMENT_DUE = "payment_due",
    TASK_ASSIGNMENT = "task_assignment",
    SYSTEM_ALERT = "system_alert",
    WEATHER_ALERT = "weather_alert",
    REPORT_GENERATED = "report_generated",
    USER_REGISTRATION = "user_registration",
    PASSWORD_RESET = "password_reset",
    PAYROLL_GENERATED = "payroll_generated",
    LEAVE_REQUEST = "leave_request",
    LEAVE_RESPONSE = "leave_response",
    CUSTOM = "custom"
}
export declare enum NotificationStatus {
    PENDING = "pending",
    SENT = "sent",
    DELIVERED = "delivered",
    FAILED = "failed",
    READ = "read"
}
export declare enum DeliveryStatus {
    PENDING = "pending",
    SENT = "sent",
    DELIVERED = "delivered",
    FAILED = "failed",
    BOUNCED = "bounced"
}
export declare enum DeliveryChannel {
    EMAIL = "email",
    SMS = "sms",
    PUSH = "push",
    IN_APP = "in_app"
}
export declare enum TaskStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    OVERDUE = "overdue"
}
export declare enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare enum AlertType {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    SUCCESS = "success"
}
export declare enum AlertSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum AlertStatus {
    ACTIVE = "active",
    ACKNOWLEDGED = "acknowledged",
    RESOLVED = "resolved",
    DISMISSED = "dismissed"
}
export interface Notification extends BaseEntity {
    title: string;
    message: string;
    type: NotificationType;
    priority: Priority;
    status: NotificationStatus;
    readAt?: Date;
    userId?: string;
    user?: User;
    roleId?: string;
    departmentId?: string;
    isGlobal: boolean;
    referenceType?: string;
    referenceId?: string;
    referenceUrl?: string;
    scheduledFor?: Date;
    expiresAt?: Date;
    methods: NotificationMethod[];
    emailSent?: boolean;
    smsSent?: boolean;
    pushSent?: boolean;
    data?: Record<string, any>;
    actionRequired?: boolean;
    actionUrl?: string;
    actionText?: string;
    sentAt?: Date;
    deliveredAt?: Date;
    clickedAt?: Date;
    createdBy?: User;
}
export interface NotificationTemplate extends BaseEntity {
    name: string;
    description?: string;
    type: NotificationType;
    subject: string;
    message: string;
    htmlContent?: string;
    methods: NotificationMethod[];
    priority: Priority;
    isActive: boolean;
    variables?: string[];
    defaultData?: Record<string, any>;
    conditions?: Record<string, any>;
    scheduleType?: 'immediate' | 'delayed' | 'recurring';
    delayMinutes?: number;
    recurringPattern?: string;
    createdBy: User;
}
export interface NotificationSubscription extends BaseEntity {
    userId: string;
    user: User;
    notificationType: NotificationType;
    methods: NotificationMethod[];
    isEnabled: boolean;
    frequency?: 'immediate' | 'daily' | 'weekly' | 'monthly';
    quietHours?: {
        start: string;
        end: string;
    };
    filters?: Record<string, any>;
}
export interface NotificationLog extends BaseEntity {
    notificationId: string;
    notification: Notification;
    method: NotificationMethod;
    status: NotificationStatus;
    attempts: number;
    lastAttempt?: Date;
    errorMessage?: string;
    providerId?: string;
    providerResponse?: string;
    deliveredAt?: Date;
    readAt?: Date;
    clickedAt?: Date;
    metadata?: Record<string, any>;
}
export interface Alert extends BaseEntity {
    alertId: string;
    title: string;
    message: string;
    type: AlertType;
    priority: Priority;
    status: AlertStatus;
    source: string;
    sourceId?: string;
    moduleType?: 'poultry' | 'livestock' | 'fishery' | 'inventory' | 'finance' | 'asset' | 'system';
    threshold?: number;
    currentValue?: number;
    triggeredAt: Date;
    acknowledgedAt?: Date;
    acknowledgedBy?: User;
    resolvedAt?: Date;
    resolvedBy?: User;
    suggestedActions?: string[];
    actionTaken?: string;
    escalationLevel?: number;
    escalatedAt?: Date;
    escalatedTo?: User;
    data?: Record<string, any>;
    notifications: Notification[];
}
export interface Task extends BaseEntity {
    taskNumber: string;
    title: string;
    description?: string;
    type: 'feeding' | 'vaccination' | 'maintenance' | 'harvest' | 'cleaning' | 'inspection' | 'treatment' | 'custom';
    priority: Priority;
    status: TaskStatus;
    assignedTo?: User;
    assignedBy: User;
    dueDate?: Date;
    startedAt?: Date;
    completedAt?: Date;
    estimatedDuration?: number;
    actualDuration?: number;
    location?: string;
    referenceType?: string;
    referenceId?: string;
    checklist?: TaskChecklistItem[];
    completionNotes?: string;
    completionImages?: string[];
    isRecurring?: boolean;
    recurringPattern?: string;
    nextDueDate?: Date;
    metadata?: Record<string, any>;
    notifications: Notification[];
}
export interface TaskChecklistItem extends BaseEntity {
    taskId: string;
    task: Task;
    description: string;
    isCompleted: boolean;
    completedAt?: Date;
    completedBy?: User;
    notes?: string;
    order: number;
}
export interface Reminder extends BaseEntity {
    reminderType: 'vaccination' | 'feeding' | 'medication' | 'harvest' | 'maintenance' | 'payment' | 'custom';
    title: string;
    message: string;
    targetDate: Date;
    advanceNotice: number;
    reminderFrequency?: 'once' | 'daily' | 'weekly' | 'monthly';
    referenceType?: string;
    referenceId?: string;
    isActive: boolean;
    lastTriggered?: Date;
    nextTrigger?: Date;
    assignedTo?: User;
    createdBy: User;
    data?: Record<string, any>;
}
export interface CreateNotificationRequest {
    title: string;
    message: string;
    type: NotificationType;
    priority: Priority;
    userId?: string;
    roleId?: string;
    departmentId?: string;
    isGlobal?: boolean;
    referenceType?: string;
    referenceId?: string;
    referenceUrl?: string;
    scheduledFor?: Date;
    expiresAt?: Date;
    methods: NotificationMethod[];
    data?: Record<string, any>;
    actionRequired?: boolean;
    actionUrl?: string;
    actionText?: string;
}
export interface UpdateNotificationRequest {
    title?: string;
    message?: string;
    priority?: Priority;
    status?: NotificationStatus;
    scheduledFor?: Date;
    expiresAt?: Date;
    methods?: NotificationMethod[];
    data?: Record<string, any>;
}
export interface CreateNotificationTemplateRequest {
    name: string;
    description?: string;
    type: NotificationType;
    subject: string;
    message: string;
    htmlContent?: string;
    methods: NotificationMethod[];
    priority: Priority;
    variables?: string[];
    defaultData?: Record<string, any>;
    conditions?: Record<string, any>;
    scheduleType?: 'immediate' | 'delayed' | 'recurring';
    delayMinutes?: number;
    recurringPattern?: string;
}
export interface UpdateNotificationTemplateRequest {
    name?: string;
    description?: string;
    subject?: string;
    message?: string;
    htmlContent?: string;
    methods?: NotificationMethod[];
    priority?: Priority;
    isActive?: boolean;
    variables?: string[];
    defaultData?: Record<string, any>;
    conditions?: Record<string, any>;
    scheduleType?: 'immediate' | 'delayed' | 'recurring';
    delayMinutes?: number;
    recurringPattern?: string;
}
export interface CreateTaskRequest {
    title: string;
    description?: string;
    type: 'feeding' | 'vaccination' | 'maintenance' | 'harvest' | 'cleaning' | 'inspection' | 'treatment' | 'custom';
    priority: Priority;
    assignedToId?: string;
    dueDate?: Date;
    estimatedDuration?: number;
    location?: string;
    referenceType?: string;
    referenceId?: string;
    checklist?: {
        description: string;
        order: number;
    }[];
    isRecurring?: boolean;
    recurringPattern?: string;
    metadata?: Record<string, any>;
}
export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    priority?: Priority;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
    assignedToId?: string;
    dueDate?: Date;
    estimatedDuration?: number;
    location?: string;
    completionNotes?: string;
    metadata?: Record<string, any>;
}
export interface CreateReminderRequest {
    reminderType: 'vaccination' | 'feeding' | 'medication' | 'harvest' | 'maintenance' | 'payment' | 'custom';
    title: string;
    message: string;
    targetDate: Date;
    advanceNotice: number;
    reminderFrequency?: 'once' | 'daily' | 'weekly' | 'monthly';
    referenceType?: string;
    referenceId?: string;
    assignedToId?: string;
    data?: Record<string, any>;
}
export interface UpdateReminderRequest {
    title?: string;
    message?: string;
    targetDate?: Date;
    advanceNotice?: number;
    reminderFrequency?: 'once' | 'daily' | 'weekly' | 'monthly';
    isActive?: boolean;
    assignedToId?: string;
    data?: Record<string, any>;
}
export interface CreateAlertRequest {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    priority: Priority;
    source: string;
    sourceId?: string;
    moduleType?: 'poultry' | 'livestock' | 'fishery' | 'inventory' | 'finance' | 'asset' | 'system';
    threshold?: number;
    currentValue?: number;
    suggestedActions?: string[];
    data?: Record<string, any>;
}
export interface UpdateAlertRequest {
    status?: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
    actionTaken?: string;
    escalationLevel?: number;
    escalatedToId?: string;
    data?: Record<string, any>;
}
export interface NotificationStats {
    totalNotifications: number;
    unreadNotifications: number;
    notificationsByType: Record<NotificationType, number>;
    notificationsByStatus: Record<NotificationStatus, number>;
    notificationsByPriority: Record<Priority, number>;
    deliveryStats: {
        emailDelivered: number;
        smsDelivered: number;
        pushDelivered: number;
        inAppDelivered: number;
    };
    engagementStats: {
        opened: number;
        clicked: number;
        actionTaken: number;
    };
    recentNotifications: Notification[];
}
export interface TaskStats {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    tasksByType: Record<string, number>;
    tasksByPriority: Record<Priority, number>;
    tasksByStatus: Record<string, number>;
    averageCompletionTime: number;
    taskCompletionRate: number;
    upcomingTasks: Task[];
}
export interface AlertStats {
    totalAlerts: number;
    activeAlerts: number;
    resolvedAlerts: number;
    alertsByType: Record<string, number>;
    alertsByPriority: Record<Priority, number>;
    alertsByModule: Record<string, number>;
    averageResolutionTime: number;
    escalatedAlerts: number;
    recentAlerts: Alert[];
}
//# sourceMappingURL=notification.types.d.ts.map