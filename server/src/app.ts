import { config } from '@/config';
import { initializeDatabase } from '@/config/database';
import { generalRateLimiter } from '@/middleware/rateLimiter.middleware';
import { ApiError } from '@/utils/ApiError';
import { ApiResponse } from '@kuyash/shared';
import compression from 'compression';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import 'reflect-metadata';

// Import routes
import assetRoutes from '@/routes/asset.routes';
import authRoutes from '@/routes/auth.routes';
import financeRoutes from '@/routes/finance.routes';
import fisheryRoutes from '@/routes/fishery.routes';
import inventoryRoutes from '@/routes/inventory.routes';
import livestockRoutes from '@/routes/livestock.routes';
import notificationRoutes from '@/routes/notification.routes';
import poultryRoutes from '@/routes/poultry.routes';
import reportingRoutes from '@/routes/reporting.routes';
import userRoutes from '@/routes/user.routes';

// Create Express app
const app: Application = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.cors.origins,
    credentials: config.cors.credentials,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
  }),
);

// Compression middleware
app.use(compression());

// Request logging
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiting
app.use(generalRateLimiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    data: {
      timestamp: new Date().toISOString(),
      environment: config.environment,
      version: process.env.npm_package_version || '1.0.0',
    },
  } as ApiResponse<any>);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/poultry', poultryRoutes);
app.use('/api/livestock', livestockRoutes);
app.use('/api/fishery', fisheryRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportingRoutes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`,
  } as ApiResponse<null>);
});

// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let stack: string | undefined;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  }

  // Include stack trace in development
  if (config.isDevelopment) {
    stack = error.stack;
  }

  // Log error
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, {
    error: error.message,
    stack: error.stack,
    user: req.user?.id,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(statusCode).json({
    success: false,
    message,
    error: error.message,
    stack,
    timestamp: new Date().toISOString(),
  } as ApiResponse<null>);
});

// Initialize database and start server
const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await initializeDatabase();

    // Start server
    const PORT = config.port || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${config.environment}`);
      console.log(
        `📊 Database: ${config.database.host}:${config.database.port}/${config.database.name}`,
      );
      console.log(`🔴 Redis: ${config.redis.host}:${config.redis.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

export { app, startServer };
export default app;
