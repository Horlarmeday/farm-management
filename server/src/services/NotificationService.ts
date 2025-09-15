import {
  AlertSeverity,
  AlertStatus,
  AlertType,
  DeliveryChannel,
  NotificationStatus,
  NotificationType,
  Priority,
  TaskPriority,
  TaskStatus,
} from '../../../shared/src/types';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Alert } from '../entities/Alert';
import { Notification } from '../entities/Notification';
import { DeliveryStatus, NotificationLog } from '../entities/NotificationLog';
import { NotificationSubscription } from '../entities/NotificationSubscription';
import { NotificationTemplate, TemplateType } from '../entities/NotificationTemplate';
import { Reminder, ReminderStatus, ReminderType } from '../entities/Reminder';
import { Task } from '../entities/Task';
import { User } from '../entities/User';
import { NotFoundError } from '../utils/errors';

export class NotificationService {
  private notificationRepository: Repository<Notification>;
  private notificationTemplateRepository: Repository<NotificationTemplate>;
  private notificationLogRepository: Repository<NotificationLog>;
  private notificationSubscriptionRepository: Repository<NotificationSubscription>;
  private alertRepository: Repository<Alert>;
  private taskRepository: Repository<Task>;
  private reminderRepository: Repository<Reminder>;
  private userRepository: Repository<User>;

  constructor() {
    this.notificationRepository = AppDataSource.getRepository(Notification);
    this.notificationTemplateRepository = AppDataSource.getRepository(NotificationTemplate);
    this.notificationLogRepository = AppDataSource.getRepository(NotificationLog);
    this.notificationSubscriptionRepository = AppDataSource.getRepository(NotificationSubscription);
    this.alertRepository = AppDataSource.getRepository(Alert);
    this.taskRepository = AppDataSource.getRepository(Task);
    this.reminderRepository = AppDataSource.getRepository(Reminder);
    this.userRepository = AppDataSource.getRepository(User);
  }

