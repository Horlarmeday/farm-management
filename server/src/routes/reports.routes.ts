import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { reportsController } from '../controllers/reports.controller';
import { authenticateToken } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter.middleware';
import { reportsCacheMiddleware, invalidateCache, getCacheStats } from '../middleware/cache.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Apply rate limiting for report generation (10 requests per 5 minutes)
router.use(rateLimiter(10, 5));

// Cache statistics endpoint (for debugging)
router.get('/cache/stats', getCacheStats);

// Validation middleware for date parameters
const validateDateRange = [
  query('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((endDate, { req }) => {
      const startDate = req.query?.startDate;
      if (startDate && new Date(endDate) <= new Date(startDate as string)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

const validateOptionalCategories = [
  query('categoryIds')
    .optional()
    .isString()
    .withMessage('Category IDs must be a comma-separated string'),
];

const validateYear = [
  param('year')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be a valid integer between 2000 and 2100'),
];

// P&L calculation endpoint
// GET /api/reports/profit-loss?startDate=2024-01-01&endDate=2024-12-31&categoryIds=1,2,3&includeSubcategories=true&groupBy=month
router.get(
  '/profit-loss',
  reportsCacheMiddleware, // Cache for 15 minutes
  [
    ...validateDateRange,
    ...validateOptionalCategories,
    query('includeSubcategories')
      .optional()
      .isBoolean()
      .withMessage('Include subcategories must be a boolean'),
    query('groupBy')
      .optional()
      .isIn(['month', 'quarter', 'year'])
      .withMessage('Group by must be one of: month, quarter, year'),
  ],
  reportsController.getProfitLoss.bind(reportsController)
);

// Monthly P&L summary
// GET /api/reports/monthly-summary/2024
router.get(
  '/monthly-summary/:year',
  reportsCacheMiddleware, // Cache for 15 minutes
  validateYear,
  reportsController.getMonthlyPLSummary.bind(reportsController)
);

// Quarterly P&L summary
// GET /api/reports/quarterly-summary/2024
router.get(
  '/quarterly-summary/:year',
  reportsCacheMiddleware, // Cache for 15 minutes
  validateYear,
  reportsController.getQuarterlyPLSummary.bind(reportsController)
);

// Category breakdown
// GET /api/reports/category-breakdown?startDate=2024-01-01&endDate=2024-12-31&categoryIds=1,2,3
router.get(
  '/category-breakdown',
  reportsCacheMiddleware, // Cache for 15 minutes
  [
    ...validateDateRange,
    ...validateOptionalCategories,
  ],
  reportsController.getCategoryBreakdown.bind(reportsController)
);

// Export P&L report
// GET /api/reports/export?startDate=2024-01-01&endDate=2024-12-31&format=csv&categoryIds=1,2,3
router.get(
  '/export',
  // No caching for exports as they should be fresh
  [
    ...validateDateRange,
    ...validateOptionalCategories,
    query('format')
      .optional()
      .isIn(['json', 'csv'])
      .withMessage('Format must be either json or csv'),
  ],
  reportsController.exportPLReport.bind(reportsController)
);

// Compare P&L between periods
// GET /api/reports/compare-periods?currentStartDate=2024-01-01&currentEndDate=2024-12-31&previousStartDate=2023-01-01&previousEndDate=2023-12-31
router.get(
  '/compare-periods',
  reportsCacheMiddleware, // Cache for 15 minutes
  [
    query('currentStartDate')
      .isISO8601()
      .withMessage('Current start date must be a valid ISO 8601 date'),
    query('currentEndDate')
      .isISO8601()
      .withMessage('Current end date must be a valid ISO 8601 date'),
    query('previousStartDate')
      .isISO8601()
      .withMessage('Previous start date must be a valid ISO 8601 date'),
    query('previousEndDate')
      .isISO8601()
      .withMessage('Previous end date must be a valid ISO 8601 date'),
  ],
  reportsController.comparePLPeriods.bind(reportsController)
);

// Performance metrics for dashboard
// GET /api/reports/performance-metrics?period=month
router.get(
  '/performance-metrics',
  reportsCacheMiddleware, // Cache for 15 minutes
  [
    query('period')
      .optional()
      .isIn(['month', 'quarter', 'year'])
      .withMessage('Period must be one of: month, quarter, year'),
  ],
  reportsController.getPerformanceMetrics.bind(reportsController)
);

// P&L trends over time
// GET /api/reports/trends?period=month&periods=12
router.get(
  '/trends',
  reportsCacheMiddleware, // Cache for 15 minutes
  [
    query('period')
      .optional()
      .isIn(['month', 'quarter', 'year'])
      .withMessage('Period must be one of: month, quarter, year'),
    query('periods')
      .optional()
      .isInt({ min: 1, max: 60 })
      .withMessage('Periods must be an integer between 1 and 60'),
  ],
  reportsController.getPLTrends.bind(reportsController)
);

// Cache invalidation endpoint (for when new transactions are added)
router.post('/cache/invalidate', invalidateCache('/api/reports'));

export default router;