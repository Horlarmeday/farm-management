import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/joiValidation.middleware';
import { notificationValidations } from '../validations/notification.validations';

const router: Router = Router();
const notificationController = new NotificationController();

// Apply authentication to all routes
router.use(authenticate);

// Notification Management Routes
router.post(
  '/notifications',
  validate({ body: notificationValidations.createNotification }),
  notificationController.createNotification,
);

router.get(
  '/notifications',
  validate({ query: notificationValidations.getNotifications }),
  notificationController.getNotifications,
);

router.get(
  '/notifications/:id',
  validate({ params: notificationValidations.uuidParam }),
  notificationController.getNotificationById,
);

// Update notification route removed - method not implemented

router.put(
  '/notifications/:id/read',
  validate({ params: notificationValidations.uuidParam }),
  notificationController.markAsRead,
);

// Enhanced notification routes
router.post(
  '/notifications/:id/deliver',
  validate({ 
    params: notificationValidations.uuidParam,
    body: notificationValidations.deliverNotification 
  }),
  notificationController.deliverNotification,
);

router.get(
  '/notifications/:id/delivery-status',
  validate({ params: notificationValidations.uuidParam }),
  notificationController.getDeliveryStatus,
);

router.get(
  '/notifications/priority/:priority',
  validate({ 
    params: notificationValidations.getNotificationsByPriority,
    query: notificationValidations.getNotifications 
  }),
  notificationController.getNotificationsByPriority,
);

router.get(
  '/notifications/action-required',
  validate({ query: notificationValidations.getActionRequiredNotifications }),
  notificationController.getActionRequiredNotifications,
);

// Alert Management Routes
router.post(
  '/alerts',
  validate({ body: notificationValidations.createAlert }),
  notificationController.createAlert,
);

router.get(
  '/alerts',
  validate({ query: notificationValidations.getAlerts }),
  notificationController.getAlerts,
);

router.get(
  '/alerts/:id',
  validate({ params: notificationValidations.uuidParam }),
  notificationController.getAlertById,
);

// Task Management Routes
router.post(
  '/tasks',
  validate({ body: notificationValidations.createTask }),
  notificationController.createTask,
);

router.get(
  '/tasks',
  validate({ query: notificationValidations.getTasks }),
  notificationController.getTasks,
);

router.put(
  '/tasks/:id',
  validate({
    params: notificationValidations.uuidParam,
    body: notificationValidations.updateTask,
  }),
  notificationController.updateTask,
);

// Reminder Management Routes
router.post(
  '/reminders',
  validate({ body: notificationValidations.createReminder }),
  notificationController.createReminder,
);

router.get(
  '/reminders',
  validate({ query: notificationValidations.getReminders }),
  notificationController.getReminders,
);

router.get(
  '/reminders/due',
  validate({ query: notificationValidations.getDueReminders }),
  notificationController.getDueReminders,
);

router.put(
  '/reminders/:id',
  validate({
    params: notificationValidations.uuidParam,
    body: notificationValidations.updateReminder,
  }),
  notificationController.updateReminder,
);

// Template Management Routes
router.post(
  '/templates',
  validate({ body: notificationValidations.createTemplate }),
  notificationController.createTemplate,
);

router.get(
  '/templates',
  validate({ query: notificationValidations.getTemplates }),
  notificationController.getTemplates,
);

// Get template by ID route removed - method not implemented

router.put(
  '/templates/:id',
  validate({
    params: notificationValidations.uuidParam,
    body: notificationValidations.updateTemplate,
  }),
  notificationController.updateTemplate,
);

// Subscription Management Routes removed - methods not implemented

// User Preferences Routes
router.get('/preferences', notificationController.getUserPreferences);

router.put(
  '/preferences',
  validate({ body: notificationValidations.updateUserPreferences }),
  notificationController.updateUserPreferences,
);

// Analytics and Reports Routes
router.get(
  '/analytics/delivery',
  validate({ query: notificationValidations.getDeliveryAnalytics }),
  notificationController.getDeliveryAnalytics,
);

export default router;
