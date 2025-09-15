import { ApiResponse } from '../../../shared/src/types';
import { NextFunction, Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { ServiceFactory } from '../services/ServiceFactory';
import { BadRequestError } from '../utils/errors';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    const serviceFactory = ServiceFactory.getInstance();
    this.notificationService = serviceFactory.getNotificationService();
  }

  // Notification Management
  createNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notification = await this.notificationService.createNotification({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: notification,
      } as ApiResponse<typeof notification>);
    } catch (error) {
      next(error);
    }
  };

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        type,
        status,
        priority,
        category,
        userId,
        isGlobal,
        actionRequired,
        startDate,
        endDate,
      } = req.query;

      const notifications = await this.notificationService.getNotifications({
        type: type as any,
        status: status as any,
        priority: priority as any,
        category: category as string,
        userId: userId as string,
        isGlobal: isGlobal === 'true',
        actionRequired: actionRequired === 'true',
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        message: 'Notifications retrieved successfully',
        data: notifications,
      } as ApiResponse<typeof notifications>);
    } catch (error) {
      next(error);
    }
  };

  getNotificationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.getNotificationById(id);

      res.json({
        success: true,
        message: 'Notification retrieved successfully',
        data: notification,
      } as ApiResponse<typeof notification>);
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.markAsRead(id, req.user!.id);

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      } as ApiResponse<typeof notification>);
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.notificationService.markAllAsRead(req.user!.id);

      res.json({
        success: true,
        message: 'All notifications marked as read',
        data: null,
      } as ApiResponse<null>);
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.notificationService.deleteNotification(id);

      res.json({
        success: true,
        message: 'Notification deleted successfully',
        data: null,
      } as ApiResponse<null>);
    } catch (error) {
      next(error);
    }
  };

  // Enhanced notification delivery
  deliverNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { method } = req.body;

      if (!method) {
        throw new BadRequestError('Delivery method is required');
      }

      const success = await this.notificationService.deliverNotification(id, method);

      res.json({
        success: true,
        message: success ? 'Notification delivered successfully' : 'Notification delivery failed',
        data: { success, method },
      } as ApiResponse<{ success: boolean; method: string }>);
    } catch (error) {
      next(error);
    }
  };

  // Get notification delivery status
  getDeliveryStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.getNotificationById(id);

      const deliveryStatus = {
        notificationId: id,
        deliveryMethods: notification.deliveryMethods,
        emailSent: notification.emailSent,
        smsSent: notification.smsSent,
        pushSent: notification.pushSent,
        inAppSent: notification.inAppSent,
        allMethodsSent: notification.allMethodsSent(),
        status: notification.status,
        sentAt: notification.sentAt,
        deliveredAt: notification.deliveredAt,
        readAt: notification.readAt,
        clickedAt: notification.clickedAt,
      };

      res.json({
        success: true,
        message: 'Delivery status retrieved successfully',
        data: deliveryStatus,
      } as ApiResponse<typeof deliveryStatus>);
    } catch (error) {
      next(error);
    }
  };

  // Get notifications by priority
  getNotificationsByPriority = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { priority } = req.params;
      const { userId, startDate, endDate } = req.query;

      const notifications = await this.notificationService.getNotifications({
        priority: priority as any,
        userId: userId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        message: `Notifications with priority ${priority} retrieved successfully`,
        data: notifications,
      } as ApiResponse<typeof notifications>);
    } catch (error) {
      next(error);
    }
  };

  // Get action required notifications
  getActionRequiredNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = req.query;

      const notifications = await this.notificationService.getNotifications({
        userId: userId as string,
        actionRequired: true,
      });

      res.json({
        success: true,
        message: 'Action required notifications retrieved successfully',
        data: notifications,
      } as ApiResponse<typeof notifications>);
    } catch (error) {
      next(error);
    }
  };

  // Alert Management
  createAlert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alert = await this.notificationService.createAlert({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Alert created successfully',
        data: alert,
      } as ApiResponse<typeof alert>);
    } catch (error) {
      next(error);
    }
  };

  getAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, severity, status, category, startDate, endDate } = req.query;

      const alerts = await this.notificationService.getAlerts({
        type: type as any,
        severity: severity as any,
        status: status as any,
        category: category as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        message: 'Alerts retrieved successfully',
        data: alerts,
      } as ApiResponse<typeof alerts>);
    } catch (error) {
      next(error);
    }
  };

  getAlertById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const alert = await this.notificationService.getAlertById(id);

      res.json({
        success: true,
        message: 'Alert retrieved successfully',
        data: alert,
      } as ApiResponse<typeof alert>);
    } catch (error) {
      next(error);
    }
  };

  resolveAlert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const alert = await this.notificationService.resolveAlert(id, {
        ...req.body,
        resolvedById: req.user!.id,
      });

      res.json({
        success: true,
        message: 'Alert resolved successfully',
        data: alert,
      } as ApiResponse<typeof alert>);
    } catch (error) {
      next(error);
    }
  };

  // Task Management
  createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await this.notificationService.createTask({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      } as ApiResponse<typeof task>);
    } catch (error) {
      next(error);
    }
  };

  getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, priority, assignedUserId, type, category, startDate, endDate } = req.query;

      const tasks = await this.notificationService.getTasks({
        status: status as any,
        priority: priority as any,
        assignedUserId: assignedUserId as string,
        type: type as string,
        category: category as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        message: 'Tasks retrieved successfully',
        data: tasks,
      } as ApiResponse<typeof tasks>);
    } catch (error) {
      next(error);
    }
  };

  getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const task = await this.notificationService.getTaskById(id);

      res.json({
        success: true,
        message: 'Task retrieved successfully',
        data: task,
      } as ApiResponse<typeof task>);
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const task = await this.notificationService.updateTask(id, req.body);

      res.json({
        success: true,
        message: 'Task updated successfully',
        data: task,
      } as ApiResponse<typeof task>);
    } catch (error) {
      next(error);
    }
  };

  completeTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const task = await this.notificationService.completeTask(id, {
        ...req.body,
        completedById: req.user!.id,
      });

      res.json({
        success: true,
        message: 'Task completed successfully',
        data: task,
      } as ApiResponse<typeof task>);
    } catch (error) {
      next(error);
    }
  };

  // Reminder Management
  createReminder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reminder = await this.notificationService.createReminder({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Reminder created successfully',
        data: reminder,
      } as ApiResponse<typeof reminder>);
    } catch (error) {
      next(error);
    }
  };

  getReminders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, type, status, startDate, endDate } = req.query;

      const reminders = await this.notificationService.getReminders({
        userId: userId as string,
        type: type as string,
        status: status as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        message: 'Reminders retrieved successfully',
        data: reminders,
      } as ApiResponse<typeof reminders>);
    } catch (error) {
      next(error);
    }
  };

  getDueReminders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reminders = await this.notificationService.getDueReminders();

      res.json({
        success: true,
        message: 'Due reminders retrieved successfully',
        data: reminders,
      } as ApiResponse<typeof reminders>);
    } catch (error) {
      next(error);
    }
  };

  updateReminder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const reminder = await this.notificationService.updateReminder(id, req.body);

      res.json({
        success: true,
        message: 'Reminder updated successfully',
        data: reminder,
      } as ApiResponse<typeof reminder>);
    } catch (error) {
      next(error);
    }
  };

  // Notification Templates
  createTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const template = await this.notificationService.createNotificationTemplate({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Template created successfully',
        data: template,
      } as ApiResponse<typeof template>);
    } catch (error) {
      next(error);
    }
  };

  getTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { notificationType, templateType, isActive } = req.query;

      const templates = await this.notificationService.getNotificationTemplates({
        notificationType: notificationType as any,
        templateType: templateType as string,
        isActive: isActive === 'true',
      });

      res.json({
        success: true,
        message: 'Templates retrieved successfully',
        data: templates,
      } as ApiResponse<typeof templates>);
    } catch (error) {
      next(error);
    }
  };

  updateTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const template = await this.notificationService.updateNotificationTemplate(id, req.body);

      res.json({
        success: true,
        message: 'Template updated successfully',
        data: template,
      } as ApiResponse<typeof template>);
    } catch (error) {
      next(error);
    }
  };

  // Delivery Analytics
  getDeliveryAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, method } = req.query;

      const analytics = await this.notificationService.getDeliveryAnalytics({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        method: method as any,
      });

      res.json({
        success: true,
        message: 'Delivery analytics retrieved successfully',
        data: analytics,
      } as ApiResponse<typeof analytics>);
    } catch (error) {
      next(error);
    }
  };

  // Notification Preferences
  updateUserPreferences = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const preferences = await this.notificationService.updateUserPreferences(
        req.user!.id,
        req.body,
      );

      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: preferences,
      } as ApiResponse<typeof preferences>);
    } catch (error) {
      next(error);
    }
  };

  getUserPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const preferences = await this.notificationService.getUserPreferences(req.user!.id);

      res.json({
        success: true,
        message: 'User preferences retrieved successfully',
        data: preferences,
      } as ApiResponse<typeof preferences>);
    } catch (error) {
      next(error);
    }
  };

  // Push Notification Subscriptions
  subscribeToPush = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subscription = await this.notificationService.subscribeToPush(
        req.user!.id,
        req.body
      );

      res.status(201).json({
        success: true,
        message: 'Push notification subscription created successfully',
        data: subscription,
      } as ApiResponse<typeof subscription>);
    } catch (error) {
      next(error);
    }
  };

  unsubscribeFromPush = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.notificationService.unsubscribeFromPush(
        req.user!.id,
        req.body.endpoint
      );

      res.json({
        success: true,
        message: 'Push notification subscription removed successfully',
      } as ApiResponse<null>);
    } catch (error) {
      next(error);
    }
  };

  getPushSubscriptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subscriptions = await this.notificationService.getPushSubscriptions(req.user!.id);

      res.json({
        success: true,
        message: 'Push subscriptions retrieved successfully',
        data: subscriptions,
      } as ApiResponse<typeof subscriptions>);
    } catch (error) {
      next(error);
    }
  };

  sendTestNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.notificationService.sendTestNotification(req.user!.id);

      res.json({
        success: true,
        message: 'Test notification sent successfully',
      } as ApiResponse<null>);
    } catch (error) {
      next(error);
    }
  };

  getAlertRules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rules = await this.notificationService.getAlertRules();

      res.json({
        success: true,
        message: 'Alert rules retrieved successfully',
        data: rules,
      } as ApiResponse<typeof rules>);
    } catch (error) {
      next(error);
    }
  };
}
