import compression from 'compression';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';
import 'reflect-metadata';
import { ApiResponse } from '../../shared/src/types/api.types';
import { config } from './config';
import { initializeDatabase } from './config/database';
import { generalRateLimiter } from './middleware/rateLimiter.middleware';
import { AlertEngineService } from './services/alert-engine.service';
import { AnalyticsService } from './services/analytics.service';
import { PushNotificationService } from './services/push-notification.service';
import { ServiceFactory } from './services/ServiceFactory';
import { WebSocketService } from './services/websocket.service';
import { ApiError } from './utils/ApiError';
import { AppError, ErrorHandler } from './utils/error-handler';

// Import User type and extend Express Request interface
import './middleware/auth.middleware';

// Routes will be imported dynamically after service initialization

// Create Express app and HTTP server
const app: Application = express();
const server = createServer(app);

// Initialize services
let webSocketService: WebSocketService;
let pushNotificationService: PushNotificationService;
let alertEngineService: AlertEngineService;
let analyticsService: AnalyticsService;

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
app.use(compression() as any);

// Request logging
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cache control headers - prevents caching of error responses
import { cacheControl } from './middleware/cache-headers.middleware';
app.use(cacheControl);

// Apply general rate limiting
if (config.isProduction) {
  app.use(generalRateLimiter);
}

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

// Routes will be set up after service initialization in startServer function

// Initialize database and start server
const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await initializeDatabase();

    // Initialize real-time services
    webSocketService = new WebSocketService(server);
    pushNotificationService = new PushNotificationService();
    analyticsService = new AnalyticsService();
    await analyticsService.initialize();
    alertEngineService = new AlertEngineService(webSocketService, pushNotificationService);

    // Set services in ServiceFactory for dependency injection
    const serviceFactory = ServiceFactory.getInstance();
    serviceFactory.setWebSocketService(webSocketService);
    serviceFactory.setPushNotificationService(pushNotificationService);
    serviceFactory.setAnalyticsService(analyticsService);
    serviceFactory.setAlertEngineService(alertEngineService);

    console.log('✅ Real-time services initialized and registered in ServiceFactory');

    // Now import and set up routes after services are initialized
    const authRoutes = (await import('./routes/auth.routes')).default;
    const farmRoutes = (await import('./routes/farm.routes')).default;
    const fileRoutes = (await import('./routes/file.routes')).default;
    const financeRoutes = (await import('./routes/finance.routes')).default;
    const reportsRoutes = (await import('./routes/reports.routes')).default;
    const inventoryRoutes = (await import('./routes/inventory.routes')).default;
    const livestockRoutes = (await import('./routes/livestock.routes')).default;
    const notificationRoutes = (await import('./routes/notifications.routes')).default;
    const cropRoutes = (await import('./routes/crop.routes')).default;
    const iotRoutes = (await import('./routes/iot.routes')).default;
    const analyticsRoutes = (await import('./routes/analytics.routes')).default;
    const testRoutes = (await import('./routes/test.routes')).default;
    const healthRoutes = (await import('./routes/health.routes')).default;
    const fisheryRoutes = (await import('./routes/fishery.routes')).default;
    const reportingRoutes = (await import('./routes/reporting.routes')).default;
    const poultryRoutes = (await import('./routes/poultry.routes')).default;
    const assetRoutes = (await import('./routes/asset.routes')).default;
    const userRoutes = (await import('./routes/user.routes')).default;
    const invitationRoutes = (await import('./routes/invitation.routes')).default;

    app.use('/api/assets', assetRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/invitations', invitationRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/farms', farmRoutes);
    app.use('/api/files', fileRoutes);
    app.use('/api/finance', financeRoutes);
    app.use('/api/reports', reportsRoutes);
    app.use('/api/inventory', inventoryRoutes);
    app.use('/api/livestock', livestockRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/crops', cropRoutes);
    app.use('/api/iot', iotRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/test', testRoutes);
    app.use('/api/health', healthRoutes);
    app.use('/api/fishery', fisheryRoutes);
    app.use('/api/reporting', reportingRoutes);
    app.use('/api/poultry', poultryRoutes);
    console.log('✅ Routes initialized after services are ready');

    // 404 handler - must be after all routes
    app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        error: `Cannot ${req.method} ${req.originalUrl}`,
      } as ApiResponse<null>);
    });

    // Global error handler - must be last
    app.use(
      (error: Error | ApiError | AppError, req: Request, res: Response, next: NextFunction) => {
        const context = `${req.method} ${req.originalUrl}`;

        // Log error with context
        ErrorHandler.logError(error, context);

        // Convert to standardized API response
        const apiResponse = ErrorHandler.toApiResponse(error, context);

        // Determine status code
        let statusCode = 500;
        if (error instanceof AppError) {
          statusCode = error.statusCode;
        } else if (error instanceof ApiError) {
          statusCode = error.statusCode;
        } else if (error.name === 'ValidationError') {
          statusCode = 400;
        } else if (error.name === 'CastError') {
          statusCode = 400;
        } else if (error.name === 'JsonWebTokenError') {
          statusCode = 401;
        } else if (error.name === 'TokenExpiredError') {
          statusCode = 401;
        } else if (error.name === 'UnauthorizedError') {
          statusCode = 401;
        }

        // Add development-specific information
        const response = {
          ...apiResponse,
          ...(config.isDevelopment && { stack: error.stack }),
        };

        res.status(statusCode).json(response);
      },
    );

    // Start server
    const PORT = config.port || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${config.environment}`);
      console.log(
        `📊 Database: ${config.database.host}:${config.database.port}/${config.database.name}`,
      );
      console.log(`🔴 Redis: ${config.redis.host}:${config.redis.port}`);
      console.log(`🔌 WebSocket server ready`);
      console.log(`🔔 Push notification service ready`);
      console.log(`🚨 Alert engine monitoring active`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  if (alertEngineService) {
    alertEngineService.stopMonitoring();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  if (alertEngineService) {
    alertEngineService.stopMonitoring();
  }
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

export {
  alertEngineService,
  analyticsService,
  app,
  pushNotificationService,
  server,
  startServer,
  webSocketService,
};
export default app;
