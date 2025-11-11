import { Request, Response, Router } from 'express';
import { AppDataSource } from '../config/database';
import { PushSubscription } from '../entities/PushSubscription';
import { authenticate } from '../middleware/auth.middleware';
import { optionalFarmAccess } from '../middleware/farm-auth.middleware';
import { validate } from '../middleware/joiValidation.middleware';
import { ServiceFactory } from '../services/ServiceFactory';
import { ApiResponse } from '../types/api.types';
import { notificationValidations } from '../validations/notification.validations';

const router = Router();

// Get service instances from factory
const serviceFactory = ServiceFactory.getInstance();
const pushNotificationService = serviceFactory.getPushNotificationService();
const alertEngineService = serviceFactory.getAlertEngineService();

// Apply authentication to all routes
router.use(authenticate);

// Apply optional farm access - notifications can be user-wide or farm-specific
router.use(optionalFarmAccess);

// Get VAPID public key for push notifications
router.get('/vapid-key', async (req: Request, res: Response) => {
  try {
    const publicKey = pushNotificationService.getVapidPublicKey();

    res.json({
      success: true,
      message: 'VAPID public key retrieved successfully',
      data: { publicKey },
    } as ApiResponse<{ publicKey: string }>);
  } catch (error: any) {
    console.error('Error getting VAPID key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get VAPID key',
      error: error.message,
    } as ApiResponse<null>);
  }
});

// Subscribe to push notifications
router.post(
  '/subscribe',
  authenticate,
  validate({ body: notificationValidations.subscribeToPush }),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const subscription = req.body;

      const pushSubscription = await pushNotificationService.subscribeUser(userId, subscription);

      res.status(201).json({
        success: true,
        message: 'Successfully subscribed to push notifications',
        data: {
          id: pushSubscription.id,
          active: pushSubscription.active,
        },
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error subscribing to push notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to subscribe to push notifications',
        error: error.message,
      } as ApiResponse<null>);
    }
  },
);

// Unsubscribe from push notifications
router.post(
  '/unsubscribe',
  authenticate,
  validate({ body: notificationValidations.unsubscribeFromPush }),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { endpoint } = req.body;

      await pushNotificationService.unsubscribeUser(userId, endpoint);

      res.json({
        success: true,
        message: 'Successfully unsubscribed from push notifications',
        data: null,
      } as ApiResponse<null>);
    } catch (error: any) {
      console.error('Error unsubscribing from push notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unsubscribe from push notifications',
        error: error.message,
      } as ApiResponse<null>);
    }
  },
);

// Get user's push subscriptions
router.get('/subscriptions', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const pushSubscriptionRepo = AppDataSource.getRepository(PushSubscription);

    const subscriptions = await pushSubscriptionRepo.find({
      where: { userId, active: true },
      select: ['id', 'subscription', 'active', 'createdAt'],
    });

    res.json({
      success: true,
      message: 'Push subscriptions retrieved successfully',
      data: subscriptions,
    } as ApiResponse<any[]>);
  } catch (error: any) {
    console.error('Error getting push subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get push subscriptions',
      error: error.message,
    } as ApiResponse<null>);
  }
});

// Get user's notification preferences
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const preferences = await pushNotificationService.getUserNotificationPreferences(userId);

    res.json({
      success: true,
      message: 'Notification preferences retrieved successfully',
      data: preferences,
    } as ApiResponse<any[]>);
  } catch (error: any) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification preferences',
      error: error.message,
    } as ApiResponse<null>);
  }
});

// Update notification preferences
router.put(
  '/preferences',
  authenticate,
  validate({ body: notificationValidations.updateNotificationPreferences }),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { preferences } = req.body;

      await pushNotificationService.updateNotificationPreferences(userId, preferences);

      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: null,
      } as ApiResponse<null>);
    } catch (error: any) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification preferences',
        error: error.message,
      } as ApiResponse<null>);
    }
  },
);

// Send test notification
router.post(
  '/test',
  authenticate,
  validate({ body: notificationValidations.sendTestNotification }),
  async (req: Request, res: Response) => {
    try {
      const { farmId, type, severity, title, message, data } = req.body;

      if (!alertEngineService) {
        throw new Error('Alert engine service not available');
      }

      await alertEngineService.manualTriggerAlert(farmId, type, severity, title, message, data);

      res.json({
        success: true,
        message: 'Test notification sent successfully',
        data: null,
      } as ApiResponse<null>);
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test notification',
        error: error.message,
      } as ApiResponse<null>);
    }
  },
);

// Get alert rules
router.get('/alert-rules', async (req: Request, res: Response) => {
  try {
    if (!alertEngineService) {
      return res.status(503).json({
        success: false,
        message: 'Alert engine service not available',
        error: 'Service not initialized',
      } as ApiResponse<null>);
    }

    const alertRules = alertEngineService.getAlertRules();
    return res.json({
      success: true,
      message: 'Alert rules retrieved successfully',
      data: alertRules,
    } as ApiResponse<typeof alertRules>);
  } catch (error) {
    console.error('Error retrieving alert rules:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve alert rules',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse<null>);
  }
});

// Create alert rule
router.post(
  '/alert-rules',
  authenticate,
  validate({ body: notificationValidations.createAlertRule }),
  async (req: Request, res: Response) => {
    try {
      const ruleData = req.body;
      const ruleId = `custom_${ruleData.farmId}_${Date.now()}`;

      const alertRule = {
        id: ruleId,
        ...ruleData,
        isActive: true,
      };

      if (!alertEngineService) {
        throw new Error('Alert engine service not available');
      }

      alertEngineService.addAlertRule(alertRule);

      res.status(201).json({
        success: true,
        message: 'Alert rule created successfully',
        data: { id: ruleId },
      } as ApiResponse<{ id: string }>);
    } catch (error: any) {
      console.error('Error creating alert rule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create alert rule',
        error: error.message,
      } as ApiResponse<null>);
    }
  },
);

// Delete alert rule
router.delete(
  '/alert-rules/:ruleId',
  authenticate,
  validate({ params: notificationValidations.deleteAlertRule }),
  async (req: Request, res: Response) => {
    try {
      const { ruleId } = req.params;

      if (!alertEngineService) {
        throw new Error('Alert engine service not available');
      }

      alertEngineService.removeAlertRule(ruleId);

      res.json({
        success: true,
        message: 'Alert rule removed successfully',
        data: null,
      } as ApiResponse<null>);
    } catch (error: any) {
      console.error('Error removing alert rule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove alert rule',
        error: error.message,
      } as ApiResponse<null>);
    }
  },
);

export default router;
