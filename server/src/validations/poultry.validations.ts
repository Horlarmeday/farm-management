import Joi from 'joi';

export const poultryValidations = {
  // Common schemas
  uuidParam: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  // Bird Batch Management
  createBirdBatch: Joi.object({
    batchCode: Joi.string().required().max(50),
    birdType: Joi.string().valid('LAYER', 'BROILER', 'BREEDER').required(),
    breed: Joi.string().required().max(100),
    initialQuantity: Joi.number().integer().positive().required(),
    arrivalDate: Joi.date().iso().required(),
    source: Joi.string().required().max(200),
    houseLocation: Joi.string().optional().max(100),
    notes: Joi.string().optional().max(500),
  }),

  updateBirdBatch: Joi.object({
    batchCode: Joi.string().optional().max(50),
    birdType: Joi.string().valid('LAYER', 'BROILER', 'BREEDER').optional(),
    breed: Joi.string().optional().max(100),
    initialQuantity: Joi.number().integer().positive().optional(),
    arrivalDate: Joi.date().iso().optional(),
    source: Joi.string().optional().max(200),
    houseLocation: Joi.string().optional().max(100),
    notes: Joi.string().optional().max(500),
    status: Joi.string().valid('ACTIVE', 'SOLD', 'CULLED', 'TRANSFERRED').optional(),
  }),

  getBirdBatches: Joi.object({
    birdType: Joi.string().valid('LAYER', 'BROILER', 'BREEDER').optional(),
    breed: Joi.string().optional(),
    status: Joi.string().valid('ACTIVE', 'SOLD', 'CULLED', 'TRANSFERRED').optional(),
    location: Joi.string().optional(),
    ageRange: Joi.string().optional(),
    search: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  // Feeding Management
  recordFeeding: Joi.object({
    batchId: Joi.string().uuid().required(),
    feedType: Joi.string().required().max(100),
    quantityKg: Joi.number().positive().required(),
    feedingTime: Joi.date().iso().required(),
    notes: Joi.string().optional().max(500),
  }),

  getFeedingLogs: Joi.object({
    batchId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    feedType: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Health Management
  recordHealthEvent: Joi.object({
    batchId: Joi.string().uuid().required(),
    healthType: Joi.string().valid('VACCINATION', 'TREATMENT', 'MORTALITY', 'ILLNESS').required(),
    date: Joi.date().iso().required(),
    description: Joi.string().required().max(500),
    quantity: Joi.number().integer().positive().optional(),
    cost: Joi.number().positive().optional(),
    notes: Joi.string().optional().max(500),
  }),

  getHealthRecords: Joi.object({
    batchId: Joi.string().uuid().optional(),
    healthType: Joi.string().valid('VACCINATION', 'TREATMENT', 'MORTALITY', 'ILLNESS').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Vaccination Management
  scheduleVaccination: Joi.object({
    batchId: Joi.string().uuid().required(),
    vaccineName: Joi.string().required().max(100),
    scheduledDate: Joi.date().iso().required(),
    dosage: Joi.string().required().max(50),
    notes: Joi.string().optional().max(500),
  }),

  getVaccinationSchedules: Joi.object({
    batchId: Joi.string().uuid().optional(),
    status: Joi.string().optional(),
    upcoming: Joi.boolean().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Egg Production
  recordEggProduction: Joi.object({
    batchId: Joi.string().uuid().required(),
    date: Joi.date().iso().required(),
    gradeA: Joi.number().integer().min(0).required(),
    gradeB: Joi.number().integer().min(0).required(),
    cracked: Joi.number().integer().min(0).required(),
    notes: Joi.string().optional().max(500),
  }),

  getEggProductionLogs: Joi.object({
    batchId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    grade: Joi.string().valid('A', 'B', 'CRACKED').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Sales Management
  recordSale: Joi.object({
    batchId: Joi.string().uuid().required(),
    itemType: Joi.string().valid('EGGS', 'BIRDS', 'MANURE').required(),
    quantity: Joi.number().positive().required(),
    unitPrice: Joi.number().positive().required(),
    saleDate: Joi.date().iso().required(),
    customerName: Joi.string().required().max(200),
    paymentMethod: Joi.string()
      .valid('CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'MOBILE_PAYMENT')
      .optional(),
    notes: Joi.string().optional().max(500),
  }),

  getSales: Joi.object({
    batchId: Joi.string().uuid().optional(),
    itemType: Joi.string().valid('EGGS', 'BIRDS', 'MANURE').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    customer: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Analytics
  getEggProductionAnalytics: Joi.object({
    batchId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    groupBy: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').default('DAILY'),
  }),

  // Reports
  getFeedConversionReport: Joi.object({
    batchId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
  }),

  getMortalityAnalysis: Joi.object({
    batchId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
  }),

  getFinancialSummary: Joi.object({
    batchId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
  }),
};
