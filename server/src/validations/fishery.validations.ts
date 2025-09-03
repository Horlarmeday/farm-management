import Joi from 'joi';

export const fisheryValidations = {
  // Common schemas
  uuidParam: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  // Pond Management
  createPond: Joi.object({
    name: Joi.string().required().max(100),
    location: Joi.string().required().max(200),
    pondType: Joi.string().valid('EARTHEN', 'CONCRETE', 'PLASTIC').required(),
    sizeM2: Joi.number().positive().required(),
    maxDepthM: Joi.number().positive().required(),
    avgDepthM: Joi.number().positive().required(),
    notes: Joi.string().optional().max(500),
  }),

  updatePond: Joi.object({
    name: Joi.string().optional().max(100),
    location: Joi.string().optional().max(200),
    pondType: Joi.string().valid('EARTHEN', 'CONCRETE', 'PLASTIC').optional(),
    sizeM2: Joi.number().positive().optional(),
    maxDepthM: Joi.number().positive().optional(),
    avgDepthM: Joi.number().positive().optional(),
    notes: Joi.string().optional().max(500),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'MAINTENANCE').optional(),
  }),

  getPonds: Joi.object({
    pondType: Joi.string().valid('EARTHEN', 'CONCRETE', 'PLASTIC').optional(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'MAINTENANCE').optional(),
    location: Joi.string().optional(),
    sizeRange: Joi.string().optional(),
    search: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  // Fish Stocking
  recordStocking: Joi.object({
    pondId: Joi.string().uuid().required(),
    species: Joi.string().required().max(100),
    quantity: Joi.number().integer().positive().required(),
    averageWeight: Joi.number().positive().required(),
    stockingDate: Joi.date().iso().required(),
    source: Joi.string().required().max(200),
    costPerFish: Joi.number().positive().required(),
    notes: Joi.string().optional().max(500),
  }),

  getStockingRecords: Joi.object({
    pondId: Joi.string().uuid().optional(),
    species: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Feeding Management
  recordFeeding: Joi.object({
    pondId: Joi.string().uuid().required(),
    feedType: Joi.string().required().max(100),
    quantityKg: Joi.number().positive().required(),
    feedingTime: Joi.date().iso().required(),
    waterTemperature: Joi.number().optional(),
    notes: Joi.string().optional().max(500),
  }),

  getFeedingLogs: Joi.object({
    pondId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    feedType: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Water Quality Management
  recordWaterQuality: Joi.object({
    pondId: Joi.string().uuid().required(),
    date: Joi.date().iso().required(),
    temperature: Joi.number().required(),
    ph: Joi.number().min(0).max(14).required(),
    dissolvedOxygen: Joi.number().positive().required(),
    ammonia: Joi.number().positive().optional(),
    nitrite: Joi.number().positive().optional(),
    nitrate: Joi.number().positive().optional(),
    notes: Joi.string().optional().max(500),
  }),

  getWaterQualityLogs: Joi.object({
    pondId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Fish Sampling
  recordSampling: Joi.object({
    pondId: Joi.string().uuid().required(),
    samplingDate: Joi.date().iso().required(),
    sampleSize: Joi.number().integer().positive().required(),
    averageWeight: Joi.number().positive().required(),
    totalWeight: Joi.number().positive().required(),
    mortalityCount: Joi.number().integer().min(0).optional(),
    notes: Joi.string().optional().max(500),
  }),

  getSamplingLogs: Joi.object({
    pondId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Harvest Management
  recordHarvest: Joi.object({
    pondId: Joi.string().uuid().required(),
    harvestDate: Joi.date().iso().required(),
    quantityHarvested: Joi.number().integer().positive().required(),
    totalWeightKg: Joi.number().positive().required(),
    averageWeightG: Joi.number().positive().required(),
    harvestType: Joi.string().valid('PARTIAL', 'FULL').required(),
    notes: Joi.string().optional().max(500),
  }),

  getHarvestRecords: Joi.object({
    pondId: Joi.string().uuid().optional(),
    harvestType: Joi.string().valid('PARTIAL', 'FULL').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Sales Management
  recordSale: Joi.object({
    pondId: Joi.string().uuid().required(),
    quantitySold: Joi.number().positive().required(),
    unitPrice: Joi.number().positive().required(),
    saleDate: Joi.date().iso().required(),
    buyerName: Joi.string().required().max(200),
    paymentMethod: Joi.string()
      .valid('CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'MOBILE_PAYMENT')
      .optional(),
    notes: Joi.string().optional().max(500),
  }),

  getSales: Joi.object({
    pondId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    buyerName: Joi.string().optional(),
    paymentMethod: Joi.string()
      .valid('CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'MOBILE_PAYMENT')
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Analytics
  getGrowthAnalytics: Joi.object({
    pondId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    species: Joi.string().optional(),
  }),

  getWaterQualityAnalytics: Joi.object({
    pondId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    parameter: Joi.string()
      .valid('TEMPERATURE', 'PH', 'DISSOLVED_OXYGEN', 'AMMONIA', 'NITRITE', 'NITRATE')
      .optional(),
  }),

  getFeedingAnalytics: Joi.object({
    pondId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    feedType: Joi.string().optional(),
  }),

  getHarvestAnalytics: Joi.object({
    pondId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    harvestType: Joi.string().valid('PARTIAL', 'FULL').optional(),
  }),

  // Additional Analytics
  getFeedConversionReport: Joi.object({
    pondId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    species: Joi.string().optional(),
  }),

  getWaterQualityAnalysis: Joi.object({
    pondId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    parameter: Joi.string()
      .valid('TEMPERATURE', 'PH', 'DISSOLVED_OXYGEN', 'AMMONIA', 'NITRITE', 'NITRATE')
      .optional(),
  }),

  getSurvivalRateAnalysis: Joi.object({
    pondId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    species: Joi.string().optional(),
  }),

  getFinancialSummary: Joi.object({
    pondId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    includeCosts: Joi.boolean().default(true),
  }),
};
