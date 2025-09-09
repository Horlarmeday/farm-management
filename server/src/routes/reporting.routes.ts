import { Router } from 'express';
import { ReportingController } from '../controllers/ReportingController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/joiValidation.middleware';
import { reportingValidations } from '../validations/reporting.validations';

const router: Router = Router();
const reportingController = new ReportingController();

// Apply authentication to all routes
router.use(authenticate);

// Report Generation Routes
router.post(
  '/reports',
  validate({ body: reportingValidations.generateReport }),
  reportingController.generateReport,
);

router.get(
  '/reports',
  validate({ query: reportingValidations.getReports }),
  reportingController.getReports,
);

router.get(
  '/reports/:id',
  validate({ params: reportingValidations.uuidParam }),
  reportingController.getReportById,
);

router.get(
  '/reports/:id/download',
  validate({ params: reportingValidations.uuidParam }),
  reportingController.downloadReport,
);

// Dashboard Analytics Routes
router.get(
  '/dashboard/overview',
  validate({ query: reportingValidations.getDashboardOverview }),
  reportingController.getDashboardOverview,
);

router.get(
  '/dashboard/kpis',
  validate({ query: reportingValidations.getDashboardKPIs }),
  reportingController.getDashboardKPIs,
);

router.get(
  '/dashboard/charts',
  validate({ query: reportingValidations.getDashboardCharts }),
  reportingController.getDashboardCharts,
);

router.get(
  '/dashboard/modules',
  validate({ query: reportingValidations.getDashboardModules }),
  reportingController.getDashboardModules,
);

router.get(
  '/dashboard/revenue-trend',
  validate({ query: reportingValidations.getRevenueTrend }),
  reportingController.getRevenueTrend,
);

router.get(
  '/dashboard/production-distribution',
  validate({ query: reportingValidations.getProductionDistribution }),
  reportingController.getProductionDistribution,
);

router.get(
  '/dashboard/quick-stats',
  validate({ query: reportingValidations.getQuickStats }),
  reportingController.getQuickStats,
);

router.get(
  '/dashboard/recent-activities',
  validate({ query: reportingValidations.getRecentActivities }),
  reportingController.getRecentActivities,
);

router.get(
  '/dashboard/alerts',
  validate({ query: reportingValidations.getDashboardAlerts }),
  reportingController.getDashboardAlerts,
);

router.get(
  '/dashboard/tasks',
  validate({ query: reportingValidations.getDashboardTasks }),
  reportingController.getDashboardTasks,
);

// Module-specific Analytics Routes
router.get(
  '/analytics/poultry',
  validate({ query: reportingValidations.getPoultryAnalytics }),
  reportingController.getPoultryAnalytics,
);

router.get(
  '/analytics/livestock',
  validate({ query: reportingValidations.getLivestockAnalytics }),
  reportingController.getLivestockAnalytics,
);

router.get(
  '/analytics/fishery',
  validate({ query: reportingValidations.getFisheryAnalytics }),
  reportingController.getFisheryAnalytics,
);

router.get(
  '/analytics/inventory',
  validate({ query: reportingValidations.getInventoryAnalytics }),
  reportingController.getInventoryAnalytics,
);

router.get(
  '/analytics/finance',
  validate({ query: reportingValidations.getFinanceAnalytics }),
  reportingController.getFinanceAnalytics,
);

router.get(
  '/analytics/assets',
  validate({ query: reportingValidations.getAssetAnalytics }),
  reportingController.getAssetAnalytics,
);

router.get(
  '/analytics/users',
  validate({ query: reportingValidations.getUserAnalytics }),
  reportingController.getUserAnalytics,
);

// Comparative Analytics Routes
router.get(
  '/analytics/comparison',
  validate({ query: reportingValidations.getComparisonAnalytics }),
  reportingController.getComparisonAnalytics,
);

