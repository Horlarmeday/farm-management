import Joi from 'joi';

export const assetValidations = {
  // Common schemas
  uuidParam: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  // Asset Management
  createAsset: Joi.object({
    name: Joi.string().required().max(100),
    category: Joi.string()
      .valid('VEHICLE', 'MACHINERY', 'EQUIPMENT', 'TOOL', 'BUILDING', 'INFRASTRUCTURE')
      .required(),
    serialNumber: Joi.string().optional().max(100),
    model: Joi.string().optional().max(100),
    purchaseDate: Joi.date().iso().required(),
    purchasePrice: Joi.number().positive().required(),
    currentValue: Joi.number().positive().required(),
    location: Joi.string().required().max(200),
    condition: Joi.string().valid('EXCELLENT', 'GOOD', 'FAIR', 'POOR').required(),
    assignedTo: Joi.string().uuid().optional(),
    notes: Joi.string().optional().max(500),
  }),

  updateAsset: Joi.object({
    name: Joi.string().optional().max(100),
    category: Joi.string()
      .valid('VEHICLE', 'MACHINERY', 'EQUIPMENT', 'TOOL', 'BUILDING', 'INFRASTRUCTURE')
      .optional(),
    serialNumber: Joi.string().optional().max(100),
    model: Joi.string().optional().max(100),
    purchaseDate: Joi.date().iso().optional(),
    purchasePrice: Joi.number().positive().optional(),
    currentValue: Joi.number().positive().optional(),
    location: Joi.string().optional().max(200),
    condition: Joi.string().valid('EXCELLENT', 'GOOD', 'FAIR', 'POOR').optional(),
    assignedTo: Joi.string().uuid().optional(),
    notes: Joi.string().optional().max(500),
  }),

  getAssets: Joi.object({
    category: Joi.string()
      .valid('VEHICLE', 'MACHINERY', 'EQUIPMENT', 'TOOL', 'BUILDING', 'INFRASTRUCTURE')
      .optional(),
    condition: Joi.string().valid('EXCELLENT', 'GOOD', 'FAIR', 'POOR').optional(),
    location: Joi.string().optional(),
    assignedTo: Joi.string().uuid().optional(),
    maintenanceDue: Joi.boolean().optional(),
    search: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  // Maintenance Management
  scheduleMaintenance: Joi.object({
    assetId: Joi.string().uuid().required(),
    maintenanceType: Joi.string().valid('PREVENTIVE', 'CORRECTIVE', 'EMERGENCY').required(),
    scheduledDate: Joi.date().iso().required(),
    description: Joi.string().required().max(500),
    estimatedCost: Joi.number().positive().required(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').required(),
    assignedTo: Joi.string().uuid().optional(),
    notes: Joi.string().optional().max(500),
  }),

  getMaintenanceSchedules: Joi.object({
    assetId: Joi.string().uuid().optional(),
    maintenanceType: Joi.string().valid('PREVENTIVE', 'CORRECTIVE', 'EMERGENCY').optional(),
    status: Joi.string().valid('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  completeMaintenance: Joi.object({
    completedDate: Joi.date().iso().required(),
    actualCost: Joi.number().positive().required(),
    performedBy: Joi.string().required().max(100),
    workDescription: Joi.string().required().max(500),
    notes: Joi.string().optional().max(500),
  }),

  getMaintenanceHistory: Joi.object({
    assetId: Joi.string().uuid().optional(),
    maintenanceType: Joi.string().valid('PREVENTIVE', 'CORRECTIVE', 'EMERGENCY').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Auxiliary Production Management
  recordProduction: Joi.object({
    productType: Joi.string().valid('PAPER_CRATE', 'ICE_BLOCK', 'MANUAL_PACKAGING').required(),
    productionDate: Joi.date().iso().required(),
    quantityProduced: Joi.number().positive().required(),
    unit: Joi.string().required().max(20),
    costPerUnit: Joi.number().positive().required(),
    laborCost: Joi.number().positive().required(),
    materialCost: Joi.number().positive().required(),
    notes: Joi.string().optional().max(500),
  }),

  getProductionLogs: Joi.object({
    productType: Joi.string().valid('PAPER_CRATE', 'ICE_BLOCK', 'MANUAL_PACKAGING').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Dispatch Management
  recordDispatch: Joi.object({
    productionId: Joi.string().uuid().required(),
    dispatchDate: Joi.date().iso().required(),
    quantityDispatched: Joi.number().positive().required(),
    unitPrice: Joi.number().positive().required(),
    customerName: Joi.string().required().max(200),
    destination: Joi.string().required().max(200),
    notes: Joi.string().optional().max(500),
  }),

  getDispatchLogs: Joi.object({
    productionId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    customerName: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Depreciation Management
  setupDepreciation: Joi.object({
    depreciationMethod: Joi.string()
      .valid('STRAIGHT_LINE', 'DECLINING_BALANCE', 'UNITS_OF_PRODUCTION')
      .required(),
    usefulLife: Joi.number().positive().required(),
    salvageValue: Joi.number().positive().required(),
    startDate: Joi.date().iso().required(),
  }),

  getDepreciationReport: Joi.object({
    assetId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    method: Joi.string()
      .valid('STRAIGHT_LINE', 'DECLINING_BALANCE', 'UNITS_OF_PRODUCTION')
      .optional(),
  }),

  // Analytics
  getAssetPerformance: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    metrics: Joi.array().items(Joi.string()).optional(),
  }),

  getProductionAnalytics: Joi.object({
    productType: Joi.string().valid('PAPER_CRATE', 'ICE_BLOCK', 'MANUAL_PACKAGING').optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    groupBy: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').default('DAILY'),
  }),

  getMaintenanceAnalytics: Joi.object({
    assetId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    maintenanceType: Joi.string().valid('PREVENTIVE', 'CORRECTIVE', 'EMERGENCY').optional(),
  }),
};
