import { Router } from 'express';
import { LivestockController } from '../controllers/LivestockController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/joiValidation.middleware';
import { livestockValidations } from '../validations/livestock.validations';

const router: Router = Router();
const livestockController = new LivestockController();

// Apply authentication to all routes
router.use(authenticate);

// Animal Management Routes
router.post(
  '/animals',
  validate({ body: livestockValidations.createAnimal }),
  livestockController.createAnimal,
);

router.get(
  '/animals',
  validate({ query: livestockValidations.getAnimals }),
  livestockController.getAnimals,
);

router.get(
  '/animals/:id',
  validate({ params: livestockValidations.uuidParam }),
  livestockController.getAnimalById,
);

router.put(
  '/animals/:id',
  validate({
    params: livestockValidations.uuidParam,
    body: livestockValidations.updateAnimal,
  }),
  livestockController.updateAnimal,
);

// Health Management Routes
router.post(
  '/health',
  validate({ body: livestockValidations.recordHealthEvent }),
  livestockController.recordHealthEvent,
);

router.get(
  '/health',
  validate({ query: livestockValidations.getHealthRecords }),
  livestockController.getHealthRecords,
);

// router.post(
//   '/vaccinations',
//   validate({ body: livestockValidations.scheduleVaccination }),
//   livestockController.scheduleVaccination,
// );
//
// router.get(
//   '/vaccinations',
//   validate({ query: livestockValidations.getVaccinationSchedules }),
//   livestockController.getVaccinationSchedules,
// );

// Feeding Management Routes
router.post(
  '/feeding',
  validate({ body: livestockValidations.recordFeeding }),
  livestockController.recordFeeding,
);

router.get(
  '/feeding',
  validate({ query: livestockValidations.getFeedingLogs }),
  livestockController.getFeedingLogs,
);

// Breeding Management Routes
router.post(
  '/breeding',
  validate({ body: livestockValidations.recordBreeding }),
  livestockController.recordBreeding,
);

router.get(
  '/breeding',
  validate({ query: livestockValidations.getBreedingRecords }),
  livestockController.getBreedingRecords,
);

// Birth Management Routes
router.post(
  '/births',
  validate({ body: livestockValidations.recordBirth }),
  livestockController.recordBirth,
);

// Production Management Routes
router.post(
  '/production',
  validate({ body: livestockValidations.recordProduction }),
  livestockController.recordProduction,
);

router.get(
  '/production',
  validate({ query: livestockValidations.getProductionLogs }),
  livestockController.getProductionLogs,
);

// Sales Management Routes
router.post(
  '/sales',
  validate({ body: livestockValidations.recordSale }),
  livestockController.recordSale,
);

router.get(
  '/sales',
  validate({ query: livestockValidations.getSales }),
  livestockController.getSales,
);

// Analytics and Reports Routes
router.get(
  '/animals/:id/performance',
  validate({ params: livestockValidations.uuidParam }),
  livestockController.getAnimalPerformance,
);

// Health analytics route removed - method not implemented

// router.get(
//   '/analytics/production',
//   validate({ query: livestockValidations.getProductionAnalytics }),
//   livestockController.getProductionAnalytics,
// );
//
// router.get(
//   '/analytics/breeding',
//   validate({ query: livestockValidations.getBreedingAnalytics }),
//   livestockController.getBreedingAnalytics,
// );
//
// router.get(
//   '/reports/financial-summary',
//   validate({ query: livestockValidations.getFinancialSummary }),
//   livestockController.getFinancialSummary,
// );

export default router;
