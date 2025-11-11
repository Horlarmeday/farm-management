import { NextFunction, Request, Response, Router } from 'express';
import { body, param, query } from 'express-validator';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

// Lazy load AnalyticsController to avoid dependency issues during route loading
let analyticsController: AnalyticsController | null = null;
const getAnalyticsController = (): AnalyticsController => {
  if (!analyticsController) {
    analyticsController = new AnalyticsController();
  }
  return analyticsController;
};

// Get yield prediction for a farm
router.get(
  '/predictions/yield/:farmId',
  authenticate,
  [
    param('farmId').isUUID().withMessage('Valid farm ID is required'),
    query('cropType').optional().isString().withMessage('Crop type must be a string'),
  ],
  validateRequest,
  (req: Request, res: Response, next: NextFunction) =>
    getAnalyticsController().getYieldPrediction(req, res, next),
);

// Get weather forecast for a farm
router.get(
  '/predictions/weather/:farmId',
  authenticate,
  [
    param('farmId').isUUID().withMessage('Valid farm ID is required'),
    query('days')
      .optional()
      .isInt({ min: 1, max: 14 })
      .withMessage('Days must be between 1 and 14'),
  ],
  validateRequest,
  (req: Request, res: Response, next: NextFunction) =>
    getAnalyticsController().getWeatherForecast(req, res, next),
);

// Get automated insights for a farm
router.get(
  '/insights/:farmId',
  authenticate,
  [
    param('farmId').isUUID().withMessage('Valid farm ID is required'),
    query('type')
      .optional()
      .isIn([
        'yield_prediction',
        'weather_alert',
        'soil_health',
        'irrigation_recommendation',
        'pest_risk',
      ])
      .withMessage('Invalid insight type'),
  ],
  validateRequest,
  (req: Request, res: Response, next: NextFunction) =>
    getAnalyticsController().getInsights(req, res, next),
);

// Get historical predictions for a farm
router.get(
  '/predictions/history/:farmId',
  authenticate,
  [
    param('farmId').isUUID().withMessage('Valid farm ID is required'),
    query('type')
      .optional()
      .isIn(['yield', 'weather', 'pest_risk', 'irrigation'])
      .withMessage('Invalid prediction type'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  ],
  validateRequest,
  (req: Request, res: Response, next: NextFunction) =>
    getAnalyticsController().getHistoricalPredictions(req, res, next),
);

// Start yield model training
router.post(
  '/models/train/yield',
  authenticate,
  [
    body('farmId').isUUID().withMessage('Valid farm ID is required'),
    body('cropType').isString().notEmpty().withMessage('Crop type is required'),
    body('trainingData').optional().isArray().withMessage('Training data must be an array'),
  ],
  validateRequest,
  (req: Request, res: Response, next: NextFunction) =>
    getAnalyticsController().trainYieldModel(req, res, next),
);

// Get analytics dashboard data
router.get(
  '/dashboard/:farmId',
  authenticate,
  [param('farmId').isUUID().withMessage('Valid farm ID is required')],
  validateRequest,
  (req: Request, res: Response, next: NextFunction) =>
    getAnalyticsController().getDashboardData(req, res, next),
);

// Get prediction accuracy metrics
router.get(
  '/metrics/accuracy/:farmId',
  authenticate,
  [
    param('farmId').isUUID().withMessage('Valid farm ID is required'),
    query('type')
      .optional()
      .isIn(['yield', 'weather', 'pest_risk'])
      .withMessage('Invalid prediction type'),
    query('period').optional().isIn(['30d', '90d', '180d', '1y']).withMessage('Invalid period'),
  ],
  validateRequest,
  (req: Request, res: Response, next: NextFunction) =>
    getAnalyticsController().getAccuracyMetrics(req, res, next),
);

// Export prediction data
router.get(
  '/export/predictions/:farmId',
  authenticate,
  [
    param('farmId').isUUID().withMessage('Valid farm ID is required'),
    query('format').optional().isIn(['csv', 'json', 'xlsx']).withMessage('Invalid export format'),
    query('type').optional().isString().withMessage('Type must be a string'),
    query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid ISO8601 date'),
  ],
  validateRequest,
  (req: Request, res: Response, next: NextFunction) =>
    getAnalyticsController().exportPredictionData(req, res, next),
);

export default router;
