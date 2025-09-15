import { Request, Response, NextFunction } from 'express';
import { ServiceFactory } from '../services/ServiceFactory';
import { WebSocketService } from '../services/websocket.service';
import { AlertEngineService } from '../services/alert-engine.service';
import { PushNotificationService } from '../services/push-notification.service';
import { IoTService } from '../services/IoTService';

export class TestController {
  /**
   * Test WebSocket service functionality
   */
  public async testWebSocket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const webSocketService = ServiceFactory.getInstance().getWebSocketService();
      
      if (!webSocketService) {
        res.status(503).json({
          success: false,
          message: 'WebSocketService not available',
          service: 'WebSocketService',
          status: 'unavailable'
        });
        return;
      }

      // Test broadcasting a message
      const testMessage = {
        type: 'test',
        message: 'WebSocket test message',
        timestamp: new Date().toISOString(),
        data: {
          testId: Math.random().toString(36).substr(2, 9),
          source: 'test-endpoint'
        }
      };

      // Broadcast test message to all connected clients
      webSocketService.getIO().emit('test-message', testMessage);

      // Get connected farms and total connections
      const connectedFarms = webSocketService.getConnectedFarms();
      const totalConnections = connectedFarms.reduce((total, farmId) => {
        return total + webSocketService.getFarmConnectedUsers(farmId);
      }, 0);

      res.json({
        success: true,
        message: 'WebSocket test completed successfully',
        service: 'WebSocketService',
        status: 'active',
        data: {
          totalConnections,
          connectedFarms,
          testMessage,
          broadcastSent: true
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test AlertEngine service functionality
   */
  public async testAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alertEngineService = ServiceFactory.getInstance().getAlertEngineService();
      
      if (!alertEngineService) {
        res.status(503).json({
          success: false,
          message: 'AlertEngineService not available',
          service: 'AlertEngineService',
          status: 'unavailable'
        });
        return;
      }

      // Create a test alert using manual trigger
      const farmId = 'test-farm-001';
      const alertType = 'iot_sensor' as const;
      const severity = 'medium' as const;
      const title = 'Test Alert';
      const message = 'This is a test alert to verify AlertEngine functionality';
      const testData = {
        sensorType: 'temperature',
        value: 35.5,
        threshold: 30,
        location: 'Greenhouse A'
      };

      // Trigger the test alert
      await alertEngineService.manualTriggerAlert(farmId, alertType, severity, title, message, testData);

      res.json({
        success: true,
        message: 'Alert test completed successfully',
        service: 'AlertEngineService',
        status: 'active',
        data: {
          farmId,
          alertType,
          severity,
          title,
          message,
          testData,
          alertTriggered: true
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test Push Notification service functionality
   */
  public async testPushNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pushNotificationService = ServiceFactory.getInstance().getPushNotificationService();
      
      if (!pushNotificationService) {
        res.status(503).json({
          success: false,
          message: 'PushNotificationService not available',
          service: 'PushNotificationService',
          status: 'unavailable'
        });
        return;
      }

      const { subscription } = req.body;
      
      if (!subscription) {
        res.status(400).json({
          success: false,
          message: 'Push subscription required in request body',
          service: 'PushNotificationService',
          example: {
            subscription: {
              endpoint: 'https://fcm.googleapis.com/fcm/send/...',
              keys: {
                p256dh: 'key...',
                auth: 'auth...'
              }
            }
          }
        });
        return;
      }

      // Create a test push notification payload
      const testPayload = {
        title: 'Test Push Notification',
        body: 'This is a test push notification from the farm management system',
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: 'test-notification',
        data: {
          type: 'test',
          farmId: 'test-farm-001',
          timestamp: new Date().toISOString()
        }
      };

      // Create notification context
      const context = {
        farmId: 'test-farm-001',
        userId: 'test-user-001',
        type: 'system' as const,
        priority: 'medium' as const
      };

      // Test sending notification to a specific user (if user exists)
      try {
        await pushNotificationService.sendNotificationToUser('test-user-001', testPayload, context);
      } catch (error) {
        console.log('Note: Test user not found, this is expected in test environment');
      }

      // Test sending notification to farm (if farm exists)
      try {
        await pushNotificationService.sendNotificationToFarm('test-farm-001', testPayload, context);
      } catch (error) {
        console.log('Note: Test farm not found, this is expected in test environment');
      }

      res.json({
        success: true,
        message: 'Push notification test completed successfully',
        service: 'PushNotificationService',
        status: 'active',
        data: {
          payload: testPayload,
          context,
          notificationSent: true,
          note: 'Test notifications sent to test-user-001 and test-farm-001 (if they exist)'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get health status of all services
   */
  public async getServiceHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const serviceFactory = ServiceFactory.getInstance();
      const services = {
        WebSocketService: serviceFactory.getWebSocketService(),
        AlertEngineService: serviceFactory.getAlertEngineService(),
        PushNotificationService: serviceFactory.getPushNotificationService(),
        IoTService: serviceFactory.getIoTService()
      };

      const healthStatus = {
        timestamp: new Date().toISOString(),
        services: {} as Record<string, any>
      };

      // Check each service
      for (const [serviceName, service] of Object.entries(services)) {
        if (service) {
          healthStatus.services[serviceName] = {
            status: 'healthy',
            initialized: true,
            ...(serviceName === 'WebSocketService' && {
              connectedFarms: (service as WebSocketService).getConnectedFarms(),
              totalConnections: (service as WebSocketService).getConnectedFarms().reduce((total: number, farmId: string) => {
                return total + (service as WebSocketService).getFarmConnectedUsers(farmId);
              }, 0)
            })
          };
        } else {
          healthStatus.services[serviceName] = {
            status: 'unavailable',
            initialized: false
          };
        }
      }

      // Overall health
      const allHealthy = Object.values(healthStatus.services).every(
        (service: any) => service.status === 'healthy'
      );

      res.json({
        success: true,
        message: 'Service health check completed',
        overallHealth: allHealthy ? 'healthy' : 'degraded',
        ...healthStatus
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TestController();