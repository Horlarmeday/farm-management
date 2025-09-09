import Joi from 'joi';

export const reportingValidations = {
  // Dashboard validations
  getDashboardOverview: {
    query: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
    }),
  },

  getDashboardKPIs: {
    query: Joi.object({
      period: Joi.string().valid('day', 'week', 'month', 'quarter', 'year').optional(),
    }),
  },

  getDashboardModules: {
    query: Joi.object({
      includeStats: Joi.boolean().optional(),
    }),
  },

  getRevenueTrend: {
    query: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      groupBy: Joi.string().valid('day', 'week', 'month').optional(),
    }),
  },

  getProductionDistribution: {
    query: Joi.object({
      moduleType: Joi.string().valid('poultry', 'livestock', 'fishery').optional(),
    }),
  },

  getQuickStats: {
    query: Joi.object({
      period: Joi.string().valid('today', 'week', 'month', 'year').optional(),
    }),
  },

  getRecentActivities: {
    query: Joi.object({
      limit: Joi.number().integer().min(1).max(50).optional(),
      type: Joi.string().valid('financial', 'production', 'inventory').optional(),
    }),
  },

  // Report generation validations
  generateReport: {
    body: Joi.object({
      reportType: Joi.string().valid('dashboard', 'production', 'financial', 'inventory', 'hr', 'custom').required(),
      reportName: Joi.string().min(1).max(100).required(),
      parameters: Joi.object().optional(),
    }),
  },

  getReports: {
    query: Joi.object({
      reportType: Joi.string().valid('dashboard', 'production', 'financial', 'inventory', 'hr', 'custom').optional(),
      status: Joi.string().valid('generating', 'completed', 'failed').optional(),
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
    }),
  },

  getReportById: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  },

  deleteReport: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  },

  // Analytics validations
  getPoultryAnalytics: {
    query: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      batchId: Joi.string().uuid().optional(),
    }),
  },

  getLivestockAnalytics: {
    query: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      animalId: Joi.string().uuid().optional(),
    }),
  },

  getFisheryAnalytics: {
    query: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      pondId: Joi.string().uuid().optional(),
    }),
  },

  getInventoryAnalytics: {
    query: Joi.object({
      category: Joi.string().optional(),
      lowStock: Joi.boolean().optional(),
    }),
  },

  getFinanceAnalytics: {
    query: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      category: Joi.string().optional(),
    }),
  },

  getAssetAnalytics: {
    query: Joi.object({
      assetType: Joi.string().optional(),
      status: Joi.string().valid('active', 'maintenance', 'retired').optional(),
    }),
  },

  getUserAnalytics: {
    query: Joi.object({
      department: Joi.string().optional(),
      role: Joi.string().optional(),
    }),
  },

  // Export validations
  createExport: {
    body: Joi.object({
      reportId: Joi.string().uuid().required(),
      format: Joi.string().valid('pdf', 'excel', 'csv').required(),
    }),
  },

  getExports: {
    query: Joi.object({
      status: Joi.string().valid('pending', 'processing', 'completed', 'failed').optional(),
      format: Joi.string().valid('pdf', 'excel', 'csv').optional(),
    }),
  },

  getExportById: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  },

  downloadExport: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  },

  // Schedule validations
  createSchedule: {
    body: Joi.object({
      templateId: Joi.string().uuid().required(),
      frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly').required(),
      recipients: Joi.array().items(Joi.string().email()).required(),
    }),
  },

  getSchedules: {
    query: Joi.object({
      isActive: Joi.boolean().optional(),
      frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly').optional(),
    }),
  },

  getScheduleById: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  },

  updateSchedule: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly').optional(),
      isActive: Joi.boolean().optional(),
    }),
  },

  // Template validations
  createReportTemplate: {
    body: Joi.object({
      name: Joi.string().min(1).max(100).required(),
      reportType: Joi.string().valid('dashboard', 'production', 'financial', 'inventory', 'hr', 'custom').required(),
      parameters: Joi.object().optional(),
    }),
  },

  getReportTemplates: {
    query: Joi.object({
      reportType: Joi.string().valid('dashboard', 'production', 'financial', 'inventory', 'hr', 'custom').optional(),
      isActive: Joi.boolean().optional(),
    }),
  },

  getReportTemplateById: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  },

  updateReportTemplate: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      name: Joi.string().min(1).max(100).optional(),
      isActive: Joi.boolean().optional(),
    }),
  },
};