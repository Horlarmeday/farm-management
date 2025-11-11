import webpush from 'web-push';
import { AppDataSource } from '../config/database';
import { PushSubscription } from '../entities/PushSubscription';
import { NotificationPreference } from '../entities/NotificationPreference';
import { User } from '../entities/User';
import { config } from '../config';
import { ErrorHandler, ValidationError, DatabaseError } from '../utils/error-handler';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface NotificationContext {
  farmId: string;
  userId: string;
  type: 'weather' | 'livestock' | 'crop' | 'equipment' | 'financial' | 'iot_sensor' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
}

class PushNotificationService {
  private vapidKeys: {
    publicKey: string;
    privateKey: string;
  };

  constructor() {
    this.vapidKeys = {
      publicKey: config.notifications.vapid.publicKey,
      privateKey: config.notifications.vapid.privateKey,
      subject: config.notifications.vapid.subject
    };

    // Check if VAPID keys are configured (allow valid test keys)
    if (!this.vapidKeys.publicKey || !this.vapidKeys.privateKey) {
      console.warn('⚠️ VAPID keys not configured. Push notifications will be disabled.');
      this.isEnabled = false;
      return;
    }

    try {
      webpush.setVapidDetails(
        this.vapidKeys.subject,
        this.vapidKeys.publicKey,
        this.vapidKeys.privateKey
      );
      this.isEnabled = true;
      console.log('✅ Push notification service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize push notification service:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Retrieves the VAPID public key for web push notifications
   * @returns The VAPID public key string or null if not configured
   */
  public getVapidPublicKey(): string | null {
    return this.vapidKeys?.publicKey || null;
  }

  /**
   * Subscribes a user to push notifications
   * @param userId - The unique identifier of the user
   * @param subscription - The push subscription object from the browser
   * @param preferences - Optional notification preferences for the user
   */
  public async subscribeUser(
    userId: string,
    subscription: any
  ): Promise<PushSubscription> {
    if (!this.vapidKeys) {
      throw new Error('Push notifications are not configured. VAPID keys are missing.');
    }
    
    return ErrorHandler.handleDatabaseOperation(async () => {
      const pushSubscriptionRepo = AppDataSource.getRepository(PushSubscription);
      
      // Check if subscription already exists by finding all user subscriptions and filtering by endpoint
      const existingSubscriptions = await pushSubscriptionRepo.find({
        where: { userId }
      });
      
      const existingSubscription = existingSubscriptions.find(sub => 
        sub.subscription.endpoint === subscription.endpoint
      );

      if (existingSubscription) {
        // Update existing subscription
        existingSubscription.subscription = subscription;
        existingSubscription.active = true;
        existingSubscription.updatedAt = new Date();
        return await pushSubscriptionRepo.save(existingSubscription);
      }

      // Create new subscription
      const newSubscription = pushSubscriptionRepo.create({
        userId,
        subscription: subscription,
        active: true
      });

      return await pushSubscriptionRepo.save(newSubscription);
    }, 'PushNotificationService.subscribeUser');
  }

  /**
   * Unsubscribes a user from push notifications
   * @param userId - The unique identifier of the user
   * @param endpoint - The subscription endpoint to remove
   */
  public async unsubscribeUser(userId: string, endpoint: string): Promise<void> {
    return ErrorHandler.handleDatabaseOperation(async () => {
      const pushSubscriptionRepo = AppDataSource.getRepository(PushSubscription);
      
      // Find subscriptions by userId and then filter by endpoint
      const subscriptions = await pushSubscriptionRepo.find({
        where: { userId, active: true }
      });
      
      const targetSubscription = subscriptions.find(sub => 
        sub.subscription.endpoint === endpoint
      );
      
      if (targetSubscription) {
        await pushSubscriptionRepo.update(
          { id: targetSubscription.id },
          { active: false, updatedAt: new Date() }
        );
      }
    }, 'PushNotificationService.unsubscribeUser');
  }

  /**
   * Sends a push notification to a specific user
   * @param userId - The unique identifier of the user
   * @param payload - The notification payload containing title, body, and other data
   * @param context - The notification context with farm and type information
   */
  public async sendNotificationToUser(
    userId: string,
    payload: PushNotificationPayload,
    context: NotificationContext
  ): Promise<void> {
    if (!this.vapidKeys) {
      ErrorHandler.logError(new Error('Push notifications are disabled. VAPID keys not configured.'), 'PUSH_NOTIFICATION');
      return;
    }
    
    return ErrorHandler.handleDatabaseOperation(async () => {
      // Check user notification preferences
      const shouldSend = await this.checkNotificationPreferences(userId, context);
      if (!shouldSend) {
        ErrorHandler.logError(new Error(`Notification blocked by user preferences for user ${userId}`), 'PUSH_NOTIFICATION');
        return;
      }

      // Get user's active push subscriptions
      const pushSubscriptionRepo = AppDataSource.getRepository(PushSubscription);
      const subscriptions = await pushSubscriptionRepo.find({
        where: {
          userId,
          active: true
        }
      });

      if (subscriptions.length === 0) {
        ErrorHandler.logError(new Error(`No active push subscriptions found for user ${userId}`), 'PUSH_NOTIFICATION');
        return;
      }

      // Send notification to all user's devices
      const sendPromises = subscriptions.map(subscription => 
        this.sendPushNotification(subscription, payload)
      );

      await Promise.allSettled(sendPromises);
    }, 'sendNotificationToUser');
  }

  /**
   * Sends a push notification to all users of a specific farm
   * @param farmId - The unique identifier of the farm
   * @param payload - The notification payload containing title, body, and other data
   * @param context - The notification context with farm and type information
   */
  public async sendNotificationToFarm(
    farmId: string,
    payload: PushNotificationPayload,
    context: NotificationContext
  ): Promise<void> {
    return ErrorHandler.handleDatabaseOperation(async () => {
      // Get all users in the farm
      const userRepo = AppDataSource.getRepository(User);
      const users = await userRepo
        .createQueryBuilder('user')
        .innerJoin('user.farmUsers', 'farmUser')
        .innerJoin('farmUser.farm', 'farm')
        .where('farm.id = :farmId', { farmId })
        .getMany();

      // Send notification to each user
      const sendPromises = users.map(user => 
        this.sendNotificationToUser(user.id, payload, {
          ...context,
          userId: user.id
        })
      );

      await Promise.allSettled(sendPromises);
    }, 'sendNotificationToFarm');
  }

  /**
   * Sends a critical alert notification to multiple users
   * Critical alerts bypass user preferences and are always sent
   * @param userIds - Array of user IDs to send the alert to
   * @param payload - The notification payload containing title, body, and other data
   * @param context - The notification context with farm and type information
   */
  public async sendCriticalAlert(
    userIds: string[],
    payload: PushNotificationPayload,
    context: NotificationContext
  ): Promise<void> {
    return ErrorHandler.handleDatabaseOperation(async () => {
      const pushSubscriptionRepo = AppDataSource.getRepository(PushSubscription);
      
      // Get all active subscriptions for the users
      const subscriptions = await pushSubscriptionRepo.find({
        where: {
          userId: userIds.length === 1 ? userIds[0] : undefined,
          active: true
        }
      });

      // Filter subscriptions for multiple users if needed
      const filteredSubscriptions = userIds.length > 1 
        ? subscriptions.filter(sub => userIds.includes(sub.userId))
        : subscriptions;

      // Send critical alert with high priority
      const criticalPayload = {
        ...payload,
        requireInteraction: true,
        tag: 'critical-alert',
        data: {
          ...payload.data,
          priority: 'critical',
          timestamp: new Date().toISOString()
        }
      };

      const sendPromises = filteredSubscriptions.map(subscription => 
        this.sendPushNotification(subscription, criticalPayload)
      );

      await Promise.allSettled(sendPromises);
    }, 'sendCriticalAlert');
  }

  // Check user notification preferences
  private async checkNotificationPreferences(
    userId: string,
    context: NotificationContext
  ): Promise<boolean> {
    return ErrorHandler.handleDatabaseOperation(async () => {
      const notificationPrefRepo = AppDataSource.getRepository(NotificationPreference);
      
      const preference = await notificationPrefRepo.findOne({
        where: {
          userId,
          type: context.type as any
        }
      });

      // If no preference set, allow notifications for medium and high priority
      if (!preference) {
        return ['medium', 'high', 'critical'].includes(context.priority);
      }

      // Check if notifications are enabled for this type
      if (!preference.enabled) {
        return false;
      }

      // Check priority threshold
      const priorityLevels = ['low', 'medium', 'high', 'critical'];
      const userMinPriority = priorityLevels.indexOf(preference.priority);
      const notificationPriority = priorityLevels.indexOf(context.priority);

      return notificationPriority >= userMinPriority;
    }, 'checkNotificationPreferences');
  }

  // Send push notification to a specific subscription
  private async sendPushNotification(
    subscription: PushSubscription,
    payload: PushNotificationPayload
  ): Promise<void> {
    try {
      const notificationPayload = JSON.stringify(payload);
      
      await webpush.sendNotification(
        subscription.subscription,
        notificationPayload,
        {
          TTL: 60 * 60 * 24, // 24 hours
          urgency: this.getUrgencyFromPayload(payload),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error: any) {
      ErrorHandler.logError(error, `Failed to send push notification to ${subscription.subscription.endpoint}`);
      
      // Handle expired subscriptions
      if (error.statusCode === 410 || error.statusCode === 404) {
        const pushSubscriptionRepo = AppDataSource.getRepository(PushSubscription);
        await pushSubscriptionRepo.update(
          { id: subscription.id },
          { active: false, updatedAt: new Date() }
        );
      }
      
      throw error;
    }
  }

  // Get urgency level from payload
  private getUrgencyFromPayload(payload: PushNotificationPayload): 'very-low' | 'low' | 'normal' | 'high' {
    if (payload.data?.priority === 'critical') return 'high';
    if (payload.data?.priority === 'high') return 'high';
    if (payload.data?.priority === 'medium') return 'normal';
    return 'low';
  }

  /**
   * Retrieves notification preferences for a specific user
   * @param userId - The unique identifier of the user
   * @returns Array of notification preferences for the user
   */
  public async getUserNotificationPreferences(userId: string): Promise<NotificationPreference[]> {
    return ErrorHandler.handleDatabaseOperation(async () => {
      const notificationPrefRepo = AppDataSource.getRepository(NotificationPreference);
      return await notificationPrefRepo.find({
        where: { userId }
      });
    }, 'getUserNotificationPreferences');
  }

  /**
   * Updates notification preferences for a specific user
   * @param userId - The unique identifier of the user
   * @param preferences - Array of preference updates to apply
   */
  public async updateNotificationPreferences(
    userId: string,
    preferences: Array<{
      type: string;
      enabled: boolean;
      priority: string;
    }>
  ): Promise<void> {
    return ErrorHandler.handleDatabaseOperation(async () => {
      const notificationPrefRepo = AppDataSource.getRepository(NotificationPreference);
      
      for (const pref of preferences) {
        await notificationPrefRepo.upsert(
          {
            userId,
            type: pref.type as any,
            enabled: pref.enabled,
            priority: pref.priority as any,
            updatedAt: new Date()
          },
          ['userId', 'type']
        );
      }
    }, 'updateNotificationPreferences');
  }

  /**
   * Retrieves all active push subscriptions for a specific user
   * @param userId - The unique identifier of the user
   * @returns Array of active push subscriptions for the user
   */
  public async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    return ErrorHandler.handleDatabaseOperation(async () => {
      const pushSubscriptionRepo = AppDataSource.getRepository(PushSubscription);
      return await pushSubscriptionRepo.find({
        where: {
          userId,
          active: true
        },
        order: {
          createdAt: 'DESC'
        }
      });
    }, 'getUserSubscriptions');
  }
}

export { PushNotificationService };