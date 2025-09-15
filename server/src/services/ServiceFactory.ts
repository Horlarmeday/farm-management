import { AssetService } from './AssetService';
import { AuthService } from './AuthService';
import { FinanceService } from './FinanceService';
import { FisheryService } from './FisheryService';
import { InventoryService } from './InventoryService';
import { LivestockService } from './LivestockService';
import { NotificationService } from './NotificationService';
import { PoultryService } from './PoultryService';
import { ReportingService } from './ReportingService';
import { UserService } from './UserService';
import { IoTService } from './IoTService';
import { WebSocketService } from './websocket.service';
import { AlertEngineService } from './alert-engine.service';
import { AnalyticsService } from './analytics.service';
import { PushNotificationService } from './push-notification.service';
import { IAnalyticsService } from '../interfaces/IAnalyticsService';

/**
 * Service Factory to handle dependency injection and avoid circular dependencies
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  private services: Map<string, any> = new Map();
  private fisheryService: FisheryService | null = null;
  private inventoryService: InventoryService | null = null;
  private financeService: FinanceService | null = null;
  private notificationService: NotificationService | null = null;
  private userService: UserService | null = null;
  private authService: AuthService | null = null;
  private assetService: AssetService | null = null;
  private livestockService: LivestockService | null = null;
  private poultryService: PoultryService | null = null;
  private reportingService: ReportingService | null = null;
  private iotService: IoTService | null = null;
  private webSocketService: WebSocketService | null = null;
  private alertEngineService: AlertEngineService | null = null;
  private analyticsService: IAnalyticsService | null = null;
  private pushNotificationService: PushNotificationService | null = null;

  private constructor() {}

  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  /**
   * Get or create FisheryService with proper dependencies
   */
  getFisheryService(): FisheryService {
    if (!this.fisheryService) {
      // FisheryService constructor already uses ServiceFactory to get dependencies
      this.fisheryService = new FisheryService();
    }

    return this.fisheryService;
  }

  /**
   * Get or create InventoryService
   */
  getInventoryService(): InventoryService {
    if (!this.inventoryService) {
      const inventoryService = new InventoryService();

      // Set dependencies if other services are available
      try {
        const financeService = this.getFinanceService();
        const notificationService = this.getNotificationService();

        (inventoryService as any).financeService = financeService;
        (inventoryService as any).notificationService = notificationService;
      } catch (error) {
        console.warn('Some services not available for InventoryService:', error);
      }

      this.inventoryService = inventoryService;
    }

    return this.inventoryService;
  }

  /**
   * Get or create FinanceService
   */
  getFinanceService(): FinanceService {
    if (!this.financeService) {
      const financeService = new FinanceService();

      // Set dependencies if other services are available
      try {
        const notificationService = this.getNotificationService();

        (financeService as any).notificationService = notificationService;
      } catch (error) {
        console.warn('Some services not available for FinanceService:', error);
      }

      this.financeService = financeService;
    }

    return this.financeService;
  }

  /**
   * Get or create NotificationService
   */
  getNotificationService(): NotificationService {
    if (!this.notificationService) {
      const notificationService = new NotificationService();
      this.notificationService = notificationService;
    }
    return this.notificationService;
  }

  getUserService(): UserService {
    if (!this.userService) {
      const userService = new UserService();

      // Set dependencies if other services are available
      try {
        const notificationService = this.getNotificationService();

        (userService as any).notificationService = notificationService;
      } catch (error) {
        console.warn('Some services not available for UserService:', error);
      }

      this.userService = userService;
    }

    return this.userService;
  }

  getAuthService(): AuthService {
    if (!this.authService) {
      const authService = new AuthService();
      this.authService = authService;
    }
    return this.authService;
  }

  getAssetService(): AssetService {
    if (!this.assetService) {
      const assetService = new AssetService();
      // Inject dependencies
      const inventoryService = this.getInventoryService();
      const financeService = this.getFinanceService();
      const notificationService = this.getNotificationService();

      // Set dependencies
      (assetService as any).inventoryService = inventoryService;
      (assetService as any).financeService = financeService;
      (assetService as any).notificationService = notificationService;

      this.assetService = assetService;
    }
    return this.assetService;
  }

  getLivestockService(): LivestockService {
    if (!this.livestockService) {
      const livestockService = new LivestockService();
      // Inject dependencies
      const inventoryService = this.getInventoryService();
      const financeService = this.getFinanceService();
      const notificationService = this.getNotificationService();

      // Set dependencies
      (livestockService as any).inventoryService = inventoryService;
      (livestockService as any).financeService = financeService;
      (livestockService as any).notificationService = notificationService;

      this.livestockService = livestockService;
    }
    return this.livestockService;
  }

  getPoultryService(): PoultryService {
    if (!this.poultryService) {
      const poultryService = new PoultryService();
      // Inject dependencies
      const inventoryService = this.getInventoryService();
      const financeService = this.getFinanceService();
      const notificationService = this.getNotificationService();

      // Set dependencies
      (poultryService as any).inventoryService = inventoryService;
      (poultryService as any).financeService = financeService;
      (poultryService as any).notificationService = notificationService;

      this.poultryService = poultryService;
    }
    return this.poultryService;
  }

  getReportingService(): ReportingService {
    if (!this.reportingService) {
      const reportingService = new ReportingService();
      // Inject dependencies
      const notificationService = this.getNotificationService();
      const inventoryService = this.getInventoryService();
      const financeService = this.getFinanceService();
      const userService = this.getUserService();

      // Set dependencies
      (reportingService as any).notificationService = notificationService;
      (reportingService as any).inventoryService = inventoryService;
      (reportingService as any).financeService = financeService;
      (reportingService as any).userService = userService;

      this.reportingService = reportingService;
    }
    return this.reportingService;
  }

  getIoTService(): IoTService | null {
    if (!this.iotService) {
      // IoTService depends on WebSocketService and AlertEngineService
      const webSocketService = this.getWebSocketService();
      const alertEngineService = this.getAlertEngineService();
      
      if (!webSocketService || !alertEngineService) {
        console.warn('IoTService cannot be initialized without WebSocketService and AlertEngineService');
        return null;
      }
      
      this.iotService = new IoTService(webSocketService, alertEngineService);
    }
    return this.iotService;
  }

  getWebSocketService(): WebSocketService | null {
    if (!this.webSocketService) {
      // WebSocketService will be initialized with HTTP server in main app
      console.warn('WebSocketService not yet initialized');
      return null;
    }
    return this.webSocketService;
  }

  setWebSocketService(webSocketService: WebSocketService): void {
    this.webSocketService = webSocketService;
  }

  getPushNotificationService(): PushNotificationService {
    if (!this.pushNotificationService) {
      this.pushNotificationService = new PushNotificationService();
    }
    return this.pushNotificationService;
  }

  getAlertEngineService(): AlertEngineService | null {
    if (!this.alertEngineService) {
      // AlertEngineService depends on WebSocketService and PushNotificationService
      const webSocketService = this.getWebSocketService();
      if (!webSocketService) {
        console.warn('AlertEngineService cannot be initialized without WebSocketService');
        return null;
      }
      const pushNotificationService = this.getPushNotificationService();
      this.alertEngineService = new AlertEngineService(webSocketService, pushNotificationService);
    }
    return this.alertEngineService;
  }

  setAlertEngineService(alertEngineService: AlertEngineService): void {
    this.alertEngineService = alertEngineService;
  }

  setPushNotificationService(pushNotificationService: PushNotificationService): void {
    this.pushNotificationService = pushNotificationService;
  }

  setAnalyticsService(analyticsService: IAnalyticsService): void {
    this.analyticsService = analyticsService;
  }

  getAnalyticsService(): IAnalyticsService {
    if (!this.analyticsService) {
      this.analyticsService = new AnalyticsService();
      // Initialize the service asynchronously without blocking
      setImmediate(() => {
        this.analyticsService?.initialize().catch(error => {
          console.error('Failed to initialize AnalyticsService:', error);
        });
      });
    }
    return this.analyticsService;
  }

  /**
   * Clear all services (useful for testing)
   */
  clearServices(): void {
    this.services.clear();
    this.fisheryService = null;
    this.inventoryService = null;
    this.financeService = null;
    this.notificationService = null;
    this.userService = null;
    this.authService = null;
    this.assetService = null;
    this.livestockService = null;
    this.poultryService = null;
    this.reportingService = null;
    this.iotService = null;
    this.webSocketService = null;
    this.alertEngineService = null;
    this.analyticsService = null;
    this.pushNotificationService = null;
  }
}
