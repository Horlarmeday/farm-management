/**
 * Query key factory for consistent React Query key patterns
 * This ensures proper cache invalidation and organization
 */

// Base query keys
export const queryKeys = {
  // Authentication
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    permissions: () => [...queryKeys.auth.all, 'permissions'] as const,
  },

  // Farms
  farms: {
    all: ['farms'] as const,
    lists: () => [...queryKeys.farms.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...queryKeys.farms.lists(), { params }] as const,
    details: () => [...queryKeys.farms.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.farms.details(), id] as const,
    userFarms: () => [...queryKeys.farms.all, 'user-farms'] as const,
    users: (farmId: string, params?: Record<string, any>) =>
      [...queryKeys.farms.all, 'users', farmId, { params }] as const,
    user: (farmId: string, userId: string) =>
      [...queryKeys.farms.all, 'user', farmId, userId] as const,
    invitations: (farmId: string, params?: Record<string, any>) =>
      [...queryKeys.farms.all, 'invitations', farmId, { params }] as const,
    invitation: (id: string) => [...queryKeys.farms.all, 'invitation', id] as const,
    pendingInvitations: () => [...queryKeys.farms.all, 'pending-invitations'] as const,
    stats: (farmId: string) => [...queryKeys.farms.all, 'stats', farmId] as const,
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    overview: () => [...queryKeys.dashboard.all, 'overview'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    kpis: () => [...queryKeys.dashboard.all, 'kpis'] as const,
    modules: () => [...queryKeys.dashboard.all, 'modules'] as const,
    revenueTrend: (period: string) =>
      [...queryKeys.dashboard.all, 'revenue-trend', period] as const,
    productionDistribution: () => [...queryKeys.dashboard.all, 'production-distribution'] as const,
    quickStats: () => [...queryKeys.dashboard.all, 'quick-stats'] as const,
    activities: (limit?: number) => [...queryKeys.dashboard.all, 'activities', { limit }] as const,
    alerts: (limit?: number) => [...queryKeys.dashboard.all, 'alerts', { limit }] as const,
    tasks: () => [...queryKeys.dashboard.all, 'tasks'] as const,
  },

  // Inventory
  inventory: {
    all: ['inventory'] as const,
    lists: () => [...queryKeys.inventory.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.inventory.lists(), { filters }] as const,
    details: () => [...queryKeys.inventory.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.inventory.details(), id] as const,
    categories: () => [...queryKeys.inventory.all, 'categories'] as const,
    lowStock: () => [...queryKeys.inventory.all, 'low-stock'] as const,
    transactions: (params?: Record<string, any>) =>
      [...queryKeys.inventory.all, 'transactions', { params }] as const,
    // New query keys for inventory hooks
    items: (params?: Record<string, any>) =>
      [...queryKeys.inventory.all, 'items', { params }] as const,
    item: (id: string) => [...queryKeys.inventory.all, 'item', id] as const,
    stats: (params?: Record<string, any>) =>
      [...queryKeys.inventory.all, 'stats', { params }] as const,
    alerts: (params?: Record<string, any>) =>
      [...queryKeys.inventory.all, 'alerts', { params }] as const,
    suppliers: (params?: Record<string, any>) =>
      [...queryKeys.inventory.all, 'suppliers', { params }] as const,
    supplier: (id: string) => [...queryKeys.inventory.all, 'supplier', id] as const,
    purchaseOrders: (params?: Record<string, any>) =>
      [...queryKeys.inventory.all, 'purchase-orders', { params }] as const,
    purchaseOrder: (id: string) => [...queryKeys.inventory.all, 'purchase-order', id] as const,
    adjustments: (params?: Record<string, any>) =>
      [...queryKeys.inventory.all, 'adjustments', { params }] as const,
    valuation: () => [...queryKeys.inventory.all, 'valuation'] as const,
    summary: () => [...queryKeys.inventory.all, 'summary'] as const,
    expiring: (days: number) => [...queryKeys.inventory.all, 'expiring', days] as const,
  },

  // Finance
  finance: {
    all: ['finance'] as const,
    transactions: (params?: Record<string, any>) =>
      [...queryKeys.finance.all, 'transactions', { params }] as const,
    transaction: (id: string) => [...queryKeys.finance.all, 'transaction', id] as const,
    accounts: (params?: Record<string, any>) =>
      [...queryKeys.finance.all, 'accounts', { params }] as const,
    account: (id: string) => [...queryKeys.finance.all, 'account', id] as const,
    accountBalance: (id: string) => [...queryKeys.finance.all, 'account-balance', id] as const,
    invoices: (params?: Record<string, any>) =>
      [...queryKeys.finance.all, 'invoices', { params }] as const,
    invoice: (id: string) => [...queryKeys.finance.all, 'invoice', id] as const,
    overdueInvoices: () => [...queryKeys.finance.all, 'overdue-invoices'] as const,
    payments: (params?: Record<string, any>) =>
      [...queryKeys.finance.all, 'payments', { params }] as const,
    payment: (id: string) => [...queryKeys.finance.all, 'payment', id] as const,
    receipts: (params?: Record<string, any>) =>
      [...queryKeys.finance.all, 'receipts', { params }] as const,
    receipt: (id: string) => [...queryKeys.finance.all, 'receipt', id] as const,
    budgets: (params?: Record<string, any>) =>
      [...queryKeys.finance.all, 'budgets', { params }] as const,
    budget: (id: string) => [...queryKeys.finance.all, 'budget', id] as const,
    budgetPerformance: (id: string) =>
      [...queryKeys.finance.all, 'budget-performance', id] as const,
    stats: (params?: Record<string, any>) =>
      [...queryKeys.finance.all, 'stats', { params }] as const,
    incomeByCategory: (params?: Record<string, any>) =>
      [...queryKeys.finance.all, 'income-by-category', { params }] as const,
    expensesByCategory: (params?: Record<string, any>) =>
      [...queryKeys.finance.all, 'expenses-by-category', { params }] as const,
    monthlyTrend: (params?: Record<string, any>) =>
      [...queryKeys.finance.all, 'monthly-trend', { params }] as const,
    cashFlow: (params?: Record<string, any>) =>
      [...queryKeys.finance.all, 'cash-flow', { params }] as const,
    reports: (params?: Record<string, any>) =>
      [...queryKeys.finance.all, 'reports', { params }] as const,
    report: (id: string) => [...queryKeys.finance.all, 'report', id] as const,
    dashboardSummary: () => [...queryKeys.finance.all, 'dashboard-summary'] as const,
    categories: () => [...queryKeys.finance.all, 'categories'] as const,
    revenue: () => [...queryKeys.finance.all, 'revenue'] as const,
    expenses: () => [...queryKeys.finance.all, 'expenses'] as const,
    summary: () => [...queryKeys.finance.all, 'summary'] as const,
  },

  // Poultry
  poultry: {
    all: ['poultry'] as const,
    batches: (params?: Record<string, any>) =>
      [...queryKeys.poultry.all, 'batches', { params }] as const,
    batch: (id: string) => [...queryKeys.poultry.all, 'batch', id] as const,
    feedingLogs: (batchId: string, params?: Record<string, any>) =>
      [...queryKeys.poultry.all, 'feeding-logs', batchId, { params }] as const,
    healthRecords: (batchId: string, params?: Record<string, any>) =>
      [...queryKeys.poultry.all, 'health-records', batchId, { params }] as const,
    eggProduction: (batchId: string, params?: Record<string, any>) =>
      [...queryKeys.poultry.all, 'egg-production', batchId, { params }] as const,
    sales: (batchId: string, params?: Record<string, any>) =>
      [...queryKeys.poultry.all, 'sales', batchId, { params }] as const,
    stats: (params?: Record<string, any>) =>
      [...queryKeys.poultry.all, 'stats', { params }] as const,
    performance: (batchId: string, params?: Record<string, any>) =>
      [...queryKeys.poultry.all, 'performance', batchId, { params }] as const,
    productionSummary: (params?: Record<string, any>) =>
      [...queryKeys.poultry.all, 'production-summary', { params }] as const,
    dashboardSummary: () => [...queryKeys.poultry.all, 'dashboard-summary'] as const,
  },

  // Livestock
  livestock: {
    all: ['livestock'] as const,
    animals: (params?: Record<string, any>) =>
      [...queryKeys.livestock.all, 'animals', { params }] as const,
    animal: (id: string) => [...queryKeys.livestock.all, 'animal', id] as const,
    healthRecords: (animalId?: string, params?: Record<string, any>) =>
      [...queryKeys.livestock.all, 'health-records', animalId, { params }] as const,
    breedingRecords: (params?: Record<string, any>) =>
      [...queryKeys.livestock.all, 'breeding-records', { params }] as const,
    productionLogs: (animalId?: string, params?: Record<string, any>) =>
      [...queryKeys.livestock.all, 'production-logs', animalId, { params }] as const,
    feedingLogs: (animalId?: string, params?: Record<string, any>) =>
      [...queryKeys.livestock.all, 'feeding-logs', animalId, { params }] as const,
    weightRecords: (animalId?: string, params?: Record<string, any>) =>
      [...queryKeys.livestock.all, 'weight-records', animalId, { params }] as const,
    sales: (params?: Record<string, any>) =>
      [...queryKeys.livestock.all, 'sales', { params }] as const,
    pastures: (params?: Record<string, any>) =>
      [...queryKeys.livestock.all, 'pastures', { params }] as const,
    pasture: (id: string) => [...queryKeys.livestock.all, 'pasture', id] as const,
    grazingLogs: (pastureId?: string, params?: Record<string, any>) =>
      [...queryKeys.livestock.all, 'grazing-logs', pastureId, { params }] as const,
    stats: (params?: Record<string, any>) =>
      [...queryKeys.livestock.all, 'stats', { params }] as const,
    performanceReport: (params?: Record<string, any>) =>
      [...queryKeys.livestock.all, 'performance-report', { params }] as const,
    productionSummary: (params?: Record<string, any>) =>
      [...queryKeys.livestock.all, 'production-summary', { params }] as const,
    breedingReport: (params?: Record<string, any>) =>
      [...queryKeys.livestock.all, 'breeding-report', { params }] as const,
    healthReport: (params?: Record<string, any>) =>
      [...queryKeys.livestock.all, 'health-report', { params }] as const,
    dashboardSummary: () => [...queryKeys.livestock.all, 'dashboard-summary'] as const,
  },

  // Fishery
  fishery: {
    all: ['fishery'] as const,
    ponds: (params?: Record<string, any>) =>
      [...queryKeys.fishery.all, 'ponds', { params }] as const,
    pond: (id: string) => [...queryKeys.fishery.all, 'pond', id] as const,
    stockingLogs: (pondId?: string, params?: Record<string, any>) =>
      [...queryKeys.fishery.all, 'stocking-logs', pondId, { params }] as const,
    stockingLog: (id: string) => [...queryKeys.fishery.all, 'stocking-log', id] as const,
    waterQualityLogs: (pondId?: string, params?: Record<string, any>) =>
      [...queryKeys.fishery.all, 'water-quality-logs', pondId, { params }] as const,
    waterQualityLog: (id: string) => [...queryKeys.fishery.all, 'water-quality-log', id] as const,
    feedingLogs: (pondId?: string, params?: Record<string, any>) =>
      [...queryKeys.fishery.all, 'feeding-logs', pondId, { params }] as const,
    feedingLog: (id: string) => [...queryKeys.fishery.all, 'feeding-log', id] as const,
    samplingLogs: (pondId?: string, params?: Record<string, any>) =>
      [...queryKeys.fishery.all, 'sampling-logs', pondId, { params }] as const,
    samplingLog: (id: string) => [...queryKeys.fishery.all, 'sampling-log', id] as const,
    harvestLogs: (pondId?: string, params?: Record<string, any>) =>
      [...queryKeys.fishery.all, 'harvest-logs', pondId, { params }] as const,
    harvestLog: (id: string) => [...queryKeys.fishery.all, 'harvest-log', id] as const,
    maintenanceLogs: (pondId?: string, params?: Record<string, any>) =>
      [...queryKeys.fishery.all, 'maintenance-logs', pondId, { params }] as const,
    sales: (params?: Record<string, any>) =>
      [...queryKeys.fishery.all, 'sales', { params }] as const,
    mortality: (pondId?: string, params?: Record<string, any>) =>
      [...queryKeys.fishery.all, 'mortality', pondId, { params }] as const,
    stats: (params?: Record<string, any>) =>
      [...queryKeys.fishery.all, 'stats', { params }] as const,
    pondPerformance: (pondId: string, params?: Record<string, any>) =>
      [...queryKeys.fishery.all, 'pond-performance', pondId, { params }] as const,
    feedConversionReport: (params?: Record<string, any>) =>
      [...queryKeys.fishery.all, 'feed-conversion-report', { params }] as const,
    productionSummary: (params?: Record<string, any>) =>
      [...queryKeys.fishery.all, 'production-summary', { params }] as const,
    financialReport: (params?: Record<string, any>) =>
      [...queryKeys.fishery.all, 'financial-report', { params }] as const,
    dashboardSummary: () => [...queryKeys.fishery.all, 'dashboard-summary'] as const,
  },

  // Assets
  assets: {
    all: ['assets'] as const,
    lists: () => [...queryKeys.assets.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...queryKeys.assets.lists(), { params }] as const,
    details: () => [...queryKeys.assets.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.assets.details(), id] as const,
    equipment: (params?: Record<string, any>) =>
      [...queryKeys.assets.all, 'equipment', { params }] as const,
    machinery: (params?: Record<string, any>) =>
      [...queryKeys.assets.all, 'machinery', { params }] as const,
    maintenanceLogs: (assetId?: string, params?: Record<string, any>) =>
      [...queryKeys.assets.all, 'maintenance-logs', assetId, { params }] as const,
    maintenanceLog: (id: string) => [...queryKeys.assets.all, 'maintenance-log', id] as const,
    usageLogs: (assetId?: string, params?: Record<string, any>) =>
      [...queryKeys.assets.all, 'usage-logs', assetId, { params }] as const,
    depreciation: (assetId: string) => [...queryKeys.assets.all, 'depreciation', assetId] as const,
    performance: (assetId: string, params?: Record<string, any>) =>
      [...queryKeys.assets.all, 'performance', assetId, { params }] as const,
    locations: (params?: Record<string, any>) =>
      [...queryKeys.assets.all, 'locations', { params }] as const,
    byLocation: (location: string, params?: Record<string, any>) =>
      [...queryKeys.assets.all, 'by-location', location, { params }] as const,
    stats: (params?: Record<string, any>) =>
      [...queryKeys.assets.all, 'stats', { params }] as const,
    dashboardSummary: () => [...queryKeys.assets.all, 'dashboard-summary'] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.users.details(), id] as const,
    departments: () => [...queryKeys.users.all, 'departments'] as const,
    roles: () => [...queryKeys.users.all, 'roles'] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
    count: () => [...queryKeys.notifications.all, 'count'] as const,
  },

  // Reports
  reports: {
    all: ['reports'] as const,
    analytics: () => [...queryKeys.reports.all, 'analytics'] as const,
    exports: () => [...queryKeys.reports.all, 'exports'] as const,
    dashboard: () => [...queryKeys.reports.all, 'dashboard'] as const,
    financial: () => [...queryKeys.reports.all, 'financial'] as const,
    production: () => [...queryKeys.reports.all, 'production'] as const,
  },
} as const;

