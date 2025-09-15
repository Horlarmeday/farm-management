import { Router } from 'express';
import testController from '../controllers/test.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route GET /api/health/services
 * @desc Get health status of all services
 * @access Public (for monitoring)
 */
router.get('/services', testController.getServiceHealth);

/**
 * @route GET /api/health
 * @desc Basic health check endpoint
 * @access Public
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;