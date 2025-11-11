import { commonSchemas, validate } from '@/middleware/joiValidation.middleware';
import { inventoryValidations } from '@/validations/inventory.validations';
import { Router } from 'express';
import Joi from 'joi';
import { FarmRole } from '../../../shared/src/types';
import { InventoryController } from '../controllers/InventoryController';
import { authenticate } from '../middleware/auth.middleware';
import { requireFarmAccessWithRole } from '../middleware/farm-auth.middleware';

const router = Router();
const inventoryController = new InventoryController();

// Apply authentication to all routes
router.use(authenticate);

// Apply farm access middleware - Inventory operations require WORKER or higher
router.use(requireFarmAccessWithRole([FarmRole.WORKER, FarmRole.MANAGER, FarmRole.OWNER]));

// Inventory Items Routes
router.post(
  '/items',
  validate(inventoryValidations.create),
  inventoryController.createInventoryItem,
);

router.get('/items', validate(inventoryValidations.list), inventoryController.getInventoryItems);

router.get(
  '/items/:id',
  validate(inventoryValidations.getById),
  inventoryController.getInventoryItemById,
);

router.put(
  '/items/:id',
  validate(inventoryValidations.update),
  inventoryController.updateInventoryItem,
);

router.post(
  '/items/:id/adjust',
  validate(inventoryValidations.adjustStock),
  inventoryController.adjustStock,
);

// Inventory Transactions Routes
router.post(
  '/transactions',
  validate({
    body: Joi.object({
      itemId: Joi.string().uuid().required(),
      type: Joi.string().valid('IN', 'OUT', 'ADJUSTMENT').required(),
      quantity: Joi.number().required(),
      reason: Joi.string().required(),
    }),
  }),
  inventoryController.recordTransaction,
);

router.get(
  '/transactions',
  validate({
    query: commonSchemas.pagination.keys({
      itemId: Joi.string().uuid().optional(),
      type: Joi.string().valid('IN', 'OUT', 'ADJUSTMENT').optional(),
    }),
  }),
  inventoryController.getTransactions,
);

// Supplier Routes
router.post(
  '/suppliers',
  validate({
    body: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().optional(),
      phone: Joi.string().optional(),
    }),
  }),
  inventoryController.createSupplier,
);

router.get(
  '/suppliers',
  validate({
    query: commonSchemas.pagination.keys({
      active: Joi.boolean().optional(),
      city: Joi.string().optional(),
      country: Joi.string().optional(),
    }),
  }),
  inventoryController.getSuppliers,
);

router.get(
  '/suppliers/:id',
  validate({ params: commonSchemas.uuidParam }),
  inventoryController.getSupplierById,
);

router.put(
  '/suppliers/:id',
  validate({
    params: commonSchemas.uuidParam,
    body: Joi.object({
      name: Joi.string().optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().optional(),
    }),
  }),
  inventoryController.updateSupplier,
);

// Purchase Order Routes
router.post(
  '/purchase-orders',
  validate({
    body: Joi.object({
      supplierId: Joi.string().uuid().required(),
      orderDate: Joi.date().iso().required(),
      items: Joi.array()
        .items(
          Joi.object({
            itemId: Joi.string().uuid().required(),
            quantity: Joi.number().required(),
            unitCost: Joi.number().required(),
          }),
        )
        .min(1)
        .required(),
    }),
  }),
  inventoryController.createPurchaseOrder,
);

router.get(
  '/purchase-orders',
  validate({
    query: commonSchemas.pagination.keys({
      status: Joi.string().valid('PENDING', 'RECEIVED', 'CANCELLED').optional(),
      supplierId: Joi.string().uuid().optional(),
    }),
  }),
  inventoryController.getPurchaseOrders,
);

router.get(
  '/purchase-orders/:id',
  validate({ params: commonSchemas.uuidParam }),
  inventoryController.getPurchaseOrderById,
);

router.post(
  '/purchase-orders/:id/receive',
  validate({
    params: commonSchemas.uuidParam,
    body: Joi.object({
      receivedDate: Joi.date().iso().required(),
      items: Joi.array()
        .items(
          Joi.object({
            itemId: Joi.string().uuid().required(),
            quantityReceived: Joi.number().required(),
          }),
        )
        .min(1)
        .required(),
      totalCostPaid: Joi.number().required(),
      paymentMethod: Joi.string()
        .valid('CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'MOBILE_PAYMENT')
        .required(),
    }),
  }),
  inventoryController.receivePurchaseOrder,
);

// Stock Alerts Routes
router.get('/alerts', inventoryController.getStockAlerts);
router.post('/alerts/generate', inventoryController.generateStockAlerts);
router.patch('/alerts/:id/acknowledge', inventoryController.acknowledgeStockAlert);
router.patch(
  '/alerts/:id/resolve',
  validate({
    params: commonSchemas.uuidParam,
    body: Joi.object({
      notes: Joi.string().optional(),
    }),
  }),
  inventoryController.resolveStockAlert,
);
router.get(
  '/alerts/expiring',
  validate({
    query: Joi.object({
      daysAhead: Joi.number().integer().min(1).default(30),
    }),
  }),
  inventoryController.checkExpiringItems,
);

// Stock Adjustments Routes
router.post(
  '/adjustments',
  validate({
    body: Joi.object({
      itemId: Joi.string().uuid().required(),
      adjustmentType: Joi.string()
        .valid('physical_count', 'damaged', 'lost', 'expired', 'theft', 'other')
        .required(),
      newQuantity: Joi.number().min(0).required(),
      reason: Joi.string().required(),
      notes: Joi.string().optional(),
    }),
  }),
  inventoryController.createStockAdjustment,
);
router.get('/adjustments', inventoryController.getStockAdjustments);
router.post(
  '/adjustments/:id/approve',
  requireFarmAccessWithRole([FarmRole.MANAGER, FarmRole.OWNER]),
  validate({ params: commonSchemas.uuidParam }),
  inventoryController.approveStockAdjustment,
);
router.post(
  '/adjustments/:id/reject',
  requireFarmAccessWithRole([FarmRole.MANAGER, FarmRole.OWNER]),
  validate({
    params: commonSchemas.uuidParam,
    body: Joi.object({
      rejectionReason: Joi.string().required(),
    }),
  }),
  inventoryController.rejectStockAdjustment,
);

// Analytics and Reports Routes
router.get('/analytics/valuation', inventoryController.getInventoryValuation);
router.get('/summary', inventoryController.getInventorySummary);

router.get(
  '/reports/stock-movement',
  validate({ query: commonSchemas.dateRange }),
  inventoryController.getStockMovementReport,
);

router.get('/reports/reorder', inventoryController.generateReorderReport);

export default router;
