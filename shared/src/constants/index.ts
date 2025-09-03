// Farm Management System Constants

// General constants
export const APP_NAME = 'Kuyash Farm Management System';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Comprehensive multi-branch farm management platform';

// API Configuration
export const API_VERSION = 'v1';
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Authentication
export const JWT_EXPIRES_IN = '1h';
export const REFRESH_TOKEN_EXPIRES_IN = '7d';
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
];

// Validation Rules
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[\d\s\-\(\)]+$/;
export const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/;
export const CODE_REGEX = /^[A-Z0-9\-_]+$/;

// Business Rules
export const MIN_STOCK_THRESHOLD = 0;
export const DEFAULT_REORDER_LEVEL = 10;
export const MAX_BATCH_SIZE = 1000;

// Date Formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const TIME_FORMAT = 'HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'MMM DD, YYYY';
export const DISPLAY_DATETIME_FORMAT = 'MMM DD, YYYY HH:mm';

// Currencies
export const DEFAULT_CURRENCY = 'USD';
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR'];

// Units of Measurement
export const WEIGHT_UNITS = ['kg', 'g', 'lbs', 'oz', 'tons'];
export const LENGTH_UNITS = ['m', 'cm', 'mm', 'ft', 'in'];
export const VOLUME_UNITS = ['l', 'ml', 'gal', 'qt', 'pt'];
export const AREA_UNITS = ['m2', 'ft2', 'acres', 'hectares'];

// Notification Settings
export const NOTIFICATION_BATCH_SIZE = 100;
export const NOTIFICATION_RETRY_ATTEMPTS = 3;
export const NOTIFICATION_RETRY_DELAY = 5000; // 5 seconds

// Cache Settings
export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 60 * 60, // 1 hour
  VERY_LONG: 24 * 60 * 60, // 24 hours
};

// Rate Limiting
export const RATE_LIMITS = {
  LOGIN: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
  API: { windowMs: 15 * 60 * 1000, max: 1000 }, // 1000 requests per 15 minutes
  UPLOAD: { windowMs: 60 * 60 * 1000, max: 10 }, // 10 uploads per hour
  EXPORT: { windowMs: 60 * 60 * 1000, max: 5 }, // 5 exports per hour
};

// WebSocket Events
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  NOTIFICATION: 'notification',
  ALERT: 'alert',
  TASK_UPDATE: 'task_update',
  PRODUCTION_UPDATE: 'production_update',
  STOCK_ALERT: 'stock_alert',
  HEALTH_ALERT: 'health_alert',
  USER_ACTIVITY: 'user_activity',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Access token has expired',
  TOKEN_INVALID: 'Invalid access token',
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
  ACCOUNT_LOCKED: 'Account has been locked due to multiple failed login attempts',
  ACCOUNT_DISABLED: 'Account has been disabled',

  // Validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_DATE: 'Please enter a valid date',
  INVALID_NUMBER: 'Please enter a valid number',
  DUPLICATE_VALUE: 'This value already exists',
  MIN_LENGTH: 'Must be at least {min} characters long',
  MAX_LENGTH: 'Must not exceed {max} characters',
  MIN_VALUE: 'Must be at least {min}',
  MAX_VALUE: 'Must not exceed {max}',

  // Business Logic
  INSUFFICIENT_STOCK: 'Insufficient stock available',
  INVALID_OPERATION: 'This operation is not allowed',
  RESOURCE_IN_USE: 'This resource is currently in use and cannot be deleted',
  BATCH_NOT_FOUND: 'Batch not found or has been deleted',
  PRODUCTION_CYCLE_ACTIVE: 'Cannot modify while production cycle is active',

  // System
  INTERNAL_ERROR: 'An internal server error occurred',
  DATABASE_ERROR: 'Database operation failed',
  NETWORK_ERROR: 'Network connection error',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  FILE_UPLOAD_ERROR: 'File upload failed',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit',
  INVALID_FILE_TYPE: 'File type is not supported',

  // Resource
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  CONFLICT: 'Resource conflict detected',
  DELETED: 'Resource has been deleted',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Successfully created',
  UPDATED: 'Successfully updated',
  DELETED: 'Successfully deleted',
  SAVED: 'Successfully saved',
  SENT: 'Successfully sent',
  COMPLETED: 'Successfully completed',
  APPROVED: 'Successfully approved',
  REJECTED: 'Successfully rejected',
  IMPORTED: 'Successfully imported',
  EXPORTED: 'Successfully exported',
  BACKUP_CREATED: 'Backup successfully created',
  PASSWORD_CHANGED: 'Password successfully changed',
  EMAIL_VERIFIED: 'Email successfully verified',
  NOTIFICATION_SENT: 'Notification successfully sent',
} as const;

// Farm-specific Constants
export const POULTRY_CONSTANTS = {
  MIN_TEMPERATURE: 18, // Celsius
  MAX_TEMPERATURE: 35, // Celsius
  OPTIMAL_HUMIDITY: { min: 50, max: 70 }, // Percentage
  EGG_GRADING_WEIGHTS: {
    JUMBO: 70, // grams and above
    EXTRA_LARGE: 64,
    LARGE: 57,
    MEDIUM: 50,
    SMALL: 43,
  },
  FEEDING_TIMES_PER_DAY: { min: 2, max: 6 },
  FCR_TARGETS: {
    BROILER: { min: 1.5, max: 2.0 },
    LAYER: { min: 2.0, max: 2.5 },
  },
};

export const LIVESTOCK_CONSTANTS = {
  BODY_CONDITION_SCORE: { min: 1, max: 5 },
  PREGNANCY_PERIOD: {
    CATTLE: 283, // days
    GOAT: 150,
    SHEEP: 147,
    PIG: 114,
  },
  MILKING_FREQUENCY: { min: 1, max: 3 }, // times per day
  BREEDING_AGE: {
    CATTLE: { female: 15, male: 18 }, // months
    GOAT: { female: 8, male: 10 },
    SHEEP: { female: 8, male: 10 },
    PIG: { female: 6, male: 8 },
  },
};

export const FISHERY_CONSTANTS = {
  WATER_QUALITY_RANGES: {
    pH: { min: 6.5, max: 8.5 },
    TEMPERATURE: { min: 20, max: 30 }, // Celsius
    DISSOLVED_OXYGEN: { min: 4, max: 12 }, // mg/L
    AMMONIA: { min: 0, max: 0.5 }, // mg/L
    NITRITE: { min: 0, max: 0.1 }, // mg/L
  },
  FEEDING_RATE: { min: 2, max: 5 }, // percentage of body weight per day
  STOCKING_DENSITY: {
    TILAPIA: 10, // fish per m3
    CATFISH: 8,
    CARP: 12,
  },
  HARVEST_SIZE: {
    TILAPIA: 300, // grams
    CATFISH: 500,
    CARP: 400,
  },
};

// Export individual constants for convenience
export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];
export type SuccessMessage = (typeof SUCCESS_MESSAGES)[keyof typeof SUCCESS_MESSAGES];
export type WSEvent = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];
