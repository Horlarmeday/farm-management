import Joi from 'joi';

export const livestockValidations = {
  // Common schemas
  uuidParam: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  // Animal Management
  createAnimal: Joi.object({
    tagNumber: Joi.string().required().max(50),
    species: Joi.string().valid('cow', 'goat', 'sheep', 'pig', 'chicken').required(),
    breed: Joi.string().required().max(100),
    gender: Joi.string().valid('male', 'female').required(),
    dateOfBirth: Joi.date().iso().required(),
    acquisitionDate: Joi.date().iso().required(),
    source: Joi.string().required().max(200),
    location: Joi.string().optional().max(100),
    notes: Joi.string().optional().max(500).allow(''),
  }),

  updateAnimal: Joi.object({
    tagNumber: Joi.string().optional().max(50),
    species: Joi.string().valid('cow', 'goat', 'sheep', 'pig', 'chicken').optional(),
    breed: Joi.string().optional().max(100),
    gender: Joi.string().valid('male', 'female').optional(),
    dateOfBirth: Joi.date().iso().optional(),
    acquisitionDate: Joi.date().iso().optional(),
    source: Joi.string().optional().max(200),
    location: Joi.string().optional().max(100),
    notes: Joi.string().optional().max(500),
    status: Joi.string().valid('active', 'sold', 'deceased', 'transferred').optional(),
  }),

  getAnimals: Joi.object({
    species: Joi.string().valid('cow', 'goat', 'sheep', 'pig', 'chicken').optional(),
    breed: Joi.string().optional(),
    status: Joi.string().valid('active', 'sold', 'deceased', 'transferred').optional(),
    gender: Joi.string().valid('male', 'female').optional(),
    ageRange: Joi.string().optional(),
    location: Joi.string().optional(),
    search: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  // Health Management
  recordHealthEvent: Joi.object({
    animalId: Joi.string().uuid().required(),
    healthType: Joi.string().valid('VACCINATION', 'TREATMENT', 'CHECKUP', 'ILLNESS').required(),
    date: Joi.date().iso().required(),
    description: Joi.string().required().max(500),
    cost: Joi.number().positive().optional(),
    notes: Joi.string().optional().max(500),
  }),

  getHealthRecords: Joi.object({
    animalId: Joi.string().uuid().optional(),
    healthType: Joi.string().valid('VACCINATION', 'TREATMENT', 'CHECKUP', 'ILLNESS').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Vaccination Management
  scheduleVaccination: Joi.object({
    animalId: Joi.string().uuid().required(),
    vaccineName: Joi.string().required().max(100),
    scheduledDate: Joi.date().iso().required(),
    dosage: Joi.string().required().max(50),
    notes: Joi.string().optional().max(500),
  }),

  getVaccinationSchedules: Joi.object({
    animalId: Joi.string().uuid().optional(),
    status: Joi.string().optional(),
    upcoming: Joi.boolean().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Feeding Management
  recordFeeding: Joi.object({
    animalId: Joi.string().uuid().required(),
    feedType: Joi.string().required().max(100),
    quantityKg: Joi.number().positive().required(),
    feedingTime: Joi.date().iso().required(),
    notes: Joi.string().optional().max(500),
  }),

  getFeedingLogs: Joi.object({
    animalId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    feedType: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Breeding Management
  recordBreeding: Joi.object({
    femaleId: Joi.string().uuid().required(),
    maleId: Joi.string().uuid().optional(),
    breedingDate: Joi.date().iso().required(),
    breedingMethod: Joi.string().valid('NATURAL', 'ARTIFICIAL_INSEMINATION').required(),
    notes: Joi.string().optional().max(500),
  }),

  getBreedingRecords: Joi.object({
    animalId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    status: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Birth Management
  recordBirth: Joi.object({
    motherId: Joi.string().uuid().required(),
    birthDate: Joi.date().iso().required(),
    offspring: Joi.array()
      .items(
        Joi.object({
          tagNumber: Joi.string().required().max(50),
          gender: Joi.string().valid('MALE', 'FEMALE').required(),
          birthWeight: Joi.number().positive().optional(),
          notes: Joi.string().optional().max(500),
        }),
      )
      .min(1)
      .required(),
  }),

  // Production Management
  recordProduction: Joi.object({
    animalId: Joi.string().uuid().required(),
    productionType: Joi.string().valid('MILK', 'MEAT', 'WOOL', 'EGGS').required(),
    date: Joi.date().iso().required(),
    quantity: Joi.number().positive().required(),
    unit: Joi.string().required().max(20),
    notes: Joi.string().optional().max(500),
  }),

  getProductionLogs: Joi.object({
    animalId: Joi.string().uuid().optional(),
    productionType: Joi.string().valid('MILK', 'MEAT', 'WOOL', 'EGGS').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Sales Management
  recordSale: Joi.object({
    animalId: Joi.string().uuid().optional(),
    itemType: Joi.string().valid('ANIMAL', 'MILK', 'MEAT', 'WOOL', 'EGGS').required(),
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
    animalId: Joi.string().uuid().optional(),
    itemType: Joi.string().valid('ANIMAL', 'MILK', 'MEAT', 'WOOL', 'EGGS').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    customer: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Analytics
  getHealthAnalytics: Joi.object({
    animalId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    healthType: Joi.string().valid('VACCINATION', 'TREATMENT', 'CHECKUP', 'ILLNESS').optional(),
  }),

  getProductionAnalytics: Joi.object({
    animalId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    productionType: Joi.string().valid('MILK', 'MEAT', 'WOOL', 'EGGS').optional(),
  }),

  getBreedingAnalytics: Joi.object({
    animalId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
  }),

  // Reports
  getFinancialSummary: Joi.object({
    animalId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
  }),
};
