import Joi from 'joi';

export const reportingValidations = {
  // Common schemas
  uuidParam: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  // Report Generation
  generateReport: Joi.object({
    reportType: Joi.string()
      .valid(
        'POULTRY',
        'LIVESTOCK',
        'FISHERY',
        'ASSETS',
        'FINANCE',
        'INVENTORY',
        'USERS',
        'COMPREHENSIVE',
      )
      .required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    format: Joi.string().valid('PDF', 'EXCEL', 'CSV', 'JSON').default('PDF'),
    filters: Joi.object().optional(),
    includeCharts: Joi.boolean().default(true),
    includeDetails: Joi.boolean().default(false),
    groupBy: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY').optional(),
  }),

  getReports: Joi.object({
    reportType: Joi.string()
      .valid(
        'POULTRY',
        'LIVESTOCK',
        'FISHERY',
        'ASSETS',
        'FINANCE',
        'INVENTORY',
        'USERS',
        'COMPREHENSIVE',
      )
      .optional(),
    status: Joi.string().valid('GENERATING', 'COMPLETED', 'FAILED').optional(),
    generatedBy: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    search: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Dashboard Analytics
  getDashboardOverview: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    modules: Joi.array().items(Joi.string()).optional(),
  }),

  getDashboardKPIs: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    modules: Joi.array().items(Joi.string()).optional(),
  }),

  getDashboardCharts: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    modules: Joi.array().items(Joi.string()).optional(),
    chartTypes: Joi.array().items(Joi.string()).optional(),
  }),

  // Module-specific Analytics
  getPoultryAnalytics: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    batchId: Joi.string().uuid().optional(),
    metrics: Joi.array().items(Joi.string()).optional(),
  }),

  getLivestockAnalytics: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    animalType: Joi.string().optional(),
    metrics: Joi.array().items(Joi.string()).optional(),
  }),

  getFisheryAnalytics: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    pondId: Joi.string().uuid().optional(),
    metrics: Joi.array().items(Joi.string()).optional(),
  }),

  getInventoryAnalytics: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    category: Joi.string().optional(),
    metrics: Joi.array().items(Joi.string()).optional(),
  }),

  getFinanceAnalytics: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    accountType: Joi.string().optional(),
    metrics: Joi.array().items(Joi.string()).optional(),
  }),

  getAssetAnalytics: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    assetType: Joi.string().optional(),
    metrics: Joi.array().items(Joi.string()).optional(),
  }),

  getUserAnalytics: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    department: Joi.string().optional(),
    metrics: Joi.array().items(Joi.string()).optional(),
  }),

  // Comparative Analytics
  getComparisonAnalytics: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    compareWith: Joi.string().optional(),
    modules: Joi.array().items(Joi.string()).optional(),
    metrics: Joi.array().items(Joi.string()).optional(),
  }),

  getTrendAnalytics: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    modules: Joi.array().items(Joi.string()).optional(),
    metrics: Joi.array().items(Joi.string()).optional(),
    period: Joi.string().optional(),
  }),

  // Export Management
  createExport: Joi.object({
    reportId: Joi.string().uuid().required(),
    format: Joi.string().valid('PDF', 'EXCEL', 'CSV', 'JSON').required(),
    includeCharts: Joi.boolean().default(true),
    includeFilters: Joi.boolean().default(true),
  }),

  getExports: Joi.object({
    status: Joi.string().valid('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED').optional(),
    format: Joi.string().valid('PDF', 'EXCEL', 'CSV', 'JSON').optional(),
    requestedBy: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Schedule Management
  createSchedule: Joi.object({
    templateId: Joi.string().uuid().required(),
    name: Joi.string().required().max(100),
    description: Joi.string().optional().max(500),
    frequency: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY').required(),
    nextRunDate: Joi.date().iso().required(),
    recipients: Joi.array().items(Joi.string().email()).required(),
    format: Joi.string().valid('PDF', 'EXCEL', 'CSV').default('PDF'),
    filters: Joi.object().optional(),
    isActive: Joi.boolean().default(true),
  }),

  getSchedules: Joi.object({
    status: Joi.string().valid('ACTIVE', 'PAUSED', 'DISABLED').optional(),
    frequency: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY').optional(),
    createdBy: Joi.string().uuid().optional(),
    templateId: Joi.string().uuid().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  updateSchedule: Joi.object({
    name: Joi.string().optional().max(100),
    description: Joi.string().optional().max(500),
    frequency: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY').optional(),
    nextRunDate: Joi.date().iso().optional(),
    recipients: Joi.array().items(Joi.string().email()).optional(),
    format: Joi.string().valid('PDF', 'EXCEL', 'CSV').optional(),
    filters: Joi.object().optional(),
    isActive: Joi.boolean().optional(),
  }),

  // Report Templates
  createReportTemplate: Joi.object({
    name: Joi.string().required().max(100),
    description: Joi.string().optional().max(500),
    reportType: Joi.string()
      .valid(
        'POULTRY',
        'LIVESTOCK',
        'FISHERY',
        'ASSETS',
        'FINANCE',
        'INVENTORY',
        'USERS',
        'COMPREHENSIVE',
      )
      .required(),
    template: Joi.object({
      sections: Joi.array()
        .items(
          Joi.object({
            title: Joi.string().required().max(100),
            type: Joi.string().valid('TABLE', 'CHART', 'SUMMARY', 'DETAILS').required(),
            dataSource: Joi.string().required().max(100),
            filters: Joi.object().optional(),
            options: Joi.object().optional(),
          }),
        )
        .required(),
      layout: Joi.object().optional(),
      styling: Joi.object().optional(),
    }).required(),
    isActive: Joi.boolean().default(true),
  }),

  updateReportTemplate: Joi.object({
    name: Joi.string().optional().max(100),
    description: Joi.string().optional().max(500),
    reportType: Joi.string()
      .valid(
        'POULTRY',
        'LIVESTOCK',
        'FISHERY',
        'ASSETS',
        'FINANCE',
        'INVENTORY',
        'USERS',
        'COMPREHENSIVE',
      )
      .optional(),
    template: Joi.object({
      sections: Joi.array()
        .items(
          Joi.object({
            title: Joi.string().required().max(100),
            type: Joi.string().valid('TABLE', 'CHART', 'SUMMARY', 'DETAILS').required(),
            dataSource: Joi.string().required().max(100),
            filters: Joi.object().optional(),
            options: Joi.object().optional(),
          }),
        )
        .required(),
      layout: Joi.object().optional(),
      styling: Joi.object().optional(),
    }).optional(),
    isActive: Joi.boolean().optional(),
  }),

  getReportTemplates: Joi.object({
    reportType: Joi.string()
      .valid(
        'POULTRY',
        'LIVESTOCK',
        'FISHERY',
        'ASSETS',
        'FINANCE',
        'INVENTORY',
        'USERS',
        'COMPREHENSIVE',
      )
      .optional(),
    isActive: Joi.boolean().optional(),
    search: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Scheduled Reports
  scheduleReport: Joi.object({
    templateId: Joi.string().uuid().required(),
    name: Joi.string().required().max(100),
    description: Joi.string().optional().max(500),
    schedule: Joi.object({
      frequency: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY').required(),
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().optional(),
      time: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      dayOfWeek: Joi.number().integer().min(0).max(6).optional(),
      dayOfMonth: Joi.number().integer().min(1).max(31).optional(),
    }).required(),
    recipients: Joi.array().items(Joi.string().email()).required(),
    format: Joi.string().valid('PDF', 'EXCEL', 'CSV').default('PDF'),
    filters: Joi.object().optional(),
    isActive: Joi.boolean().default(true),
  }),

  updateScheduledReport: Joi.object({
    name: Joi.string().optional().max(100),
    description: Joi.string().optional().max(500),
    schedule: Joi.object({
      frequency: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY').optional(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      time: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
      dayOfWeek: Joi.number().integer().min(0).max(6).optional(),
      dayOfMonth: Joi.number().integer().min(1).max(31).optional(),
    }).optional(),
    recipients: Joi.array().items(Joi.string().email()).optional(),
    format: Joi.string().valid('PDF', 'EXCEL', 'CSV').optional(),
    filters: Joi.object().optional(),
    isActive: Joi.boolean().optional(),
  }),

  getScheduledReports: Joi.object({
    templateId: Joi.string().uuid().optional(),
    frequency: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY').optional(),
    isActive: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Export Reports
  exportReport: Joi.object({
    format: Joi.string().valid('PDF', 'EXCEL', 'CSV').required(),
    includeCharts: Joi.boolean().default(true),
    includeFilters: Joi.boolean().default(true),
  }),

  // Dashboard and Analytics
  getDashboardData: Joi.object({
    modules: Joi.array().items(Joi.string()).optional(),
    dateRange: Joi.string().valid('TODAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR', 'CUSTOM').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
  }),

  getRealTimeAnalytics: Joi.object({
    modules: Joi.array().items(Joi.string()).optional(),
    metrics: Joi.array().items(Joi.string()).optional(),
  }),

  generateCustomAnalytics: Joi.object({
    dataSource: Joi.string().required(),
    metrics: Joi.array().items(Joi.string()).min(1).required(),
    dimensions: Joi.array().items(Joi.string()).optional(),
    filters: Joi.object().optional(),
    dateRange: Joi.object().optional(),
  }),

  // Pre-built Reports
  generateProductionReport: Joi.object({
    modules: Joi.array().items(Joi.string()).min(1).required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    includeAnalytics: Joi.boolean().default(true),
    groupBy: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').optional(),
  }),

  generateFinancialReport: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    includeProfit: Joi.boolean().default(true),
    includeCashFlow: Joi.boolean().default(true),
    includeExpenses: Joi.boolean().default(true),
    groupBy: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').optional(),
  }),

  generateInventoryReport: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    includeValuation: Joi.boolean().default(true),
    includeMovements: Joi.boolean().default(true),
    includeReorderAlerts: Joi.boolean().default(true),
    category: Joi.string().optional(),
  }),

  generateHRReport: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    includeAttendance: Joi.boolean().default(true),
    includePayroll: Joi.boolean().default(true),
    includeLeave: Joi.boolean().default(true),
    includePerformance: Joi.boolean().default(true),
    department: Joi.string().optional(),
  }),

  // Comprehensive Analytics
  getComprehensiveAnalytics: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    modules: Joi.array().items(Joi.string()).optional(),
    includeComparisons: Joi.boolean().default(false),
    includeForecasts: Joi.boolean().default(false),
  }),

  // Report Exports
  getReportExports: Joi.object({
    reportType: Joi.string()
      .valid(
        'POULTRY',
        'LIVESTOCK',
        'FISHERY',
        'ASSETS',
        'FINANCE',
        'INVENTORY',
        'USERS',
        'COMPREHENSIVE',
      )
      .optional(),
    format: Joi.string().valid('PDF', 'EXCEL', 'CSV', 'JSON').optional(),
    status: Joi.string().valid('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Analytics Reports
  getPoultryAnalytics: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    metrics: Joi.array().items(Joi.string()).optional(),
    groupBy: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').default('DAILY'),
    includeDetails: Joi.boolean().default(false),
  }),

  getLivestockAnalytics: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    metrics: Joi.array().items(Joi.string()).optional(),
    groupBy: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').default('DAILY'),
    includeDetails: Joi.boolean().default(false),
  }),

  getFisheryAnalytics: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    metrics: Joi.array().items(Joi.string()).optional(),
    groupBy: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').default('DAILY'),
    includeDetails: Joi.boolean().default(false),
  }),

  getAssetAnalytics: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    metrics: Joi.array().items(Joi.string()).optional(),
    groupBy: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').default('DAILY'),
    includeDetails: Joi.boolean().default(false),
  }),

  getFinancialAnalytics: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    metrics: Joi.array().items(Joi.string()).optional(),
    groupBy: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').default('DAILY'),
    includeDetails: Joi.boolean().default(false),
  }),

  getInventoryAnalytics: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    metrics: Joi.array().items(Joi.string()).optional(),
    groupBy: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').default('DAILY'),
    includeDetails: Joi.boolean().default(false),
  }),

  getUserAnalytics: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    metrics: Joi.array().items(Joi.string()).optional(),
    groupBy: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').default('DAILY'),
    includeDetails: Joi.boolean().default(false),
  }),

  // Dashboard Reports
  getDashboardData: Joi.object({
    modules: Joi.array()
      .items(
        Joi.string().valid(
          'POULTRY',
          'LIVESTOCK',
          'FISHERY',
          'ASSETS',
          'FINANCE',
          'INVENTORY',
          'USERS',
        ),
      )
      .optional(),
    timeRange: Joi.string().valid('TODAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR').default('MONTH'),
    includeCharts: Joi.boolean().default(true),
  }),

  // Custom Reports
  createCustomReport: Joi.object({
    name: Joi.string().required().max(100),
    description: Joi.string().optional().max(500),
    query: Joi.string().required().max(2000),
    parameters: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required().max(50),
          type: Joi.string().valid('STRING', 'NUMBER', 'DATE', 'BOOLEAN').required(),
          required: Joi.boolean().default(false),
          defaultValue: Joi.any().optional(),
        }),
      )
      .optional(),
    outputFormat: Joi.string().valid('TABLE', 'CHART', 'BOTH').default('TABLE'),
    isActive: Joi.boolean().default(true),
  }),

  updateCustomReport: Joi.object({
    name: Joi.string().optional().max(100),
    description: Joi.string().optional().max(500),
    query: Joi.string().optional().max(2000),
    parameters: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required().max(50),
          type: Joi.string().valid('STRING', 'NUMBER', 'DATE', 'BOOLEAN').required(),
          required: Joi.boolean().default(false),
          defaultValue: Joi.any().optional(),
        }),
      )
      .optional(),
    outputFormat: Joi.string().valid('TABLE', 'CHART', 'BOTH').optional(),
    isActive: Joi.boolean().optional(),
  }),

  getCustomReports: Joi.object({
    isActive: Joi.boolean().optional(),
    search: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  executeCustomReport: Joi.object({
    parameters: Joi.object().optional(),
    format: Joi.string().valid('JSON', 'CSV', 'EXCEL').default('JSON'),
    includeMetadata: Joi.boolean().default(false),
  }),

  // Report Permissions
  updateReportPermissions: Joi.object({
    userId: Joi.string().uuid().required(),
    permissions: Joi.array()
      .items(
        Joi.object({
          reportType: Joi.string()
            .valid(
              'POULTRY',
              'LIVESTOCK',
              'FISHERY',
              'ASSETS',
              'FINANCE',
              'INVENTORY',
              'USERS',
              'COMPREHENSIVE',
            )
            .required(),
          canView: Joi.boolean().default(true),
          canExport: Joi.boolean().default(false),
          canSchedule: Joi.boolean().default(false),
        }),
      )
      .required(),
  }),

  getReportPermissions: Joi.object({
    userId: Joi.string().uuid().optional(),
    reportType: Joi.string()
      .valid(
        'POULTRY',
        'LIVESTOCK',
        'FISHERY',
        'ASSETS',
        'FINANCE',
        'INVENTORY',
        'USERS',
        'COMPREHENSIVE',
      )
      .optional(),
  }),

  // Additional schemas for routes
  getReportTemplatesByType: Joi.object({
    type: Joi.string().valid('PRODUCTION', 'FINANCIAL', 'INVENTORY', 'HR', 'CUSTOM').optional(),
    module: Joi.string().optional(),
    createdBy: Joi.string().uuid().optional(),
    active: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  getScheduledReportsByTemplate: Joi.object({
    templateId: Joi.string().uuid().optional(),
    frequency: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY').optional(),
    status: Joi.string().valid('ACTIVE', 'PAUSED', 'CANCELLED').optional(),
    createdBy: Joi.string().uuid().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  getDashboardMetrics: Joi.object({
    modules: Joi.array().items(Joi.string()).optional(),
    metrics: Joi.array().items(Joi.string()).optional(),
  }),

  getComprehensiveReport: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    modules: Joi.array().items(Joi.string()).optional(),
    includeComparisons: Joi.boolean().optional(),
    includeForecasts: Joi.boolean().optional(),
  }),
};
