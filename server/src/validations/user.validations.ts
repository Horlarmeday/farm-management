import Joi from 'joi';

export const userValidations = {
  // Common schemas
  uuidParam: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  // User Management
  createUser: Joi.object({
    // Basic Information
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    firstName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required',
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required',
    }),
    phone: Joi.string().required().messages({
      'any.required': 'Phone number is required',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
    }),

    // Employment Details
    roleId: Joi.string().uuid().required().messages({
      'any.required': 'Role ID is required',
      'string.guid': 'Role ID must be a valid UUID',
    }),
    department: Joi.string().optional(),
    hireDate: Joi.date().required().messages({
      'any.required': 'Hire date is required',
      'date.base': 'Hire date must be a valid date',
    }),
    salary: Joi.number().positive().required().messages({
      'any.required': 'Salary is required',
      'number.base': 'Salary must be a number',
      'number.positive': 'Salary must be positive',
    }),
    status: Joi.string().valid('active', 'inactive', 'pending', 'suspended').required().messages({
      'any.required': 'Status is required',
      'any.only': 'Status must be one of: active, inactive, pending, suspended',
    }),

    // Personal Information
    dateOfBirth: Joi.date().optional().messages({
      'date.base': 'Date of birth must be a valid date',
    }),
    gender: Joi.string().valid('male', 'female', 'other').optional().messages({
      'any.only': 'Gender must be one of: male, female, other',
    }),
    bio: Joi.string().max(500).optional().messages({
      'string.max': 'Bio cannot exceed 500 characters',
    }),

    // Address Information
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    postalCode: Joi.string().optional(),

    // Emergency Contact
    emergencyContact: Joi.string().optional(),

    // System Settings
    isActive: Joi.boolean().required().messages({
      'any.required': 'Active status is required',
      'boolean.base': 'Active status must be a boolean',
    }),
    isEmailVerified: Joi.boolean().optional().messages({
      'boolean.base': 'Email verification status must be a boolean',
    }),

    // Preferences
    preferences: Joi.object().optional(),
  }),

  updateUser: Joi.object({
    firstName: Joi.string().optional().max(50),
    lastName: Joi.string().optional().max(50),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional().max(20),
    role: Joi.string().valid('ADMIN', 'MANAGER', 'WORKER', 'VIEWER').optional(),
    department: Joi.string().optional().max(100),
    position: Joi.string().optional().max(100),
    hireDate: Joi.date().iso().optional(),
    salary: Joi.number().positive().optional(),
    address: Joi.string().optional().max(500),
    emergencyContact: Joi.object({
      name: Joi.string().required().max(100),
      phone: Joi.string().required().max(20),
      relationship: Joi.string().required().max(50),
    }).optional(),
    notes: Joi.string().optional().max(500),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').optional(),
  }),

  deactivateUser: Joi.object({
    reason: Joi.string().optional().max(500),
  }),

  getUsers: Joi.object({
    role: Joi.string().valid('ADMIN', 'MANAGER', 'WORKER', 'VIEWER').optional(),
    department: Joi.string().optional(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').optional(),
    search: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  // Role Management
  createRole: Joi.object({
    name: Joi.string().required().max(50),
    description: Joi.string().optional().max(500),
    permissions: Joi.array().items(Joi.string()).required(),
    isActive: Joi.boolean().default(true),
  }),

  updateRole: Joi.object({
    name: Joi.string().optional().max(50),
    description: Joi.string().optional().max(500),
    permissions: Joi.array().items(Joi.string()).optional(),
    isActive: Joi.boolean().optional(),
  }),

  getRoles: Joi.object({
    isActive: Joi.boolean().optional(),
    search: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Department Management
  createDepartment: Joi.object({
    name: Joi.string().required().max(100),
    description: Joi.string().optional().max(500),
    managerId: Joi.string().uuid().optional(),
    isActive: Joi.boolean().default(true),
  }),

  getDepartments: Joi.object({
    isActive: Joi.boolean().optional(),
    search: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Permission Management
  createPermission: Joi.object({
    name: Joi.string().required().max(50),
    description: Joi.string().optional().max(500),
    resource: Joi.string().required().max(50),
    action: Joi.string().required().max(50),
    isActive: Joi.boolean().default(true),
  }),

  updatePermission: Joi.object({
    name: Joi.string().optional().max(50),
    description: Joi.string().optional().max(500),
    resource: Joi.string().optional().max(50),
    action: Joi.string().optional().max(50),
    isActive: Joi.boolean().optional(),
  }),

  getPermissions: Joi.object({
    resource: Joi.string().optional(),
    action: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Attendance Management
  recordAttendance: Joi.object({
    userId: Joi.string().uuid().required(),
    date: Joi.date().iso().required(),
    checkIn: Joi.date().iso().required(),
    checkOut: Joi.date().iso().optional(),
    location: Joi.string().optional().max(200),
    notes: Joi.string().optional().max(500),
  }),

  updateAttendance: Joi.object({
    checkIn: Joi.date().iso().optional(),
    checkOut: Joi.date().iso().optional(),
    location: Joi.string().optional().max(200),
    notes: Joi.string().optional().max(500),
  }),

  getAttendance: Joi.object({
    userId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    status: Joi.string().valid('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Leave Management
  requestLeave: Joi.object({
    userId: Joi.string().uuid().required(),
    leaveType: Joi.string()
      .valid('ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER')
      .required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    reason: Joi.string().required().max(500),
    notes: Joi.string().optional().max(500),
  }),

  updateLeaveRequest: Joi.object({
    leaveType: Joi.string()
      .valid('ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER')
      .optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    reason: Joi.string().optional().max(500),
    notes: Joi.string().optional().max(500),
  }),

  approveLeave: Joi.object({
    status: Joi.string().valid('APPROVED', 'REJECTED').required(),
    comments: Joi.string().optional().max(500),
  }),

  approveLeaveRequest: Joi.object({
    status: Joi.string().valid('APPROVED', 'REJECTED').required(),
    comments: Joi.string().optional().max(500),
  }),

  getLeaveRequests: Joi.object({
    userId: Joi.string().uuid().optional(),
    leaveType: Joi.string()
      .valid('ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER')
      .optional(),
    status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Payroll Management
  createPayrollRecord: Joi.object({
    userId: Joi.string().uuid().required(),
    month: Joi.number().integer().min(1).max(12).required(),
    year: Joi.number().integer().min(2000).max(2100).required(),
    basicSalary: Joi.number().positive().required(),
    allowances: Joi.number().positive().optional(),
    deductions: Joi.number().positive().optional(),
    overtime: Joi.number().positive().optional(),
    bonus: Joi.number().positive().optional(),
    netSalary: Joi.number().positive().required(),
    paymentDate: Joi.date().iso().required(),
    paymentMethod: Joi.string().valid('BANK_TRANSFER', 'CASH', 'CHECK').required(),
    notes: Joi.string().optional().max(500),
  }),

  createPayroll: Joi.object({
    userId: Joi.string().uuid().required(),
    month: Joi.number().integer().min(1).max(12).required(),
    year: Joi.number().integer().min(2000).max(2100).required(),
    basicSalary: Joi.number().positive().required(),
    allowances: Joi.number().positive().optional(),
    deductions: Joi.number().positive().optional(),
    overtime: Joi.number().positive().optional(),
    bonus: Joi.number().positive().optional(),
    netSalary: Joi.number().positive().required(),
    paymentDate: Joi.date().iso().required(),
    paymentMethod: Joi.string().valid('BANK_TRANSFER', 'CASH', 'CHECK').required(),
    notes: Joi.string().optional().max(500),
  }),

  updatePayroll: Joi.object({
    basicSalary: Joi.number().positive().optional(),
    allowances: Joi.number().positive().optional(),
    deductions: Joi.number().positive().optional(),
    overtime: Joi.number().positive().optional(),
    bonus: Joi.number().positive().optional(),
    netSalary: Joi.number().positive().optional(),
    paymentDate: Joi.date().iso().optional(),
    paymentMethod: Joi.string().valid('BANK_TRANSFER', 'CASH', 'CHECK').optional(),
    notes: Joi.string().optional().max(500),
  }),

  getPayrollRecords: Joi.object({
    userId: Joi.string().uuid().optional(),
    month: Joi.number().integer().min(1).max(12).optional(),
    year: Joi.number().integer().min(2000).max(2100).optional(),
    status: Joi.string().valid('PENDING', 'APPROVED', 'PAID').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  getPayroll: Joi.object({
    userId: Joi.string().uuid().optional(),
    month: Joi.number().integer().min(1).max(12).optional(),
    year: Joi.number().integer().min(2000).max(2100).optional(),
    paymentMethod: Joi.string().valid('BANK_TRANSFER', 'CASH', 'CHECK').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Performance Management
  createPerformanceReview: Joi.object({
    userId: Joi.string().uuid().required(),
    reviewDate: Joi.date().iso().required(),
    period: Joi.string().valid('MONTHLY', 'QUARTERLY', 'ANNUAL').required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    strengths: Joi.array().items(Joi.string()).optional(),
    areasForImprovement: Joi.array().items(Joi.string()).optional(),
    goals: Joi.array().items(Joi.string()).optional(),
    comments: Joi.string().optional().max(1000),
    reviewerId: Joi.string().uuid().required(),
  }),

  recordPerformance: Joi.object({
    userId: Joi.string().uuid().required(),
    reviewDate: Joi.date().iso().required(),
    period: Joi.string().valid('MONTHLY', 'QUARTERLY', 'ANNUAL').required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    strengths: Joi.array().items(Joi.string()).optional(),
    areasForImprovement: Joi.array().items(Joi.string()).optional(),
    goals: Joi.array().items(Joi.string()).optional(),
    comments: Joi.string().optional().max(1000),
    reviewerId: Joi.string().uuid().required(),
  }),

  getPerformanceReviews: Joi.object({
    userId: Joi.string().uuid().optional(),
    period: Joi.string().valid('MONTHLY', 'QUARTERLY', 'ANNUAL').optional(),
    status: Joi.string().valid('DRAFT', 'SUBMITTED', 'APPROVED').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Task Management
  createTask: Joi.object({
    title: Joi.string().required().max(200),
    description: Joi.string().optional().max(1000),
    assignedTo: Joi.string().uuid().required(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
    dueDate: Joi.date().iso().required(),
    status: Joi.string()
      .valid('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
      .default('PENDING'),
    category: Joi.string().optional().max(100),
    estimatedHours: Joi.number().positive().optional(),
    notes: Joi.string().optional().max(500),
  }),

  updateTask: Joi.object({
    title: Joi.string().optional().max(200),
    description: Joi.string().optional().max(1000),
    assignedTo: Joi.string().uuid().optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    dueDate: Joi.date().iso().optional(),
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').optional(),
    category: Joi.string().optional().max(100),
    estimatedHours: Joi.number().positive().optional(),
    notes: Joi.string().optional().max(500),
  }),

  getTasks: Joi.object({
    assignedTo: Joi.string().uuid().optional(),
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  // Profile Management
  updateProfile: Joi.object({
    firstName: Joi.string().optional().max(50),
    lastName: Joi.string().optional().max(50),
    phone: Joi.string().optional().max(20),
    address: Joi.string().optional().max(500),
    emergencyContact: Joi.object({
      name: Joi.string().required().max(100),
      phone: Joi.string().required().max(20),
      relationship: Joi.string().required().max(50),
    }).optional(),
    notes: Joi.string().optional().max(500),
  }),

  // Analytics
  getAttendanceAnalytics: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    department: Joi.string().optional(),
    userId: Joi.string().uuid().optional(),
    groupBy: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').default('DAILY'),
  }),

  getPerformanceAnalytics: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    department: Joi.string().optional(),
    userId: Joi.string().uuid().optional(),
    period: Joi.string().valid('MONTHLY', 'QUARTERLY', 'ANNUAL').optional(),
  }),

  getLeaveAnalytics: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    department: Joi.string().optional(),
    userId: Joi.string().uuid().optional(),
    leaveType: Joi.string()
      .valid('ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER')
      .optional(),
  }),

  getPayrollAnalytics: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    department: Joi.string().optional(),
    groupBy: Joi.string().valid('MONTHLY', 'QUARTERLY', 'ANNUAL').default('MONTHLY'),
  }),
};