  // Notification Management
  async createNotification(notificationData: {
    title: string;
    message: string;
    type: NotificationType;
    priority?: Priority;
    status?: NotificationStatus;
    category?: string;
    data?: Record<string, any>;
    actionUrl?: string;
    actionText?: string;
    actionRequired?: boolean;
    scheduledAt?: Date;
    expiresAt?: Date;
    isGlobal?: boolean;
    referenceId?: string;
    referenceType?: string;
    referenceUrl?: string;
    userId?: string;
    createdById: string;
    deliveryMethods?: DeliveryChannel[];
  }): Promise<Notification> {
    // Determine delivery methods based on priority and type
    const deliveryMethods =
      notificationData.deliveryMethods ||
      this.getDefaultDeliveryMethods(notificationData.type, notificationData.priority || 'medium');

    const notification = this.notificationRepository.create({
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      priority: notificationData.priority || 'medium',
      status: notificationData.status || NotificationStatus.PENDING,
      category: notificationData.category,
      data: notificationData.data,
      deliveryMethods,
      actionUrl: notificationData.actionUrl,
      actionText: notificationData.actionText,
      actionRequired: notificationData.actionRequired || false,
      scheduledAt: notificationData.scheduledAt,
      expiresAt: notificationData.expiresAt,
      isGlobal: notificationData.isGlobal || false,
      referenceId: notificationData.referenceId,
      referenceType: notificationData.referenceType,
      referenceUrl: notificationData.referenceUrl,
      userId: notificationData.userId,
      createdById: notificationData.createdById,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Log the notification creation for each delivery method
    for (const method of deliveryMethods) {
      await this.logNotification({
        notificationId: savedNotification.id,
        channel: method,
        recipient: notificationData.userId || 'global',
        status: DeliveryStatus.PENDING,
        userId: notificationData.createdById,
        metadata: {
          type: notificationData.type,
          priority: notificationData.priority,
          isGlobal: notificationData.isGlobal,
          referenceType: notificationData.referenceType,
          referenceId: notificationData.referenceId,
          actionRequired: notificationData.actionRequired,
        },
      });
    }

    return savedNotification;
  }

  // Helper method to determine default delivery methods based on notification type and priority
  private getDefaultDeliveryMethods(type: NotificationType, priority: Priority): DeliveryChannel[] {
    const baseMethods = [DeliveryChannel.IN_APP]; // Always include in-app

    // Add email for most notifications
    if (priority === 'high' || priority === 'urgent') {
      baseMethods.push(DeliveryChannel.EMAIL);
    }

    // Add SMS for urgent notifications
    if (priority === 'urgent') {
      baseMethods.push(DeliveryChannel.SMS);
    }

    // Add push notifications for mobile users
    if (priority === 'high' || priority === 'urgent') {
      baseMethods.push(DeliveryChannel.PUSH);
    }

    // Special cases for specific notification types
    switch (type) {
      case NotificationType.HEALTH_ALERT:
      case NotificationType.SYSTEM_ALERT:
        if (!baseMethods.includes(DeliveryChannel.EMAIL)) {
          baseMethods.push(DeliveryChannel.EMAIL);
        }
        if (!baseMethods.includes(DeliveryChannel.SMS)) {
          baseMethods.push(DeliveryChannel.SMS);
        }
        break;

      case NotificationType.VACCINATION_REMINDER:
      case NotificationType.FEEDING_REMINDER:
      case NotificationType.MAINTENANCE_REMINDER:
        if (!baseMethods.includes(DeliveryChannel.EMAIL)) {
          baseMethods.push(DeliveryChannel.EMAIL);
        }
        break;

      case NotificationType.PAYMENT_DUE:
      case NotificationType.TASK_ASSIGNMENT:
        if (!baseMethods.includes(DeliveryChannel.EMAIL)) {
          baseMethods.push(DeliveryChannel.EMAIL);
        }
        if (!baseMethods.includes(DeliveryChannel.PUSH)) {
          baseMethods.push(DeliveryChannel.PUSH);
        }
        break;
    }

    return baseMethods;
  }

  // Enhanced notification delivery method
  async deliverNotification(notificationId: string, method: DeliveryChannel): Promise<boolean> {
    const notification = await this.getNotificationById(notificationId);

    if (!notification.shouldSendEmail() && method === DeliveryChannel.EMAIL) {
      return false;
    }
    if (!notification.shouldSendSMS() && method === DeliveryChannel.SMS) {
      return false;
    }
    if (!notification.shouldSendPush() && method === DeliveryChannel.PUSH) {
      return false;
    }
    if (!notification.shouldSendInApp() && method === DeliveryChannel.IN_APP) {
      return false;
    }

    try {
      // Simulate delivery (replace with actual delivery logic)
      await this.simulateDelivery(notification, method);

      // Mark method as sent
      notification.markMethodSent(method);

      // Update status if all methods are sent
      if (notification.allMethodsSent()) {
        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date();
      }

      await this.notificationRepository.save(notification);

      // Update delivery log
      await this.updateDeliveryLog(notificationId, method, DeliveryStatus.SENT);

      return true;
    } catch (error) {
      console.error(`Failed to deliver notification ${notificationId} via ${method}:`, error);

      // Update delivery log with error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.updateDeliveryLog(notificationId, method, DeliveryStatus.FAILED, errorMessage);

      return false;
    }
  }

  // Simulate delivery for different channels (replace with actual implementations)
  private async simulateDelivery(
    notification: Notification,
    method: DeliveryChannel,
  ): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Simulate delivery success/failure based on method
    const successRate = {
      [DeliveryChannel.EMAIL]: 0.95,
      [DeliveryChannel.SMS]: 0.9,
      [DeliveryChannel.PUSH]: 0.85,
      [DeliveryChannel.IN_APP]: 0.99,
    };

    if (Math.random() > successRate[method]) {
      throw new Error(`Simulated delivery failure for ${method}`);
    }
  }

  // Update delivery log
  private async updateDeliveryLog(
    notificationId: string,
    method: DeliveryChannel,
    status: DeliveryStatus,
    errorMessage?: string,
  ): Promise<void> {
    const log = await this.notificationLogRepository.findOne({
      where: { notificationId, channel: method },
    });

    if (log) {
      log.status = status;
      log.sentAt = new Date();
      if (errorMessage) {
        log.errorMessage = errorMessage;
      }
      if (status === DeliveryStatus.SENT) {
        log.deliveredAt = new Date();
      }
      await this.notificationLogRepository.save(log);
    }
  }

  async getNotifications(filters?: {
    userId?: string;
    type?: NotificationType;
    status?: NotificationStatus;
    priority?: Priority;
    category?: string;
    isGlobal?: boolean;
    actionRequired?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Notification[]> {
    const query = this.notificationRepository.createQueryBuilder('notification');

    if (filters?.userId) {
      query.andWhere('notification.userId = :userId', { userId: filters.userId });
    }

    if (filters?.type) {
      query.andWhere('notification.type = :type', { type: filters.type });
    }

    if (filters?.status) {
      query.andWhere('notification.status = :status', { status: filters.status });
    }

    if (filters?.priority) {
      query.andWhere('notification.priority = :priority', { priority: filters.priority });
    }

    if (filters?.category) {
      query.andWhere('notification.category = :category', { category: filters.category });
    }

    if (filters?.isGlobal !== undefined) {
      query.andWhere('notification.isGlobal = :isGlobal', { isGlobal: filters.isGlobal });
    }

    if (filters?.actionRequired !== undefined) {
      query.andWhere('notification.actionRequired = :actionRequired', {
        actionRequired: filters.actionRequired,
      });
    }

    if (filters?.startDate) {
      query.andWhere('notification.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('notification.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return query.orderBy('notification.createdAt', 'DESC').getMany();
  }

  async getNotificationById(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user', 'createdBy', 'task'],
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    return notification;
  }

  async updateNotification(id: string, updates: Partial<Notification>): Promise<Notification> {
    const notification = await this.getNotificationById(id);
    Object.assign(notification, updates);
    return this.notificationRepository.save(notification);
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.getNotificationById(id);
    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();
    const savedNotification = await this.notificationRepository.save(notification);

    // Log the notification read
    await this.logNotification({
      notificationId: savedNotification.id,
      channel: DeliveryChannel.IN_APP,
      recipient: userId,
      status: DeliveryStatus.DELIVERED,
      userId: userId,
      metadata: {
        action: 'read',
        readAt: savedNotification.readAt,
      },
    });

    return savedNotification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, status: NotificationStatus.PENDING },
      { status: NotificationStatus.READ, readAt: new Date() },
    );
  }

  async deleteNotification(id: string): Promise<void> {
    const notification = await this.getNotificationById(id);
    await this.notificationRepository.remove(notification);
  }

  // Notification Templates
  async createNotificationTemplate(templateData: {
    name: string;
    notificationType: NotificationType;
    templateType: TemplateType;
    subject: string;
    content: string;
    variables?: Record<string, string>;
    isActive?: boolean;
    description?: string;
    createdById: string;
  }): Promise<NotificationTemplate> {
    const template = this.notificationTemplateRepository.create({
      name: templateData.name,
      notificationType: templateData.notificationType,
      templateType: templateData.templateType,
      subject: templateData.subject,
      content: templateData.content,
      variables: templateData.variables,
      isActive: templateData.isActive !== false,
      description: templateData.description,
      createdById: templateData.createdById,
    });

    return this.notificationTemplateRepository.save(template);
  }

  async getNotificationTemplates(filters?: {
    notificationType?: NotificationType;
    templateType?: string;
    isActive?: boolean;
  }): Promise<NotificationTemplate[]> {
    const query = this.notificationTemplateRepository.createQueryBuilder('template');

    if (filters?.notificationType) {
      query.andWhere('template.notificationType = :notificationType', {
        notificationType: filters.notificationType,
      });
    }

    if (filters?.templateType) {
      query.andWhere('template.templateType = :templateType', {
        templateType: filters.templateType,
      });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('template.isActive = :isActive', { isActive: filters.isActive });
    }

    return query.orderBy('template.createdAt', 'DESC').getMany();
  }

  async getNotificationTemplateById(id: string): Promise<NotificationTemplate> {
    const template = await this.notificationTemplateRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!template) {
      throw new NotFoundError('Notification template not found');
    }

    return template;
  }

  async updateNotificationTemplate(
    id: string,
    updates: Partial<NotificationTemplate>,
  ): Promise<NotificationTemplate> {
    const template = await this.getNotificationTemplateById(id);
    Object.assign(template, updates);
    return this.notificationTemplateRepository.save(template);
  }

  async deleteNotificationTemplate(id: string): Promise<void> {
    const template = await this.getNotificationTemplateById(id);
    await this.notificationTemplateRepository.remove(template);
  }

  // Alert Management
  async createAlert(alertData: {
    title: string;
    message: string;
    type: AlertType;
    severity?: AlertSeverity;
    status?: AlertStatus;
    category?: string;
    data?: Record<string, any>;
    source?: string;
    referenceId?: string;
    referenceType?: string;
    acknowledgedById?: string;
    resolvedById?: string;
    resolutionNotes?: string;
    isAutoResolved?: boolean;
    expiresAt?: Date;
  }): Promise<Alert> {
    const alert = this.alertRepository.create({
      title: alertData.title,
      message: alertData.message,
      type: alertData.type,
      severity: alertData.severity || AlertSeverity.LOW,
      status: alertData.status || AlertStatus.ACTIVE,
      category: alertData.category,
      data: alertData.data,
      source: alertData.source,
      referenceId: alertData.referenceId,
      referenceType: alertData.referenceType,
      acknowledgedById: alertData.acknowledgedById,
      resolvedById: alertData.resolvedById,
      resolutionNotes: alertData.resolutionNotes,
      isAutoResolved: alertData.isAutoResolved || false,
      expiresAt: alertData.expiresAt,
    });

    return this.alertRepository.save(alert);
  }

  async getAlerts(filters?: {
    type?: AlertType;
    severity?: AlertSeverity;
    status?: AlertStatus;
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Alert[]> {
    const query = this.alertRepository.createQueryBuilder('alert');

    if (filters?.type) {
      query.andWhere('alert.type = :type', { type: filters.type });
    }

    if (filters?.severity) {
      query.andWhere('alert.severity = :severity', { severity: filters.severity });
    }

    if (filters?.status) {
      query.andWhere('alert.status = :status', { status: filters.status });
    }

    if (filters?.category) {
      query.andWhere('alert.category = :category', { category: filters.category });
    }

    if (filters?.startDate) {
      query.andWhere('alert.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('alert.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return query.orderBy('alert.createdAt', 'DESC').getMany();
  }

  async getAlertById(id: string): Promise<Alert> {
    const alert = await this.alertRepository.findOne({
      where: { id },
      relations: ['acknowledgedBy', 'resolvedBy'],
    });

    if (!alert) {
      throw new NotFoundError('Alert not found');
    }

    return alert;
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert> {
    const alert = await this.getAlertById(id);
    Object.assign(alert, updates);
    return this.alertRepository.save(alert);
  }

  async acknowledgeAlert(id: string, acknowledgedById: string): Promise<Alert> {
    const alert = await this.getAlertById(id);
    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledgedAt = new Date();
    alert.acknowledgedById = acknowledgedById;
    return this.alertRepository.save(alert);
  }

  async resolveAlert(id: string, resolvedById: string, resolutionNotes?: string): Promise<Alert> {
    const alert = await this.getAlertById(id);
    alert.status = AlertStatus.RESOLVED;
    alert.resolvedAt = new Date();
    alert.resolvedById = resolvedById;
    alert.resolutionNotes = resolutionNotes;
    return this.alertRepository.save(alert);
  }

  // Task Management
  async createTask(taskData: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    type?: string;
    category?: string;
    dueDate?: Date;
    notes?: string;
    metadata?: Record<string, any>;
    isRecurring?: boolean;
    recurringPattern?: string;
    nextDueDate?: Date;
    estimatedDuration?: number;
    location?: string;
    referenceType?: string;
    referenceId?: string;
    taskNumber?: string;
    assignedUserId?: string;
    createdById: string;
  }): Promise<Task> {
    const task = this.taskRepository.create({
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || TaskStatus.PENDING,
      priority: taskData.priority || TaskPriority.MEDIUM,
      type: taskData.type || 'custom',
      category: taskData.category,
      dueDate: taskData.dueDate,
      notes: taskData.notes,
      metadata: taskData.metadata,
      isRecurring: taskData.isRecurring || false,
      recurringPattern: taskData.recurringPattern,
      nextDueDate: taskData.nextDueDate,
      estimatedDuration: taskData.estimatedDuration,
      location: taskData.location,
      referenceType: taskData.referenceType,
      referenceId: taskData.referenceId,
      taskNumber: taskData.taskNumber,
      assignedUserId: taskData.assignedUserId,
      createdById: taskData.createdById,
    });

    const savedTask = await this.taskRepository.save(task);

    // Create notification for task assignment
    if (taskData.assignedUserId) {
      await this.createNotification({
        title: `New Task Assigned: ${taskData.title}`,
        message: `You have been assigned a new task: ${taskData.title}`,
        type: NotificationType.TASK_ASSIGNMENT,
        userId: taskData.assignedUserId,
        referenceType: 'task',
        referenceId: savedTask.id,
        actionUrl: `/tasks/${savedTask.id}`,
        actionText: 'View Task',
        createdById: taskData.createdById,
      });
    }

    return savedTask;
  }

  async getTasks(filters?: {
    assignedUserId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    type?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Task[]> {
    const query = this.taskRepository.createQueryBuilder('task');

    if (filters?.assignedUserId) {
      query.andWhere('task.assignedUserId = :assignedUserId', {
        assignedUserId: filters.assignedUserId,
      });
    }

    if (filters?.status) {
      query.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters?.priority) {
      query.andWhere('task.priority = :priority', { priority: filters.priority });
    }

    if (filters?.type) {
      query.andWhere('task.type = :type', { type: filters.type });
    }

    if (filters?.category) {
      query.andWhere('task.category = :category', { category: filters.category });
    }

    if (filters?.startDate) {
      query.andWhere('task.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('task.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return query.orderBy('task.createdAt', 'DESC').getMany();
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedUser', 'createdBy', 'notifications', 'checklistItems'],
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const task = await this.getTaskById(id);
    Object.assign(task, updates);
    return this.taskRepository.save(task);
  }

  async startTask(id: string): Promise<Task> {
    const task = await this.getTaskById(id);
    task.status = TaskStatus.IN_PROGRESS;
    task.startedAt = new Date();
    return this.taskRepository.save(task);
  }

  async completeTask(
    id: string,
    completionNotes?: string,
    completionImages?: string[],
  ): Promise<Task> {
    const task = await this.getTaskById(id);
    task.status = TaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.completionNotes = completionNotes;
    task.completionImages = completionImages;
    return this.taskRepository.save(task);
  }

  // Reminder Management
  async createReminder(reminderData: {
    title: string;
    description?: string;
    type: ReminderType;
    reminderTime: Date;
    priority?: TaskPriority;
    status?: ReminderStatus;
    isRecurring?: boolean;
    recurringPattern?: string;
    nextReminderTime?: Date;
    referenceType?: string;
    referenceId?: string;
    userId: string;
    createdById: string;
  }): Promise<Reminder> {
    const reminder = this.reminderRepository.create({
      title: reminderData.title,
      description: reminderData.description,
      type: reminderData.type,
      reminderTime: reminderData.reminderTime,
      priority: reminderData.priority || TaskPriority.MEDIUM,
      status: reminderData.status || ReminderStatus.ACTIVE,
      isRecurring: reminderData.isRecurring || false,
      recurringPattern: reminderData.recurringPattern,
      nextReminderTime: reminderData.nextReminderTime,
      referenceType: reminderData.referenceType,
      referenceId: reminderData.referenceId,
      userId: reminderData.userId,
      createdById: reminderData.createdById,
    });

    return this.reminderRepository.save(reminder);
  }

  async getReminders(filters?: {
    userId?: string;
    type?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Reminder[]> {
    const query = this.reminderRepository.createQueryBuilder('reminder');

    if (filters?.userId) {
      query.andWhere('reminder.userId = :userId', { userId: filters.userId });
    }

    if (filters?.type) {
      query.andWhere('reminder.type = :type', { type: filters.type });
    }

    if (filters?.status) {
      query.andWhere('reminder.status = :status', { status: filters.status });
    }

    if (filters?.startDate) {
      query.andWhere('reminder.reminderTime >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('reminder.reminderTime <= :endDate', { endDate: filters.endDate });
    }

    return query.orderBy('reminder.reminderTime', 'ASC').getMany();
  }

  async getReminderById(id: string): Promise<Reminder> {
    const reminder = await this.reminderRepository.findOne({
      where: { id },
      relations: ['user', 'createdBy'],
    });

    if (!reminder) {
      throw new NotFoundError('Reminder not found');
    }

    return reminder;
  }

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder> {
    const reminder = await this.getReminderById(id);
    Object.assign(reminder, updates);
    return this.reminderRepository.save(reminder);
  }

  async markReminderAsCompleted(id: string): Promise<Reminder> {
    const reminder = await this.getReminderById(id);
    reminder.status = ReminderStatus.COMPLETED;
    reminder.completedAt = new Date();
    return this.reminderRepository.save(reminder);
  }

  async snoozeReminder(id: string, newReminderTime: Date): Promise<Reminder> {
    const reminder = await this.getReminderById(id);
    reminder.status = ReminderStatus.SNOOZED;
    reminder.reminderTime = newReminderTime;
    return this.reminderRepository.save(reminder);
  }

  // Utility methods
  async getDueReminders(): Promise<Reminder[]> {
    const now = new Date();
    const query = this.reminderRepository.createQueryBuilder('reminder');

    query
      .andWhere('reminder.status = :status', { status: ReminderStatus.ACTIVE })
      .andWhere('reminder.reminderTime <= :now', { now });

    return query.getMany();
  }

  async processDueReminders(): Promise<void> {
    const dueReminders = await this.getDueReminders();

    for (const reminder of dueReminders) {
      // Create notification for due reminder
      const notification = await this.createNotification({
        title: `Reminder: ${reminder.title}`,
        message: reminder.description || `Reminder for: ${reminder.title}`,
        type: NotificationType.VACCINATION_REMINDER,
        userId: reminder.userId,
        referenceType: 'reminder',
        referenceId: reminder.id,
        actionUrl: `/reminders/${reminder.id}`,
        actionText: 'View Reminder',
        createdById: reminder.createdById,
      });

      // Log the reminder notification
      await this.logNotification({
        notificationId: notification.id,
        channel: DeliveryChannel.IN_APP,
        recipient: reminder.userId,
        status: DeliveryStatus.SENT,
        userId: reminder.createdById,
        metadata: {
          reminderId: reminder.id,
          reminderType: reminder.type,
          reminderTime: reminder.reminderTime,
        },
      });

      // Update reminder status
      if (reminder.isRecurring && reminder.recurringPattern) {
        // Calculate next reminder time based on pattern
        const nextTime = this.calculateNextReminderTime(
          reminder.reminderTime,
          reminder.recurringPattern,
        );
        reminder.reminderTime = nextTime;
        reminder.nextReminderTime = nextTime;
      } else {
        reminder.status = ReminderStatus.COMPLETED;
        reminder.completedAt = new Date();
      }

      await this.reminderRepository.save(reminder);
    }
  }

  private calculateNextReminderTime(currentTime: Date, pattern: string): Date {
    const nextTime = new Date(currentTime);

    switch (pattern) {
      case 'daily':
        nextTime.setDate(nextTime.getDate() + 1);
        break;
      case 'weekly':
        nextTime.setDate(nextTime.getDate() + 7);
        break;
      case 'monthly':
        nextTime.setMonth(nextTime.getMonth() + 1);
        break;
      default:
        nextTime.setDate(nextTime.getDate() + 1); // Default to daily
    }

    return nextTime;
  }

  async getNotificationStats(userId?: string): Promise<{
    totalNotifications: number;
    unreadNotifications: number;
    totalAlerts: number;
    activeAlerts: number;
    totalTasks: number;
    pendingTasks: number;
    totalReminders: number;
    dueReminders: number;
  }> {
    const [
      totalNotifications,
      unreadNotifications,
      totalAlerts,
      activeAlerts,
      totalTasks,
      pendingTasks,
      totalReminders,
      dueReminders,
    ] = await Promise.all([
      this.notificationRepository.count({ where: userId ? { userId } : {} }),
      this.notificationRepository.count({
        where: userId
          ? { userId, status: NotificationStatus.PENDING }
          : { status: NotificationStatus.PENDING },
      }),
      this.alertRepository.count(),
      this.alertRepository.count({ where: { status: AlertStatus.ACTIVE } }),
      this.taskRepository.count({ where: userId ? { assignedUserId: userId } : {} }),
      this.taskRepository.count({
        where: userId
          ? { assignedUserId: userId, status: TaskStatus.PENDING }
          : { status: TaskStatus.PENDING },
      }),
      this.reminderRepository.count({ where: userId ? { userId } : {} }),
      this.getDueReminders().then((reminders) => reminders.length),
    ]);

    return {
      totalNotifications,
      unreadNotifications,
      totalAlerts,
      activeAlerts,
      totalTasks,
      pendingTasks,
      totalReminders,
      dueReminders,
    };
  }

  // Notification Logs
  async getNotificationLogs(filters?: {
    notificationId?: string;
    userId?: string;
    channel?: DeliveryChannel;
    status?: DeliveryStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<NotificationLog[]> {
    const query = this.notificationLogRepository.createQueryBuilder('log');

    if (filters?.notificationId) {
      query.andWhere('log.notificationId = :notificationId', {
        notificationId: filters.notificationId,
      });
    }

    if (filters?.userId) {
      query.andWhere('log.userId = :userId', { userId: filters.userId });
    }

    if (filters?.channel) {
      query.andWhere('log.channel = :channel', { channel: filters.channel });
    }

    if (filters?.status) {
      query.andWhere('log.status = :status', { status: filters.status });
    }

    if (filters?.startDate) {
      query.andWhere('log.sentAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('log.sentAt <= :endDate', { endDate: filters.endDate });
    }

    return query
      .leftJoinAndSelect('log.notification', 'notification')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.sentAt', 'DESC')
      .getMany();
  }

  async getNotificationLogById(id: string): Promise<NotificationLog> {
    const log = await this.notificationLogRepository.findOne({
      where: { id },
      relations: ['notification', 'user'],
    });

    if (!log) {
      throw new NotFoundError('Notification log not found');
    }

    return log;
  }

  async updateNotificationLogStatus(
    id: string,
    status: DeliveryStatus,
    errorMessage?: string,
  ): Promise<NotificationLog> {
    const log = await this.getNotificationLogById(id);
    log.status = status;
    log.attempts += 1;

    if (status === DeliveryStatus.DELIVERED) {
      log.deliveredAt = new Date();
    }

    if (errorMessage) {
      log.errorMessage = errorMessage;
    }

    return this.notificationLogRepository.save(log);
  }

  private async logNotification(logData: {
    notificationId: string;
    channel: DeliveryChannel;
    recipient: string;
    status: DeliveryStatus;
    userId?: string;
    errorMessage?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const log = this.notificationLogRepository.create({
      notificationId: logData.notificationId,
      channel: logData.channel,
      recipient: logData.recipient,
      status: logData.status,
      sentAt: new Date(),
      attempts: 1,
      errorMessage: logData.errorMessage,
      metadata: logData.metadata,
      userId: logData.userId,
    });

    await this.notificationLogRepository.save(log);
  }

  // User Preferences
  async updateUserPreferences(
    userId: string,
    preferences: {
      emailNotifications?: boolean;
      smsNotifications?: boolean;
      pushNotifications?: boolean;
      inAppNotifications?: boolean;
      quietHours?: { start: string; end: string };
    },
  ): Promise<void> {
    // Implementation for user preferences
    console.log('Updating user preferences for:', userId, preferences);
  }

  async getUserPreferences(userId: string): Promise<any> {
    // Implementation for getting user preferences
    return {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      inAppNotifications: true,
      quietHours: { start: '22:00', end: '07:00' },
    };
  }

  // Analytics
  async getDeliveryAnalytics(filters?: {
    startDate?: Date;
    endDate?: Date;
    method?: DeliveryChannel;
  }): Promise<any> {
    // Implementation for delivery analytics
    return {
      totalNotifications: 0,
      deliveredNotifications: 0,
      failedNotifications: 0,
      deliveryRate: 0,
      methodBreakdown: {
        email: { sent: 0, delivered: 0, failed: 0 },
        sms: { sent: 0, delivered: 0, failed: 0 },
        push: { sent: 0, delivered: 0, failed: 0 },
        in_app: { sent: 0, delivered: 0, failed: 0 },
      },
    };
  }

  // Push Notification Methods
  async subscribeToPush(userId: string, subscriptionData: any): Promise<any> {
    const { PushNotificationService } = await import('./push-notification.service');
    const pushService = new PushNotificationService();
    return pushService.subscribeUser(userId, subscriptionData);
  }

  async unsubscribeFromPush(userId: string, endpoint: string): Promise<void> {
    const { PushNotificationService } = await import('./push-notification.service');
    const pushService = new PushNotificationService();
    return pushService.unsubscribeUser(userId, endpoint);
  }

  async getPushSubscriptions(userId: string): Promise<any[]> {
    const { PushNotificationService } = await import('./push-notification.service');
    const pushService = new PushNotificationService();
    return pushService.getUserSubscriptions(userId);
  }

  async sendTestNotification(userId: string): Promise<void> {
    const { PushNotificationService } = await import('./push-notification.service');
    const pushService = new PushNotificationService();
    return pushService.sendNotificationToUser(userId, {
      title: 'Test Notification',
      body: 'This is a test notification from your farm management system.',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png'
    }, {
      farmId: '',
      userId,
      type: 'system',
      priority: 'medium'
    });
  }

  async getAlertRules(): Promise<any[]> {
    // Return alert rules from alert engine service
    // TODO: Implement proper service injection pattern
    // For now, return empty array - this would need to be implemented with proper DI
    return [];
  }
}
