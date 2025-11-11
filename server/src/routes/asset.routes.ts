import { Router } from 'express';
import Joi from 'joi';
import { FarmRole } from '../../../shared/src/types';
import { AssetController } from '../controllers/AssetController';
import { authenticate } from '../middleware/auth.middleware';
import { requireFarmAccessWithRole } from '../middleware/farm-auth.middleware';
import { validate } from '../middleware/joiValidation.middleware';

const router: Router = Router();
const assetController = new AssetController();

// Apply authentication to all routes
router.use(authenticate);

// Apply farm access middleware - Asset operations require WORKER or higher
router.use(requireFarmAccessWithRole([FarmRole.WORKER, FarmRole.MANAGER, FarmRole.OWNER]));

// Asset Management Routes
router.post('/', assetController.createAsset);

router.get('/', assetController.getAssets);

router.get(
  '/:id',
  validate({ params: Joi.object({ id: Joi.string().uuid().required() }) }),
  assetController.getAssetById,
);

router.put(
  '/:id',
  validate({
    params: Joi.object({ id: Joi.string().uuid().required() }),
    body: Joi.object({
      name: Joi.string().optional(),
      category: Joi.string()
        .valid('VEHICLE', 'MACHINERY', 'EQUIPMENT', 'TOOL', 'BUILDING', 'INFRASTRUCTURE')
        .optional(),
      serialNumber: Joi.string().optional(),
      model: Joi.string().optional(),
      purchaseDate: Joi.date().iso().optional(),
      purchasePrice: Joi.number().positive().optional(),
      currentValue: Joi.number().positive().optional(),
      location: Joi.string().optional(),
      condition: Joi.string().valid('EXCELLENT', 'GOOD', 'FAIR', 'POOR').optional(),
    }),
  }),
  assetController.updateAsset,
);

// Maintenance Management Routes
router.post('/maintenance', assetController.scheduleMaintenance);

router.get('/maintenance', assetController.getMaintenanceRecords);

router.put(
  '/maintenance/:id/complete',
  validate({
    params: Joi.object({ id: Joi.string().uuid().required() }),
    body: Joi.object({
      completedDate: Joi.date().iso().required(),
      actualCost: Joi.number().positive().required(),
      performedBy: Joi.string().required(),
      workDescription: Joi.string().required(),
    }),
  }),
  assetController.completeMaintenance,
);

// Maintenance History Routes
router.get('/maintenance/upcoming', assetController.getUpcomingMaintenance);

// Auxiliary Production Routes
router.post('/auxiliary-production', assetController.recordAuxiliaryProduction);

router.get('/auxiliary-production', assetController.getAuxiliaryProduction);

// Dispatch Management Routes
router.post('/auxiliary-dispatch', assetController.recordAuxiliaryDispatch);

router.get('/auxiliary-dispatch', assetController.getAuxiliaryDispatch);

// Depreciation Management Routes
router.post(
  '/:id/depreciation',
  validate({
    params: Joi.object({ id: Joi.string().uuid().required() }),
    body: Joi.object({
      depreciationMethod: Joi.string()
        .valid('STRAIGHT_LINE', 'DECLINING_BALANCE', 'UNITS_OF_PRODUCTION')
        .required(),
      usefulLife: Joi.number().positive().required(),
      salvageValue: Joi.number().positive().required(),
    }),
  }),
  assetController.calculateDepreciation,
);

router.get('/depreciation', assetController.getDepreciationReport);

// Analytics and Reports Routes
router.get(
  '/:id/performance',
  validate({
    params: Joi.object({ id: Joi.string().uuid().required() }),
    query: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().required(),
    }),
  }),
  assetController.getAssetPerformance,
);

router.get('/analytics/auxiliary-production', assetController.getAuxiliaryProductionAnalytics);

router.get('/analytics/maintenance', assetController.getMaintenanceAnalytics);

router.get('/analytics/financial-summary', assetController.getFinancialSummary);

export default router;
