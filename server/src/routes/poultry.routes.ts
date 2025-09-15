import { Router } from 'express';
import { PoultryController } from '../controllers/PoultryController';
import { authenticate } from '../middleware/auth.middleware';
import { requireFarmAccessWithRole } from '../middleware/farm-auth.middleware';
import { validate } from '../middleware/joiValidation.middleware';
import { poultryValidations } from '../validations/poultry.validations';
import { FarmRole } from '../../../shared/src/types';

const router: Router = Router();
const poultryController = new PoultryController();

// Apply authentication to all routes
router.use(authenticate);

// Apply farm access middleware to all routes
// All poultry operations require at least WORKER role
router.use(requireFarmAccessWithRole([FarmRole.WORKER, FarmRole.MANAGER, FarmRole.OWNER]));

// Bird Batch Management Routes
router.post(
  '/batches',
  validate({ body: poultryValidations.createBirdBatch }),
  poultryController.createBirdBatch,
);

router.get(
  '/batches',
  validate({ query: poultryValidations.getBirdBatches }),
  poultryController.getBirdBatches,
);

router.get(
  '/batches/:id',
  validate({ params: poultryValidations.uuidParam }),
  poultryController.getBirdBatchById,
);

router.put(
  '/batches/:id',
  validate({
    params: poultryValidations.uuidParam,
    body: poultryValidations.updateBirdBatch,
  }),
  poultryController.updateBirdBatch,
);

// Feeding Management Routes
router.post(
  '/feeding',
  validate({ body: poultryValidations.recordFeeding }),
  poultryController.recordFeeding,
);

router.get(
  '/feeding',
  validate({ query: poultryValidations.getFeedingLogs }),
  poultryController.getFeedingLogs,
);

// Health Management Routes
router.post(
  '/health',
  validate({ body: poultryValidations.recordHealthEvent }),
  poultryController.recordHealthEvent,
);

router.get(
  '/health',
  validate({ query: poultryValidations.getHealthRecords }),
  poultryController.getHealthRecords,
);

// router.post(
//   '/vaccinations',
//   validate({ body: poultryValidations.scheduleVaccination }),
//   poultryController.scheduleVaccination,
// );
//
// router.get(
//   '/vaccinations',
//   validate({ query: poultryValidations.getVaccinationSchedules }),
//   poultryController.getVaccinationSchedules,
// );

// Egg Production Routes
router.post(
  '/egg-production',
  validate({ body: poultryValidations.recordEggProduction }),
  poultryController.recordEggProduction,
);

router.get(
  '/egg-production',
  validate({ query: poultryValidations.getEggProductionLogs }),
  poultryController.getEggProductionLogs,
);

// Sales Management Routes
router.post(
  '/sales',
  validate({ body: poultryValidations.recordSale }),
  poultryController.recordSale,
);

router.get('/sales', validate({ query: poultryValidations.getSales }), poultryController.getSales);

// Analytics and Reports Routes
router.get(
  '/batches/:id/performance',
  validate({ params: poultryValidations.uuidParam }),
  poultryController.getBatchPerformance,
);
//
// router.get(
//   '/analytics/egg-production',
//   validate({ query: poultryValidations.getEggProductionAnalytics }),
//   poultryController.getEggProductionAnalytics,
// );
//
// router.get(
//   '/reports/feed-conversion',
//   validate({ query: poultryValidations.getFeedConversionReport }),
//   poultryController.getFeedConversionReport,
// );
//
// router.get(
//   '/analytics/mortality',
//   validate({ query: poultryValidations.getMortalityAnalysis }),
//   poultryController.getMortalityAnalysis,
// );
//
// router.get(
//   '/reports/financial-summary',
//   validate({ query: poultryValidations.getFinancialSummary }),
//   poultryController.getFinancialSummary,
// );

export default router;
