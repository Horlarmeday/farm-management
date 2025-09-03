import Joi from 'joi';

export const financeValidations = {
  // Common schemas
  uuidParam: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  // Income Management
  recordIncome: Joi.object({
    incomeType: Joi.string().valid('SALES', 'SERVICE', 'RENTAL', 'INVESTMENT', 'OTHER').required(),
    amount: Joi.number().positive().required(),
    date: Joi.date().iso().required(),
    description: Joi.string().required().max(500),
    source: Joi.string().required().max(200),
    paymentMethod: Joi.string()
      .valid('CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'MOBILE_PAYMENT')
      .optional(),
    reference: Joi.string().optional().max(100),
    notes: Joi.string().optional().max(500),
  }),

  updateIncome: Joi.object({
    incomeType: Joi.string().valid('SALES', 'SERVICE', 'RENTAL', 'INVESTMENT', 'OTHER').optional(),
    amount: Joi.number().positive().optional(),
    date: Joi.date().iso().optional(),
    description: Joi.string().optional().max(500),
    source: Joi.string().optional().max(200),
    paymentMethod: Joi.string()
      .valid('CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'MOBILE_PAYMENT')
      .optional(),
    reference: Joi.string().optional().max(100),
    notes: Joi.string().optional().max(500),
  }),

  getIncome: Joi.object({
    incomeType: Joi.string().valid('SALES', 'SERVICE', 'RENTAL', 'INVESTMENT', 'OTHER').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    source: Joi.string().optional(),
    paymentMethod: Joi.string()
      .valid('CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'MOBILE_PAYMENT')
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Expense Management
  recordExpense: Joi.object({
    expenseType: Joi.string()
      .valid(
        'FEED',
        'MEDICINE',
        'LABOR',
        'UTILITIES',
        'MAINTENANCE',
        'TRANSPORT',
        'MARKETING',
        'OTHER',
      )
      .required(),
    amount: Joi.number().positive().required(),
    date: Joi.date().iso().required(),
    description: Joi.string().required().max(500),
    category: Joi.string().required().max(100),
    paymentMethod: Joi.string()
      .valid('CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'MOBILE_PAYMENT')
      .optional(),
    supplier: Joi.string().optional().max(200),
    reference: Joi.string().optional().max(100),
    notes: Joi.string().optional().max(500),
  }),

  updateExpense: Joi.object({
    expenseType: Joi.string()
      .valid(
        'FEED',
        'MEDICINE',
        'LABOR',
        'UTILITIES',
        'MAINTENANCE',
        'TRANSPORT',
        'MARKETING',
        'OTHER',
      )
      .optional(),
    amount: Joi.number().positive().optional(),
    date: Joi.date().iso().optional(),
    description: Joi.string().optional().max(500),
    category: Joi.string().optional().max(100),
    paymentMethod: Joi.string()
      .valid('CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'MOBILE_PAYMENT')
      .optional(),
    supplier: Joi.string().optional().max(200),
    reference: Joi.string().optional().max(100),
    notes: Joi.string().optional().max(500),
  }),

  getExpenses: Joi.object({
    expenseType: Joi.string()
      .valid(
        'FEED',
        'MEDICINE',
        'LABOR',
        'UTILITIES',
        'MAINTENANCE',
        'TRANSPORT',
        'MARKETING',
        'OTHER',
      )
      .optional(),
    category: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    supplier: Joi.string().optional(),
    paymentMethod: Joi.string()
      .valid('CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'MOBILE_PAYMENT')
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Budget Management
  createBudget: Joi.object({
    name: Joi.string().required().max(100),
    description: Joi.string().optional().max(500),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    totalAmount: Joi.number().positive().required(),
    category: Joi.string().required().max(100),
    notes: Joi.string().optional().max(500),
  }),

  updateBudget: Joi.object({
    name: Joi.string().optional().max(100),
    description: Joi.string().optional().max(500),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    totalAmount: Joi.number().positive().optional(),
    category: Joi.string().optional().max(100),
    notes: Joi.string().optional().max(500),
  }),

  getBudgets: Joi.object({
    category: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    status: Joi.string().valid('ACTIVE', 'COMPLETED', 'OVERDUE').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Cash Flow Management
  recordCashFlow: Joi.object({
    type: Joi.string().valid('INFLOW', 'OUTFLOW').required(),
    amount: Joi.number().positive().required(),
    date: Joi.date().iso().required(),
    description: Joi.string().required().max(500),
    category: Joi.string().required().max(100),
    account: Joi.string().required().max(100),
    reference: Joi.string().optional().max(100),
    notes: Joi.string().optional().max(500),
  }),

  getCashFlow: Joi.object({
    type: Joi.string().valid('INFLOW', 'OUTFLOW').optional(),
    category: Joi.string().optional(),
    account: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Invoice Management
  createInvoice: Joi.object({
    invoiceNumber: Joi.string().required().max(50),
    customerName: Joi.string().required().max(200),
    customerEmail: Joi.string().email().optional(),
    customerPhone: Joi.string().optional().max(20),
    issueDate: Joi.date().iso().required(),
    dueDate: Joi.date().iso().required(),
    items: Joi.array()
      .items(
        Joi.object({
          description: Joi.string().required().max(200),
          quantity: Joi.number().positive().required(),
          unitPrice: Joi.number().positive().required(),
          amount: Joi.number().positive().required(),
        }),
      )
      .min(1)
      .required(),
    subtotal: Joi.number().positive().required(),
    taxRate: Joi.number().min(0).max(100).optional(),
    taxAmount: Joi.number().positive().optional(),
    total: Joi.number().positive().required(),
    notes: Joi.string().optional().max(500),
  }),

  updateInvoice: Joi.object({
    invoiceNumber: Joi.string().optional().max(50),
    customerName: Joi.string().optional().max(200),
    customerEmail: Joi.string().email().optional(),
    customerPhone: Joi.string().optional().max(20),
    issueDate: Joi.date().iso().optional(),
    dueDate: Joi.date().iso().optional(),
    items: Joi.array()
      .items(
        Joi.object({
          description: Joi.string().required().max(200),
          quantity: Joi.number().positive().required(),
          unitPrice: Joi.number().positive().required(),
          amount: Joi.number().positive().required(),
        }),
      )
      .min(1)
      .optional(),
    subtotal: Joi.number().positive().optional(),
    taxRate: Joi.number().min(0).max(100).optional(),
    taxAmount: Joi.number().positive().optional(),
    total: Joi.number().positive().optional(),
    notes: Joi.string().optional().max(500),
  }),

  getInvoices: Joi.object({
    status: Joi.string().valid('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED').optional(),
    customerName: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Payment Management
  recordPayment: Joi.object({
    invoiceId: Joi.string().uuid().optional(),
    amount: Joi.number().positive().required(),
    paymentDate: Joi.date().iso().required(),
    paymentMethod: Joi.string()
      .valid('CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'MOBILE_PAYMENT')
      .required(),
    reference: Joi.string().optional().max(100),
    notes: Joi.string().optional().max(500),
  }),

  getPayments: Joi.object({
    invoiceId: Joi.string().uuid().optional(),
    paymentMethod: Joi.string()
      .valid('CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'MOBILE_PAYMENT')
      .optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Financial Reports
  getCashFlowReport: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    accountId: Joi.string().uuid().optional(),
    groupBy: Joi.string().valid('month', 'account').default('month'),
    includeDetails: Joi.boolean().default(false),
  }),

  getBudgetReport: Joi.object({
    budgetId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    includeDetails: Joi.boolean().default(false),
  }),

  // Analytics
  getFinancialAnalytics: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    metrics: Joi.array().items(Joi.string()).optional(),
  }),

  getExpenseAnalytics: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    groupBy: Joi.string().valid('CATEGORY', 'TYPE', 'SUPPLIER').default('CATEGORY'),
  }),

  getIncomeAnalytics: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    groupBy: Joi.string().valid('TYPE', 'SOURCE').default('TYPE'),
  }),

  // Transaction Management
  createTransaction: Joi.object({
    type: Joi.string().valid('INCOME', 'EXPENSE').required(),
    category: Joi.string().required().max(100),
    amount: Joi.number().positive().required(),
    currency: Joi.string().max(10).optional(),
    description: Joi.string().required().max(500),
    date: Joi.date().iso().required(),
    paymentMethod: Joi.string()
      .valid('CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'MOBILE_MONEY', 'OTHER')
      .required(),
    status: Joi.string().valid('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED').optional(),
    referenceNumber: Joi.string().optional().max(100),
    referenceType: Joi.string().optional().max(50),
    referenceId: Joi.string().uuid().optional(),
    accountId: Joi.string().uuid().optional(),
    notes: Joi.string().optional().max(500),
  }),

  getTransactions: Joi.object({
    type: Joi.string().valid('INCOME', 'EXPENSE').optional(),
    category: Joi.string().optional(),
    status: Joi.string().valid('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED').optional(),
    accountId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    search: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  updateTransaction: Joi.object({
    category: Joi.string().optional().max(100),
    amount: Joi.number().positive().optional(),
    description: Joi.string().optional().max(500),
    date: Joi.date().iso().optional(),
    paymentMethod: Joi.string()
      .valid('CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'MOBILE_MONEY', 'OTHER')
      .optional(),
    status: Joi.string().valid('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED').optional(),
    referenceNumber: Joi.string().optional().max(100),
    accountId: Joi.string().uuid().optional(),
    notes: Joi.string().optional().max(500),
  }),

  // Account Management
  createAccount: Joi.object({
    accountNumber: Joi.string().required().max(50),
    accountName: Joi.string().required().max(100),
    accountType: Joi.string()
      .valid('BANK', 'CASH', 'MOBILE_MONEY', 'INVESTMENT', 'OTHER')
      .required(),
    bankName: Joi.string().optional().max(100),
    branchName: Joi.string().optional().max(100),
    currentBalance: Joi.number().required(),
    currency: Joi.string().max(10).required(),
    notes: Joi.string().optional().max(500),
  }),

  getAccounts: Joi.object({
    accountType: Joi.string()
      .valid('BANK', 'CASH', 'MOBILE_MONEY', 'INVESTMENT', 'OTHER')
      .optional(),
    isActive: Joi.boolean().optional(),
    currency: Joi.string().max(10).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  updateAccount: Joi.object({
    accountName: Joi.string().optional().max(100),
    accountType: Joi.string()
      .valid('BANK', 'CASH', 'MOBILE_MONEY', 'INVESTMENT', 'OTHER')
      .optional(),
    bankName: Joi.string().optional().max(100),
    branchName: Joi.string().optional().max(100),
    currentBalance: Joi.number().optional(),
    currency: Joi.string().max(10).optional(),
    isActive: Joi.boolean().optional(),
    notes: Joi.string().optional().max(500),
  }),

  // Financial Reports & Analytics
  getProfitLossReport: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    accountId: Joi.string().uuid().optional(),
    category: Joi.string().optional(),
    groupBy: Joi.string().valid('category', 'month', 'account').optional(),
  }),

  getFinancialOverview: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    accountId: Joi.string().uuid().optional(),
  }),
};