router.get(
  '/analytics/trends',
  validate({ query: reportingValidations.getTrendAnalytics }),
  reportingController.getTrendAnalytics,
);

// Export Management Routes
router.post(
  '/exports',
  validate({ body: reportingValidations.createExport }),
  reportingController.createExport,
);

router.get(
  '/exports',
  validate({ query: reportingValidations.getExports }),
  reportingController.getExports,
);

router.get(
  '/exports/:id',
  validate({ params: reportingValidations.uuidParam }),
  reportingController.getExportById,
);

router.get(
  '/exports/:id/download',
  validate({ params: reportingValidations.uuidParam }),
  reportingController.downloadExport,
);

// Schedule Management Routes
router.post(
  '/schedules',
  validate({ body: reportingValidations.createSchedule }),
  reportingController.createSchedule,
);

router.get(
  '/schedules',
  validate({ query: reportingValidations.getSchedules }),
  reportingController.getSchedules,
);

router.get(
  '/schedules/:id',
  validate({ params: reportingValidations.uuidParam }),
  reportingController.getScheduleById,
);

router.put(
  '/schedules/:id',
  validate({
    params: reportingValidations.uuidParam,
    body: reportingValidations.updateSchedule,
  }),
  reportingController.updateSchedule,
);

// Report Template Management Routes
router.post(
  '/templates',
  validate({ body: reportingValidations.createReportTemplate }),
  reportingController.createReportTemplate,
);

router.get(
  '/templates',
  validate({ query: reportingValidations.getReportTemplates }),
  reportingController.getReportTemplates,
);

router.get(
  '/templates/:id',
  validate({ params: reportingValidations.uuidParam }),
  reportingController.getReportTemplateById,
);

router.put(
  '/templates/:id',
  validate({
    params: reportingValidations.uuidParam,
    body: reportingValidations.updateReportTemplate,
  }),
  reportingController.updateReportTemplate,
);

// Scheduled Reports Routes
router.post(
  '/scheduled',
  validate({ body: reportingValidations.scheduleReport }),
  reportingController.scheduleReport,
);

router.get(
  '/scheduled',
  validate({ query: reportingValidations.getScheduledReports }),
  reportingController.getScheduledReports,
);

router.put(
  '/scheduled/:id',
  validate({
    params: reportingValidations.uuidParam,
    body: reportingValidations.updateScheduledReport,
  }),
  reportingController.updateScheduledReport,
);

// Export Routes
router.post(
  '/reports/:id/export',
  validate({
    params: reportingValidations.uuidParam,
    body: reportingValidations.exportReport,
  }),
  reportingController.exportReport,
);

// Dashboard and Analytics Routes
router.get(
  '/dashboard',
  validate({ query: reportingValidations.getDashboardData }),
  reportingController.getDashboardData,
);

router.get(
  '/analytics/real-time',
  validate({ query: reportingValidations.getRealTimeAnalytics }),
  reportingController.getRealTimeAnalytics,
);

router.post(
  '/analytics/custom',
  validate({ body: reportingValidations.generateCustomAnalytics }),
  reportingController.generateCustomAnalytics,
);

// Pre-built Report Routes
router.post(
  '/reports/production',
  validate({ body: reportingValidations.generateProductionReport }),
  reportingController.generateProductionReport,
);

router.post(
  '/reports/financial',
  validate({ body: reportingValidations.generateFinancialReport }),
  reportingController.generateFinancialReport,
);

router.post(
  '/reports/inventory',
  validate({ body: reportingValidations.generateInventoryReport }),
  reportingController.generateInventoryReport,
);

router.post(
  '/reports/hr',
  validate({ body: reportingValidations.generateHRReport }),
  reportingController.generateHRReport,
);

// Comprehensive Analytics Routes
router.get(
  '/analytics/comprehensive',
  validate({ query: reportingValidations.getComprehensiveAnalytics }),
  reportingController.getComprehensiveAnalytics,
);

export default router;
