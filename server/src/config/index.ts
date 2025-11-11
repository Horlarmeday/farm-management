import dotenv from 'dotenv';
import Joi from 'joi';
import path from 'path';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const serverDir = path.resolve(__dirname, '../..');
dotenv.config({ path: path.resolve(serverDir, envFile) });

// Environment variable validation schema
const envSchema = Joi.object({
  // Environment
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  HOST: Joi.string().default('localhost'),

  // Database
  DB_TYPE: Joi.string().valid('mysql', 'postgres', 'sqlite').default('mysql'),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(3306),
  DB_NAME: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').default(''),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
  DB_SSL: Joi.boolean().default(false),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),
  REDIS_DB: Joi.number().default(0),

  // JWT
  JWT_SECRET: Joi.string(),
  JWT_REFRESH_SECRET: Joi.string(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // CORS
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: Joi.boolean().default(true),
  CORS_ALLOWED_HEADERS: Joi.string().default(
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Farm-Id',
  ),
  CORS_EXPOSED_HEADERS: Joi.string().default('X-Pagination-Count'),
  CORS_METHODS: Joi.string().default('GET, POST, PUT, PATCH, DELETE, OPTIONS'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: Joi.boolean().default(false),

  // File Upload
  MAX_FILE_SIZE: Joi.number().default(10485760), // 10MB
  UPLOAD_DIR: Joi.string().default('uploads'),
  ALLOWED_FILE_TYPES: Joi.string().default('jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,csv'),

  // Email
  MAIL_HOST: Joi.string().allow('').default(''),
  MAIL_PORT: Joi.number().default(587),
  MAIL_SECURE: Joi.boolean().default(false),
  MAIL_USER: Joi.string().allow('').default(''),
  MAIL_PASSWORD: Joi.string().allow('').default(''),
  MAIL_FROM: Joi.string().allow('').default('noreply@kuyash-fms.com'),
  MAIL_FROM_NAME: Joi.string().default('Kuyash Farm Management System'),

  // Storage
  STORAGE_TYPE: Joi.string().valid('local', 'aws', 's3').default('local'),
  STORAGE_LOCAL_PATH: Joi.string().default('uploads'),
  AWS_ACCESS_KEY_ID: Joi.string().allow('').default(''),
  AWS_SECRET_ACCESS_KEY: Joi.string().allow('').default(''),
  AWS_REGION: Joi.string().default('us-east-1'),
  AWS_S3_BUCKET: Joi.string().allow('').default(''),

  // WebSocket
  WS_ENABLED: Joi.boolean().default(true),
  WS_CORS_ORIGINS: Joi.string().default('http://localhost:3000'),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
    .default('info'),
  LOG_FILE_ENABLED: Joi.boolean().default(true),
  LOG_FILE_PATH: Joi.string().default('logs'),
  LOG_MAX_SIZE: Joi.string().default('20m'),
  LOG_MAX_FILES: Joi.string().default('14d'),

  // Security
  BCRYPT_ROUNDS: Joi.number().default(12),
  SESSION_SECRET: Joi.string(),
  ENCRYPTION_KEY: Joi.string().required().min(32),
  HELMET_ENABLED: Joi.boolean().default(true),
  TRUST_PROXY: Joi.boolean().default(false),

  // API Documentation
  SWAGGER_ENABLED: Joi.boolean().default(true),
  SWAGGER_PATH: Joi.string().default('/api-docs'),

  // Monitoring
  HEALTH_CHECK_ENABLED: Joi.boolean().default(true),
  METRICS_ENABLED: Joi.boolean().default(true),

  // Backup
  BACKUP_ENABLED: Joi.boolean().default(false),
  BACKUP_SCHEDULE: Joi.string().default('0 2 * * *'),
  BACKUP_RETENTION_DAYS: Joi.number().default(30),

  // Notifications
  NOTIFICATION_ENABLED: Joi.boolean().default(true),
  SMS_PROVIDER: Joi.string().allow('').default(''),
  SMS_API_KEY: Joi.string().allow('').default(''),
  SMS_FROM: Joi.string().allow('').default(''),

  // Push Notifications (VAPID)
  VAPID_PUBLIC_KEY: Joi.string().allow('').default(''),
  VAPID_PRIVATE_KEY: Joi.string().allow('').default(''),
  VAPID_SUBJECT: Joi.string().default('mailto:admin@farmmanagement.com'),

  // Feature Flags
  FEATURE_AUDIT_LOGS: Joi.boolean().default(true),
  FEATURE_REAL_TIME_UPDATES: Joi.boolean().default(true),
  FEATURE_ADVANCED_ANALYTICS: Joi.boolean().default(true),
  FEATURE_MOBILE_APP: Joi.boolean().default(true),

  // Development
  DEV_SEED_DATA: Joi.boolean().default(true),
  DEV_RESET_DB: Joi.boolean().default(false),
  DEV_MOCK_SERVICES: Joi.boolean().default(false),
}).unknown(true);

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Configuration object
export const config = {
  // Environment
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  host: envVars.HOST,
  isDevelopment: envVars.NODE_ENV === 'development',
  isProduction: envVars.NODE_ENV === 'production',
  isTest: envVars.NODE_ENV === 'test',
  environment: envVars.NODE_ENV,

  // Database
  database: {
    type: envVars.DB_TYPE as 'mysql' | 'postgres' | 'sqlite',
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    name: envVars.DB_NAME,
    username: envVars.DB_USERNAME,
    password: envVars.DB_PASSWORD,
    synchronize: envVars.DB_SYNCHRONIZE,
    logging: envVars.DB_LOGGING,
    ssl: envVars.DB_SSL,
  },

  // Redis
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD || undefined,
    db: envVars.REDIS_DB,
  },

  // JWT
  jwt: {
    secret: envVars.JWT_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
    // Aliases for backward compatibility
    accessTokenSecret: envVars.JWT_SECRET,
    refreshTokenSecret: envVars.JWT_REFRESH_SECRET,
    accessTokenExpiry: envVars.JWT_EXPIRES_IN,
    refreshTokenExpiry: envVars.JWT_REFRESH_EXPIRES_IN,
    issuer: envVars.JWT_ISSUER || 'kuyash-fms',
    audience: envVars.JWT_AUDIENCE || 'kuyash-api',
  },

  // CORS
  cors: {
    origins: envVars.CORS_ORIGINS.split(',').map((origin: string) => origin.trim()),
    credentials: envVars.CORS_CREDENTIALS,
    allowedHeaders: envVars.CORS_ALLOWED_HEADERS.split(',').map((header: string) => header.trim()),
    methods: envVars.CORS_METHODS.split(',').map((method: string) => method.trim()),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    maxRequests: envVars.RATE_LIMIT_MAX_REQUESTS,
    skipSuccessfulRequests: envVars.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS,
  },

  // File Upload
  upload: {
    maxFileSize: envVars.MAX_FILE_SIZE,
    uploadDir: path.resolve(envVars.UPLOAD_DIR),
    allowedFileTypes: envVars.ALLOWED_FILE_TYPES.split(',').map((type: string) => type.trim()),
  },

  // Email
  email: {
    host: envVars.MAIL_HOST,
    port: envVars.MAIL_PORT,
    secure: envVars.MAIL_SECURE,
    user: envVars.MAIL_USER,
    password: envVars.MAIL_PASSWORD,
    from: envVars.MAIL_FROM,
    fromName: envVars.MAIL_FROM_NAME,
  },

  // Storage
  storage: {
    type: envVars.STORAGE_TYPE as 'local' | 'aws' | 's3',
    localPath: path.resolve(envVars.STORAGE_LOCAL_PATH),
    aws: {
      accessKeyId: envVars.AWS_ACCESS_KEY_ID,
      secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
      region: envVars.AWS_REGION,
      bucket: envVars.AWS_S3_BUCKET,
    },
  },

  // WebSocket
  websocket: {
    enabled: envVars.WS_ENABLED,
    corsOrigins: envVars.WS_CORS_ORIGINS.split(',').map((origin: string) => origin.trim()),
  },

  // Security
  security: {
    bcryptRounds: envVars.BCRYPT_ROUNDS,
    sessionSecret: envVars.SESSION_SECRET,
    encryptionKey: envVars.ENCRYPTION_KEY,
    helmetEnabled: envVars.HELMET_ENABLED,
    trustProxy: envVars.TRUST_PROXY,
  },

  // Logging
  logging: {
    level: envVars.LOG_LEVEL,
    fileEnabled: envVars.LOG_FILE_ENABLED,
    filePath: envVars.LOG_FILE_PATH,
    maxSize: envVars.LOG_MAX_SIZE,
    maxFiles: envVars.LOG_MAX_FILES,
  },

  // API Documentation
  swagger: {
    enabled: envVars.SWAGGER_ENABLED,
    path: envVars.SWAGGER_PATH,
  },

  // Monitoring
  monitoring: {
    healthCheckEnabled: envVars.HEALTH_CHECK_ENABLED,
    metricsEnabled: envVars.METRICS_ENABLED,
  },

  // Backup
  backup: {
    enabled: envVars.BACKUP_ENABLED,
    schedule: envVars.BACKUP_SCHEDULE,
    retentionDays: envVars.BACKUP_RETENTION_DAYS,
  },

  // Notifications
  notifications: {
    enabled: envVars.NOTIFICATION_ENABLED,
    sms: {
      provider: envVars.SMS_PROVIDER,
      apiKey: envVars.SMS_API_KEY,
      from: envVars.SMS_FROM,
    },
    vapid: {
      publicKey: envVars.VAPID_PUBLIC_KEY,
      privateKey: envVars.VAPID_PRIVATE_KEY,
      subject: envVars.VAPID_SUBJECT,
    },
  },

  // Feature Flags
  features: {
    auditLogs: envVars.FEATURE_AUDIT_LOGS,
    realTimeUpdates: envVars.FEATURE_REAL_TIME_UPDATES,
    advancedAnalytics: envVars.FEATURE_ADVANCED_ANALYTICS,
    mobileApp: envVars.FEATURE_MOBILE_APP,
  },

  // Development
  development: {
    seedData: envVars.DEV_SEED_DATA,
    resetDb: envVars.DEV_RESET_DB,
    mockServices: envVars.DEV_MOCK_SERVICES,
  },
};

// Validate required production settings
if (config.isProduction) {
  const productionRequiredFields = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'SESSION_SECRET',
    'DB_HOST',
    'DB_USERNAME',
    'DB_PASSWORD',
    'MAIL_HOST',
    'MAIL_USER',
    'MAIL_PASSWORD',
    'VAPID_PUBLIC_KEY',
    'VAPID_PRIVATE_KEY',
  ];

  const missingFields = productionRequiredFields.filter(
    (field) => !process.env[field] || process.env[field] === 'your-secret-key-here',
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Production environment requires the following environment variables: ${missingFields.join(', ')}`,
    );
  }
}

export default config;
