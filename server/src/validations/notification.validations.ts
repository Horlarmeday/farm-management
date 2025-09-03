import Joi from 'joi';

export const notificationValidations = {
  // Common schemas
  uuidParam: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  // Notification Management
  createNotification: Joi.object({
    type: Joi.string()
      .valid(
        'VACCINATION_REMINDER',
        'FEEDING_REMINDER',
        'HEALTH_ALERT',
        'STOCK_ALERT',
        'MAINTENANCE_REMINDER',
        'HARVEST_REMINDER',
        'PAYMENT_DUE',
        'TASK_ASSIGNMENT',
        'SYSTEM_ALERT',
        'WEATHER_ALERT',
        'REPORT_GENERATED',
        'USER_REGISTRATION',
        'PASSWORD_RESET',
        'PAYROLL_GENERATED',
        'LEAVE_REQUEST',
        'LEAVE_RESPONSE',
        'CUSTOM',
      )
      .required(),
    title: Joi.string().required().max(255),
    message: Joi.string().required().max(1000),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    status: Joi.string().valid('pending', 'sent', 'delivered', 'failed', 'read').optional(),
    category: Joi.string().max(100).optional(),
    data: Joi.object().optional(),
    actionUrl: Joi.string().uri().max(255).optional(),
    actionText: Joi.string().max(100).optional(),
    actionRequired: Joi.boolean().default(false),
    scheduledAt: Joi.date().iso().optional(),
    expiresAt: Joi.date().iso().optional(),
    isGlobal: Joi.boolean().default(false),
    referenceId: Joi.string().uuid().optional(),
    referenceType: Joi.string().max(100).optional(),
    referenceUrl: Joi.string().uri().max(255).optional(),
    userId: Joi.string().uuid().optional(),
    deliveryMethods: Joi.array()
      .items(Joi.string().valid('email', 'sms', 'push', 'in_app'))
      .default(['in_app'])
      .optional(),
    createdById: Joi.string().uuid().required(),
  }),

  updateNotification: Joi.object({
    type: Joi.string().valid('ALERT', 'REMINDER', 'ANNOUNCEMENT', 'TASK', 'SYSTEM').optional(),
    title: Joi.string().optional().max(200),
    message: Joi.string().optional().max(1000),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    module: Joi.string()
      .valid(
        'POULTRY',
        'LIVESTOCK',
        'FISHERY',
        'ASSETS',
        'FINANCE',
        'INVENTORY',
        'USERS',
        'GENERAL',
      )
      .optional(),
    referenceId: Joi.string().uuid().optional(),
    scheduledFor: Joi.date().iso().optional(),
    expiresAt: Joi.date().iso().optional(),
    recipients: Joi.array().items(Joi.string().uuid()).optional(),
    channels: Joi.array()
      .items(Joi.string().valid('EMAIL', 'SMS', 'PUSH', 'IN_APP'))
      .optional(),
    metadata: Joi.object().optional(),
  }),

  getNotifications: Joi.object({
    type: Joi.string()
      .valid(
        'VACCINATION_REMINDER',
        'FEEDING_REMINDER',
        'HEALTH_ALERT',
        'STOCK_ALERT',
        'MAINTENANCE_REMINDER',
        'HARVEST_REMINDER',
        'PAYMENT_DUE',
        'TASK_ASSIGNMENT',
        'SYSTEM_ALERT',
        'WEATHER_ALERT',
        'REPORT_GENERATED',
        'USER_REGISTRATION',
        'PASSWORD_RESET',
        'PAYROLL_GENERATED',
        'LEAVE_REQUEST',
        'LEAVE_RESPONSE',
        'CUSTOM',
      )
      .optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    status: Joi.string().valid('pending', 'sent', 'delivered', 'failed', 'read').optional(),
    category: Joi.string().max(100).optional(),
    userId: Joi.string().uuid().optional(),
    isGlobal: Joi.boolean().optional(),
    actionRequired: Joi.boolean().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Enhanced notification validations
  deliverNotification: Joi.object({
    method: Joi.string().valid('email', 'sms', 'push', 'in_app').required(),
  }),

  getNotificationsByPriority: Joi.object({
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').required(),
  }),

  getActionRequiredNotifications: Joi.object({
    userId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Alert Management
  createAlert: Joi.object({
    title: Joi.string().required().max(255),
    message: Joi.string().required().max(1000),
    type: Joi.string()
      .valid('SYSTEM', 'HEALTH', 'SECURITY', 'MAINTENANCE', 'WEATHER', 'CUSTOM')
      .required(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
    status: Joi.string().valid('active', 'acknowledged', 'resolved').default('active'),
    category: Joi.string().max(100).optional(),
    data: Joi.object().optional(),
    source: Joi.string().max(100).optional(),
    referenceId: Joi.string().uuid().optional(),
    referenceType: Joi.string().max(100).optional(),
    acknowledgedById: Joi.string().uuid().optional(),
    resolvedById: Joi.string().uuid().optional(),
    resolutionNotes: Joi.string().max(500).optional(),
    isAutoResolved: Joi.boolean().default(false),
    expiresAt: Joi.date().iso().optional(),
  }),

  getAlerts: Joi.object({
    type: Joi.string()
      .valid('SYSTEM', 'HEALTH', 'SECURITY', 'MAINTENANCE', 'WEATHER', 'CUSTOM')
      .optional(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
    status: Joi.string().valid('active', 'acknowledged', 'resolved').optional(),
    category: Joi.string().max(100).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Task Management
  createTask: Joi.object({
    title: Joi.string().required().max(255),
    description: Joi.string().max(1000).optional(),
    status: Joi.string()
      .valid('pending', 'in_progress', 'completed', 'cancelled')
      .default('pending'),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    type: Joi.string().max(100).optional(),
    category: Joi.string().max(100).optional(),
    dueDate: Joi.date().iso().optional(),
    notes: Joi.string().max(500).optional(),
    metadata: Joi.object().optional(),
    isRecurring: Joi.boolean().default(false),
    recurringPattern: Joi.string().max(100).optional(),
    nextDueDate: Joi.date().iso().optional(),
    estimatedDuration: Joi.number().positive().optional(),
    location: Joi.string().max(255).optional(),
    referenceType: Joi.string().max(100).optional(),
    referenceId: Joi.string().uuid().optional(),
    taskNumber: Joi.string().max(50).optional(),
    assignedUserId: Joi.string().uuid().optional(),
  }),

  getTasks: Joi.object({
    assignedUserId: Joi.string().uuid().optional(),
    status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    type: Joi.string().max(100).optional(),
    category: Joi.string().max(100).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  updateTask: Joi.object({
    title: Joi.string().max(255).optional(),
    description: Joi.string().max(1000).optional(),
    status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    type: Joi.string().max(100).optional(),
    category: Joi.string().max(100).optional(),
    dueDate: Joi.date().iso().optional(),
    notes: Joi.string().max(500).optional(),
    metadata: Joi.object().optional(),
    isRecurring: Joi.boolean().optional(),
    recurringPattern: Joi.string().max(100).optional(),
    nextDueDate: Joi.date().iso().optional(),
    estimatedDuration: Joi.number().positive().optional(),
    location: Joi.string().max(255).optional(),
    referenceType: Joi.string().max(100).optional(),
    referenceId: Joi.string().uuid().optional(),
    taskNumber: Joi.string().max(50).optional(),
    assignedUserId: Joi.string().uuid().optional(),
  }),

  // Reminder Management
  createReminder: Joi.object({
    title: Joi.string().required().max(255),
    description: Joi.string().max(1000).optional(),
    type: Joi.string()
      .valid('VACCINATION', 'FEEDING', 'MAINTENANCE', 'HARVEST', 'PAYMENT', 'CUSTOM')
      .required(),
    reminderTime: Joi.date().iso().required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    status: Joi.string().valid('active', 'completed', 'snoozed', 'cancelled').default('active'),
    isRecurring: Joi.boolean().default(false),
    recurringPattern: Joi.string().max(100).optional(),
    nextReminderTime: Joi.date().iso().optional(),
    referenceType: Joi.string().max(100).optional(),
    referenceId: Joi.string().uuid().optional(),
    userId: Joi.string().uuid().required(),
  }),

  getReminders: Joi.object({
    userId: Joi.string().uuid().optional(),
    type: Joi.string()
      .valid('VACCINATION', 'FEEDING', 'MAINTENANCE', 'HARVEST', 'PAYMENT', 'CUSTOM')
      .optional(),
    status: Joi.string().valid('active', 'completed', 'snoozed', 'cancelled').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  getDueReminders: Joi.object({
    userId: Joi.string().uuid().optional(),
    type: Joi.string()
      .valid('VACCINATION', 'FEEDING', 'MAINTENANCE', 'HARVEST', 'PAYMENT', 'CUSTOM')
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  updateReminder: Joi.object({
    title: Joi.string().max(255).optional(),
    description: Joi.string().max(1000).optional(),
    type: Joi.string()
      .valid('VACCINATION', 'FEEDING', 'MAINTENANCE', 'HARVEST', 'PAYMENT', 'CUSTOM')
      .optional(),
    reminderTime: Joi.date().iso().optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    status: Joi.string().valid('active', 'completed', 'snoozed', 'cancelled').optional(),
    isRecurring: Joi.boolean().optional(),
    recurringPattern: Joi.string().max(100).optional(),
    nextReminderTime: Joi.date().iso().optional(),
    referenceType: Joi.string().max(100).optional(),
    referenceId: Joi.string().uuid().optional(),
    userId: Joi.string().uuid().optional(),
  }),

  // User Preferences
  updateUserPreferences: Joi.object({
    emailNotifications: Joi.boolean().optional(),
    smsNotifications: Joi.boolean().optional(),
    pushNotifications: Joi.boolean().optional(),
    inAppNotifications: Joi.boolean().optional(),
    quietHours: Joi.object({
      start: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
      end: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
    }).optional(),
  }),

  // Notification Templates
  createTemplate: Joi.object({
    name: Joi.string().required().max(100),
    type: Joi.string().valid('EMAIL', 'SMS', 'PUSH', 'IN_APP').required(),
    subject: Joi.string().optional().max(200),
    content: Joi.string().required().max(2000),
    variables: Joi.array().items(Joi.string()).optional(),
    isActive: Joi.boolean().default(true),
    description: Joi.string().optional().max(500),
  }),

  updateTemplate: Joi.object({
    name: Joi.string().optional().max(100),
    type: Joi.string().valid('EMAIL', 'SMS', 'PUSH', 'IN_APP').optional(),
    subject: Joi.string().optional().max(200),
    content: Joi.string().optional().max(2000),
    variables: Joi.array().items(Joi.string()).optional(),
    isActive: Joi.boolean().optional(),
    description: Joi.string().optional().max(500),
  }),

  getTemplates: Joi.object({
    type: Joi.string().valid('EMAIL', 'SMS', 'PUSH', 'IN_APP').optional(),
    isActive: Joi.boolean().optional(),
    search: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Notification Subscriptions
  createSubscription: Joi.object({
    userId: Joi.string().uuid().required(),
    notificationType: Joi.string()
      .valid('ALERT', 'REMINDER', 'ANNOUNCEMENT', 'TASK', 'SYSTEM')
      .required(),
    module: Joi.string()
      .valid(
        'POULTRY',
        'LIVESTOCK',
        'FISHERY',
        'ASSETS',
        'FINANCE',
        'INVENTORY',
        'USERS',
        'GENERAL',
      )
      .optional(),
    channels: Joi.array()
      .items(Joi.string().valid('EMAIL', 'SMS', 'PUSH', 'IN_APP'))
      .required(),
    isActive: Joi.boolean().default(true),
  }),

  updateSubscription: Joi.object({
    notificationType: Joi.string()
      .valid('ALERT', 'REMINDER', 'ANNOUNCEMENT', 'TASK', 'SYSTEM')
      .optional(),
    module: Joi.string()
      .valid(
        'POULTRY',
        'LIVESTOCK',
        'FISHERY',
        'ASSETS',
        'FINANCE',
        'INVENTORY',
        'USERS',
        'GENERAL',
      )
      .optional(),
    channels: Joi.array()
      .items(Joi.string().valid('EMAIL', 'SMS', 'PUSH', 'IN_APP'))
      .optional(),
    isActive: Joi.boolean().optional(),
  }),

  getSubscriptions: Joi.object({
    userId: Joi.string().uuid().optional(),
    notificationType: Joi.string()
      .valid('ALERT', 'REMINDER', 'ANNOUNCEMENT', 'TASK', 'SYSTEM')
      .optional(),
    module: Joi.string()
      .valid(
        'POULTRY',
        'LIVESTOCK',
        'FISHERY',
        'ASSETS',
        'FINANCE',
        'INVENTORY',
        'USERS',
        'GENERAL',
      )
      .optional(),
    isActive: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Notification Logs
  getNotificationLogs: Joi.object({
    notificationId: Joi.string().uuid().optional(),
    userId: Joi.string().uuid().optional(),
    status: Joi.string().valid('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED').optional(),
    channel: Joi.string().valid('EMAIL', 'SMS', 'PUSH', 'IN_APP').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Bulk Notifications
  sendBulkNotification: Joi.object({
    type: Joi.string().valid('ALERT', 'REMINDER', 'ANNOUNCEMENT', 'TASK', 'SYSTEM').required(),
    title: Joi.string().required().max(200),
    message: Joi.string().required().max(1000),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),

    // Additional schemas
    getDueReminders: Joi.object({
      userId: Joi.string().uuid().optional(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
    }),

    updateUserPreferences: Joi.object({
      emailNotifications: Joi.boolean().optional(),
      smsNotifications: Joi.boolean().optional(),
      pushNotifications: Joi.boolean().optional(),
      inAppNotifications: Joi.boolean().optional(),
      notificationTypes: Joi.array().items(Joi.string()).optional(),
      quietHours: Joi.object({
        start: Joi.string().optional(),
        end: Joi.string().optional(),
      }).optional(),
    }),

    getDeliveryAnalytics: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().required(),
      type: Joi.string().valid('NOTIFICATION', 'ALERT', 'REMINDER').optional(),
    }),
    module: Joi.string()
      .valid(
        'POULTRY',
        'LIVESTOCK',
        'FISHERY',
        'ASSETS',
        'FINANCE',
        'INVENTORY',
        'USERS',
        'GENERAL',
      )
      .optional(),
    recipients: Joi.array().items(Joi.string().uuid()).required(),
    channels: Joi.array()
      .items(Joi.string().valid('EMAIL', 'SMS', 'PUSH', 'IN_APP'))
      .default(['IN_APP']),
    scheduledFor: Joi.date().iso().optional(),
    metadata: Joi.object().optional(),
  }),

  // Scheduled Notifications
  scheduleNotification: Joi.object({
    type: Joi.string().valid('ALERT', 'REMINDER', 'ANNOUNCEMENT', 'TASK', 'SYSTEM').required(),
    title: Joi.string().required().max(200),
    message: Joi.string().required().max(1000),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
    module: Joi.string()
      .valid(
        'POULTRY',
        'LIVESTOCK',
        'FISHERY',
        'ASSETS',
        'FINANCE',
        'INVENTORY',
        'USERS',
        'GENERAL',
      )
      .optional(),
    scheduledFor: Joi.date().iso().required(),
    recipients: Joi.array().items(Joi.string().uuid()).optional(),
    channels: Joi.array()
      .items(Joi.string().valid('EMAIL', 'SMS', 'PUSH', 'IN_APP'))
      .default(['IN_APP']),
    repeatPattern: Joi.string().valid('ONCE', 'DAILY', 'WEEKLY', 'MONTHLY').default('ONCE'),
    metadata: Joi.object().optional(),
  }),

  getScheduledNotifications: Joi.object({
    type: Joi.string().valid('ALERT', 'REMINDER', 'ANNOUNCEMENT', 'TASK', 'SYSTEM').optional(),
    module: Joi.string()
      .valid(
        'POULTRY',
        'LIVESTOCK',
        'FISHERY',
        'ASSETS',
        'FINANCE',
        'INVENTORY',
        'USERS',
        'GENERAL',
      )
      .optional(),
    status: Joi.string().valid('SCHEDULED', 'EXECUTED', 'CANCELLED').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Notification Settings
  updateNotificationSettings: Joi.object({
    emailEnabled: Joi.boolean().optional(),
    smsEnabled: Joi.boolean().optional(),
    pushEnabled: Joi.boolean().optional(),
    inAppEnabled: Joi.boolean().optional(),
    quietHours: Joi.object({
      enabled: Joi.boolean().default(false),
      startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
      endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
    }).optional(),
    frequency: Joi.string().valid('IMMEDIATE', 'HOURLY', 'DAILY', 'WEEKLY').default('IMMEDIATE'),
  }),

  getNotificationSettings: Joi.object({
    userId: Joi.string().uuid().optional(),
  }),

  // Analytics
  getNotificationAnalytics: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    type: Joi.string()
      .valid(
        'VACCINATION_REMINDER',
        'FEEDING_REMINDER',
        'HEALTH_ALERT',
        'STOCK_ALERT',
        'MAINTENANCE_REMINDER',
        'HARVEST_REMINDER',
        'PAYMENT_DUE',
        'TASK_ASSIGNMENT',
        'SYSTEM_ALERT',
        'WEATHER_ALERT',
        'REPORT_GENERATED',
        'USER_REGISTRATION',
        'PASSWORD_RESET',
        'PAYROLL_GENERATED',
        'LEAVE_REQUEST',
        'LEAVE_RESPONSE',
        'CUSTOM',
      )
      .optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    category: Joi.string().max(100).optional(),
    userId: Joi.string().uuid().optional(),
  }),

  getNotificationAnalyticsByType: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    type: Joi.string()
      .valid(
        'VACCINATION_REMINDER',
        'FEEDING_REMINDER',
        'HEALTH_ALERT',
        'STOCK_ALERT',
        'MAINTENANCE_REMINDER',
        'HARVEST_REMINDER',
        'PAYMENT_DUE',
        'TASK_ASSIGNMENT',
        'SYSTEM_ALERT',
        'WEATHER_ALERT',
        'REPORT_GENERATED',
        'USER_REGISTRATION',
        'PASSWORD_RESET',
        'PAYROLL_GENERATED',
        'LEAVE_REQUEST',
        'LEAVE_RESPONSE',
        'CUSTOM',
      )
      .required(),
  }),

  getDeliveryAnalytics: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    channel: Joi.string().valid('EMAIL', 'SMS', 'PUSH', 'IN_APP').optional(),
    status: Joi.string().valid('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED').optional(),
    groupBy: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').default('DAILY'),
  }),

  // User Notifications
  getUserNotifications: Joi.object({
    status: Joi.string().valid('UNREAD', 'READ', 'ARCHIVED').optional(),
    type: Joi.string().valid('ALERT', 'REMINDER', 'ANNOUNCEMENT', 'TASK', 'SYSTEM').optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  markAsRead: Joi.object({
    notificationIds: Joi.array().items(Joi.string().uuid()).required(),
  }),

  markAllAsRead: Joi.object({
    type: Joi.string().valid('ALERT', 'REMINDER', 'ANNOUNCEMENT', 'TASK', 'SYSTEM').optional(),
    module: Joi.string()
      .valid(
        'POULTRY',
        'LIVESTOCK',
        'FISHERY',
        'ASSETS',
        'FINANCE',
        'INVENTORY',
        'USERS',
        'GENERAL',
      )
      .optional(),
  }),
};