// Helper functions for cache invalidation
export const invalidateQueries = {
  // Invalidate all queries for a module
  auth: () => queryKeys.auth.all,
  farms: () => queryKeys.farms.all,
  dashboard: () => queryKeys.dashboard.all,
  inventory: () => queryKeys.inventory.all,
  finance: () => queryKeys.finance.all,
  poultry: () => queryKeys.poultry.all,
  livestock: () => queryKeys.livestock.all,
  fishery: () => queryKeys.fishery.all,
  assets: () => queryKeys.assets.all,
  users: () => queryKeys.users.all,
  notifications: () => queryKeys.notifications.all,
  reports: () => queryKeys.reports.all,

  // Invalidate specific query patterns
  inventoryLists: () => queryKeys.inventory.lists(),
  farmLists: () => queryKeys.farms.lists(),
  farmData: () => [queryKeys.farms.all, queryKeys.auth.all],
  financialData: () => [queryKeys.finance.all, queryKeys.dashboard.all],
  productionData: () => [
    queryKeys.poultry.all,
    queryKeys.livestock.all,
    queryKeys.fishery.all,
    queryKeys.dashboard.all,
  ],
};

// Type helpers
export type QueryKey = typeof queryKeys;
export type InvalidateKey = keyof typeof invalidateQueries;
