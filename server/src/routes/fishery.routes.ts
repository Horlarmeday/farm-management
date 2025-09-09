import { Router } from 'express';
import { FisheryController } from '../controllers/FisheryController';
import { authenticate } from '../middleware/auth.middleware';
import { requireFarmAccessWithRole } from '../middleware/farm-auth.middleware';
import { validate } from '../middleware/joiValidation.middleware';
import { fisheryValidations } from '../validations/fishery.validations';
import { FarmRole } from '@kuyash/shared';

const router: Router = Router();
const fisheryController = new FisheryController();

// Apply authentication to all routes
router.use(authenticate);

// Apply farm access middleware to all routes
// All fishery operations require at least WORKER role
router.use(requireFarmAccessWithRole([FarmRole.WORKER, FarmRole.MANAGER, FarmRole.OWNER]));

// Pond Management Routes
router.post(
  '/ponds',
  validate({ body: fisheryValidations.createPond }),
  fisheryController.createPond,
);

router.get('/ponds', validate({ query: fisheryValidations.getPonds }), fisheryController.getPonds);

router.get(
  '/ponds/:id',
  validate({ params: fisheryValidations.uuidParam }),
  fisheryController.getPondById,
);

router.put(
  '/ponds/:id',
  validate({
    params: fisheryValidations.uuidParam,
    body: fisheryValidations.updatePond,
  }),
  fisheryController.updatePond,
);

// Fish Stocking Routes
router.post(
  '/stocking',
  validate({ body: fisheryValidations.recordStocking }),
  fisheryController.stockFish,
);

router.get(
  '/stocking',
  validate({ query: fisheryValidations.getStockingRecords }),
  fisheryController.getStockingRecords,
);

// Feeding Management Routes
router.post(
  '/feeding',
  validate({ body: fisheryValidations.recordFeeding }),
  fisheryController.recordFeeding,
);

router.get(
  '/feeding',
  validate({ query: fisheryValidations.getFeedingLogs }),
  fisheryController.getFeedingLogs,
);

// Water Quality Management Routes
router.post(
  '/water-quality',
  validate({ body: fisheryValidations.recordWaterQuality }),
  fisheryController.recordWaterQuality,
);

router.get(
  '/water-quality',
  validate({ query: fisheryValidations.getWaterQualityLogs }),
  fisheryController.getWaterQualityLogs,
);

// Fish Sampling Routes
router.post(
  '/sampling',
  validate({ body: fisheryValidations.recordSampling }),
  fisheryController.recordSampling,
);

router.get(
  '/sampling',
  validate({ query: fisheryValidations.getSamplingLogs }),
  fisheryController.getSamplingLogs,
);

// Harvest Management Routes
router.post(
  '/harvests',
  validate({ body: fisheryValidations.recordHarvest }),
  fisheryController.recordHarvest,
);

router.get(
  '/harvests',
  validate({ query: fisheryValidations.getHarvestRecords }),
  fisheryController.getHarvestRecords,
);

// Sales Management Routes
router.post(
  '/sales',
  validate({ body: fisheryValidations.recordSale }),
  fisheryController.recordSale,
);

router.get('/sales', validate({ query: fisheryValidations.getSales }), fisheryController.getSales);

// Analytics and Reports Routes
router.get(
  '/ponds/:id/performance',
  validate({ params: fisheryValidations.uuidParam }),
  fisheryController.getPondPerformance,
);

// router.get(
//   '/analytics/feed-conversion',
//   validate({ query: fisheryValidations.getFeedConversionReport }),
//   fisheryController.getFeedConversionReport,
// );

// router.get(
//   '/analytics/water-quality',
//   validate({ query: fisheryValidations.getWaterQualityAnalysis }),
//   fisheryController.getWaterQualityAnalysis,
// );

// router.get(
//   '/analytics/survival-rate',
//   validate({ query: fisheryValidations.getSurvivalRateAnalysis }),
//   fisheryController.getSurvivalRateAnalysis,
// );

// router.get(
//   '/analytics/financial',
//   validate({ query: fisheryValidations.getFinancialSummary }),
//   fisheryController.getFinancialSummary,
// );

export default router;
