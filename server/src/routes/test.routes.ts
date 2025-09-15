import { Router } from 'express';
import testController from '../controllers/test.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route POST /api/test/websocket
 * @desc Test WebSocket service functionality
 * @access Public (for testing)
 */
router.post('/websocket', testController.testWebSocket);

/**
 * @route POST /api/test/alerts
 * @desc Test AlertEngine service functionality
 * @access Public (for testing)
 * @body { farmId?: string }
 */
router.post('/alerts', testController.testAlerts);

/**
 * @route POST /api/test/push
 * @desc Test Push Notification service functionality
 * @access Public (for testing)
 * @body { subscription: PushSubscription }
 */
router.post('/push', testController.testPushNotifications);

export default router;