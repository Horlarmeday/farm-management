import { commonSchemas, validate } from '@/middleware/joiValidation.middleware';
import { inventoryValidations } from '@/validations/inventory.validations';
import { Router } from 'express';
import Joi from 'joi';
import { InventoryController } from '../controllers/InventoryController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const inventoryController = new InventoryController();

// Apply authentication to all routes
router.use(authenticate);

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

// Analytics and Reports Routes
router.get('/analytics/valuation', inventoryController.getInventoryValuation);

router.get(
  '/reports/stock-movement',
  validate({ query: commonSchemas.dateRange }),
  inventoryController.getStockMovementReport,
);

router.get('/reports/reorder', inventoryController.generateReorderReport);

router.get(
  '/alerts/expiring',
  validate({
    query: Joi.object({
      daysAhead: Joi.number().integer().min(1).default(30),
    }),
  }),
  inventoryController.checkExpiringItems,
);

export default router;
