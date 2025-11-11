import { AppDataSource } from '../config/database';
import { Farm } from '../entities/Farm';
import { IoTSensor } from '../entities/IoTSensor';
import { SensorReading } from '../entities/SensorReading';
import { Prediction } from '../entities/Prediction';
import { WebSocketService, FarmAlert } from './websocket.service';
import { PushNotificationService, NotificationContext } from './push-notification.service';
import { MoreThan, LessThan, Between } from 'typeorm';
import { ErrorHandler, ValidationError, DatabaseError } from '../utils/error-handler';

export interface AlertRule {
  id: string;
  farmId: string;
  name: string;
  type: 'sensor_threshold' | 'weather_warning' | 'livestock_health' | 'crop_disease' | 'equipment_failure' | 'financial_threshold';
  conditions: AlertCondition[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  active: boolean;
  cooldownMinutes: number;
  actions: AlertAction[];
}

export interface AlertCondition {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between' | 'contains';
  value: any;
  duration?: number; // minutes
}

export interface AlertAction {
  type: 'websocket' | 'push_notification' | 'email' | 'sms';
  enabled: boolean;
  config?: any;
}

export interface AlertTrigger {
  ruleId: string;
  farmId: string;
  triggeredBy: string; // sensor reading, manual input, etc.
  data: any;
  timestamp: Date;
}

class AlertEngineService {
  private webSocketService: WebSocketService;
  private pushNotificationService: PushNotificationService | null;
  private alertRules: Map<string, AlertRule> = new Map();
  private alertCooldowns: Map<string, Date> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(
    webSocketService: WebSocketService,
    pushNotificationService: PushNotificationService | null
  ) {
    this.webSocketService = webSocketService;
    this.pushNotificationService = pushNotificationService;
    this.initializeDefaultRules();
    this.startMonitoring();
  }

  async initialize(): Promise<void> {
    return ErrorHandler.handleDatabaseOperation(async () => {
      this.initializeDefaultRules();
      this.startMonitoring();
      console.log('Alert Engine Service initialized successfully');
    }, 'AlertEngineService.initialize');
  }

  // Initialize default alert rules for farms
  private initializeDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'temp_high_critical',
        farmId: '*', // applies to all farms
        name: 'Critical Temperature Alert',
        type: 'sensor_threshold',
        conditions: [
          {
            field: 'temperature',
            operator: 'gt',
            value: 40,
            duration: 5
          }
        ],
        severity: 'critical',
        active: true,
        cooldownMinutes: 30,
        actions: [
          { type: 'websocket', enabled: true },
          { type: 'push_notification', enabled: true }
        ]
      },
      {
        id: 'humidity_low_warning',
        farmId: '*',
        name: 'Low Humidity Warning',
        type: 'sensor_threshold',
        conditions: [
          {
            field: 'humidity',
            operator: 'lt',
            value: 30,
            duration: 15
          }
        ],
        severity: 'medium',
        active: true,
        cooldownMinutes: 60,
        actions: [
          { type: 'websocket', enabled: true },
          { type: 'push_notification', enabled: true }
        ]
      },
      {
        id: 'soil_moisture_critical',
        farmId: '*',
        name: 'Critical Soil Moisture Level',
        type: 'sensor_threshold',
        conditions: [
          {
            field: 'soil_moisture',
            operator: 'lt',
            value: 20,
            duration: 10
          }
        ],
        severity: 'high',
        active: true,
        cooldownMinutes: 45,
        actions: [
          { type: 'websocket', enabled: true },
          { type: 'push_notification', enabled: true }
        ]
      }
    ];

    defaultRules.forEach(rule => {
      this.alertRules.set(rule.id, rule);
    });
  }

  // Start monitoring for alert conditions
  private startMonitoring(): void {
    // Monitor every 2 minutes
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.checkAlertConditions();
      } catch (error) {
        ErrorHandler.logError(error as Error, 'AlertEngineService.startMonitoring.interval');
      }
    }, 2 * 60 * 1000);

    console.log('🚨 Alert engine monitoring started');
  }

  /**
   * Stops the alert monitoring process
   * Clears the monitoring interval and logs the stop event
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🚨 Alert engine monitoring stopped');
    }
  }

  // Check all alert conditions
  private async checkAlertConditions(): Promise<void> {
    return ErrorHandler.handleDatabaseOperation(async () => {
      const activeRules = Array.from(this.alertRules.values()).filter(rule => rule.active);
      
      for (const rule of activeRules) {
        await this.evaluateRule(rule);
      }
    }, 'AlertEngineService.checkAlertConditions');
  }

  // Evaluate a specific alert rule
  private async evaluateRule(rule: AlertRule): Promise<void> {
    return ErrorHandler.handleDatabaseOperation(async () => {
      // Check cooldown
      const cooldownKey = `${rule.farmId}:${rule.id}`;
      const lastTriggered = this.alertCooldowns.get(cooldownKey);
      if (lastTriggered) {
        const cooldownEnd = new Date(lastTriggered.getTime() + rule.cooldownMinutes * 60 * 1000);
        if (new Date() < cooldownEnd) {
          return; // Still in cooldown
        }
      }

      // Get farms to check
      const farms = rule.farmId === '*' 
        ? await this.getAllActiveFarms()
        : [rule.farmId];

      // Process farms in parallel for better performance
      const farmPromises = farms.map(async (farmId) => {
        try {
          const triggered = await this.checkRuleConditions(rule, farmId);
          if (triggered) {
            await this.triggerAlert(rule, farmId, triggered);
            this.alertCooldowns.set(`${farmId}:${rule.id}`, new Date());
          }
        } catch (error) {
          ErrorHandler.logError(error as Error, `AlertEngineService.evaluateRule.farm-${farmId}`);
        }
      });

      await Promise.all(farmPromises);
    }, `AlertEngineService.evaluateRule.${rule.id}`);
  }

  // Check if rule conditions are met
  private async checkRuleConditions(rule: AlertRule, farmId: string): Promise<any | null> {
    try {
      return await ErrorHandler.handleDatabaseOperation(async () => {
        switch (rule.type) {
          case 'sensor_threshold':
            return await this.checkSensorThresholds(rule, farmId);
          case 'weather_warning':
            return await this.checkWeatherConditions(rule, farmId);
          case 'livestock_health':
            return await this.checkLivestockHealth(rule, farmId);
          case 'crop_disease':
            return await this.checkCropDisease(rule, farmId);
          case 'equipment_failure':
            return await this.checkEquipmentFailure(rule, farmId);
          case 'financial_threshold':
            return await this.checkFinancialThresholds(rule, farmId);
          default:
            return null;
        }
      }, `AlertEngineService.checkRuleConditions.${rule.id}`);
    } catch (error) {
      ErrorHandler.logError(error as Error, `AlertEngineService.checkRuleConditions.${rule.id}`);
      return null;
    }
  }

  // Check sensor threshold conditions
  private async checkSensorThresholds(rule: AlertRule, farmId: string): Promise<any | null> {
    const sensorRepo = AppDataSource.getRepository(IoTSensor);
    const readingRepo = AppDataSource.getRepository(SensorReading);

    // Process all conditions in parallel
    const conditionPromises = rule.conditions.map(async (condition) => {
      const sensors = await sensorRepo.find({
        where: {
          farmId,
          type: condition.field as any,
          active: true
        }
      });

      // Process all sensors for this condition in parallel
      const sensorPromises = sensors.map(async (sensor) => {
        const timeThreshold = new Date(Date.now() - (condition.duration || 5) * 60 * 1000);
        
        const readings = await readingRepo.find({
          where: {
            sensorId: sensor.id,
            readingTime: MoreThan(timeThreshold)
          },
          order: { readingTime: 'DESC' },
          take: 10
        });

        if (readings.length === 0) return null;

        const latestReading = readings[0];
        const conditionMet = this.evaluateCondition(condition, latestReading.value);

        if (conditionMet) {
          return {
            sensor,
            reading: latestReading,
            condition,
            allReadings: readings
          };
        }
        return null;
      });

      const sensorResults = await Promise.all(sensorPromises);
      return sensorResults.find(result => result !== null) || null;
    });

    const conditionResults = await Promise.all(conditionPromises);
    return conditionResults.find(result => result !== null) || null;
  }

  // Check weather conditions (placeholder)
  private async checkWeatherConditions(rule: AlertRule, farmId: string): Promise<any | null> {
    // This would integrate with weather APIs
    // For now, return null (no weather alerts)
    return null;
  }

  // Check livestock health (placeholder)
  private async checkLivestockHealth(rule: AlertRule, farmId: string): Promise<any | null> {
    // This would check livestock health indicators
    // For now, return null
    return null;
  }

  // Check crop disease (placeholder)
  private async checkCropDisease(rule: AlertRule, farmId: string): Promise<any | null> {
    // This would check crop health indicators
    // For now, return null
    return null;
  }

  // Check equipment failure (placeholder)
  private async checkEquipmentFailure(rule: AlertRule, farmId: string): Promise<any | null> {
    // This would check equipment status
    // For now, return null
    return null;
  }

  // Check financial thresholds (placeholder)
  private async checkFinancialThresholds(rule: AlertRule, farmId: string): Promise<any | null> {
    // This would check financial metrics
    // For now, return null
    return null;
  }

  // Evaluate a single condition
  private evaluateCondition(condition: AlertCondition, value: number): boolean {
    switch (condition.operator) {
      case 'gt':
        return value > (condition.value as number);
      case 'lt':
        return value < (condition.value as number);
      case 'eq':
        return value === (condition.value as number);
      case 'gte':
        return value >= (condition.value as number);
      case 'lte':
        return value <= (condition.value as number);
      case 'between':
        const range = condition.value as number[];
        return value >= range[0] && value <= range[1];
      default:
        return false;
    }
  }

  // Trigger an alert
  private async triggerAlert(rule: AlertRule, farmId: string, triggerData: any): Promise<void> {
    await ErrorHandler.handleServiceCall(async () => {
      const alert: FarmAlert = {
        id: `${rule.id}_${farmId}_${Date.now()}`,
        farmId,
        type: this.mapRuleTypeToAlertType(rule.type),
        severity: rule.severity,
        title: rule.name,
        message: this.generateAlertMessage(rule, triggerData),
        data: triggerData,
        timestamp: new Date()
      };

      console.log(`🚨 Alert triggered: ${alert.title} for farm ${farmId}`);

      // Execute alert actions
      for (const action of rule.actions) {
        if (!action.enabled) continue;

        try {
          switch (action.type) {
            case 'websocket':
              this.webSocketService!.broadcastAlert(alert);
              break;
            case 'push_notification':
              if (this.pushNotificationService) {
                await this.sendPushNotificationAlert(alert);
              } else {
                console.warn('⚠️ Push notification service not available, skipping push notification');
              }
              break;
            // Add email and SMS actions here
          }
        } catch (error) {
          ErrorHandler.logError(error as Error, `AlertEngineService.triggerAlert.action-${action.type}`);
        }
      }
    }, 'AlertEngineService.triggerAlert');
  }

  // Send push notification for alert
  private async sendPushNotificationAlert(alert: FarmAlert): Promise<void> {
    try {
      const notificationContext: NotificationContext = {
        farmId: alert.farmId,
        userId: '', // Will be set for each user
        type: alert.type,
        priority: alert.severity,
        data: alert.data
      };

      const payload = {
        title: alert.title,
        body: alert.message,
        icon: '/icons/alert-icon.png',
        badge: '/icons/badge-icon.png',
        tag: `farm-alert-${alert.type}`,
        requireInteraction: alert.severity === 'critical',
        data: {
          alertId: alert.id,
          farmId: alert.farmId,
          type: alert.type,
          severity: alert.severity,
          timestamp: alert.timestamp.toISOString()
        },
        actions: [
          {
            action: 'view',
            title: 'View Details'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      };

      if (!this.pushNotificationService) {
        console.warn('⚠️ Push notification service not available');
        return;
      }

      if (alert.severity === 'critical') {
        // Send critical alert to all farm users
        const farmUsers = await this.getFarmUsers(alert.farmId);
        await this.pushNotificationService.sendCriticalAlert(
          farmUsers.map(user => user.id),
          payload,
          notificationContext
        );
      } else {
        // Send regular notification to farm
        await this.pushNotificationService.sendNotificationToFarm(
          alert.farmId,
          payload,
          notificationContext
        );
      }
    } catch (error) {
      console.error('Error sending push notification alert:', error);
    }
  }

  // Generate alert message
  private generateAlertMessage(rule: AlertRule, triggerData: any): string {
    switch (rule.type) {
      case 'sensor_threshold':
        const sensor = triggerData.sensor;
        const reading = triggerData.reading;
        return `${sensor.type} sensor at ${sensor.location || 'unknown location'} reading ${reading.value}${reading.unit}. Immediate attention required.`;
      default:
        return `Alert condition met for ${rule.name}. Please check your farm status.`;
    }
  }

  // Map rule type to alert type
  private mapRuleTypeToAlertType(ruleType: string): FarmAlert['type'] {
    switch (ruleType) {
      case 'sensor_threshold':
        return 'iot_sensor';
      case 'weather_warning':
        return 'weather';
      case 'livestock_health':
        return 'livestock';
      case 'crop_disease':
        return 'crop';
      case 'equipment_failure':
        return 'equipment';
      case 'financial_threshold':
        return 'financial';
      default:
        return 'iot_sensor';
    }
  }

  // Get all active farms
  private async getAllActiveFarms(): Promise<string[]> {
    try {
      const farmRepo = AppDataSource.getRepository(Farm);
      const farms = await farmRepo.find({
        select: ['id'],
        where: { isActive: true }
      });
      return farms.map(farm => farm.id);
    } catch (error) {
      console.error('Error getting active farms:', error);
      return [];
    }
  }

  // Get farm users
  private async getFarmUsers(farmId: string): Promise<any[]> {
    try {
      const farmRepo = AppDataSource.getRepository(Farm);
      const farm = await farmRepo.findOne({
        where: { id: farmId },
        relations: ['farmUsers', 'farmUsers.user']
      });
      return farm?.farmUsers?.map(farmUser => farmUser.user) || [];
    } catch (error) {
      console.error('Error getting farm users:', error);
      return [];
    }
  }

  /**
   * Adds a custom alert rule to the monitoring system
   * @param rule - The alert rule configuration to add
   */
  public addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    console.log(`✅ Alert rule added: ${rule.name}`);
  }

  /**
   * Removes an alert rule from the monitoring system
   * @param ruleId - The unique identifier of the rule to remove
   */
  public removeAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId);
    console.log(`❌ Alert rule removed: ${ruleId}`);
  }

  /**
   * Retrieves all currently configured alert rules
   * @returns Array of all alert rules in the system
   */
  public getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  /**
   * Manually triggers an alert for testing purposes
   * @param farmId - The ID of the farm to trigger the alert for
   * @param alertType - The type of alert to trigger
   * @param severity - The severity level of the alert
   * @param title - The alert title
   * @param message - The alert message
   * @param data - Optional additional data for the alert
   */
  public async manualTriggerAlert(
    farmId: string,
    alertType: FarmAlert['type'],
    severity: FarmAlert['severity'],
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    await ErrorHandler.handleServiceCall(async () => {
      const alert: FarmAlert = {
        id: `manual_${farmId}_${Date.now()}`,
        farmId,
        type: alertType,
        severity,
        title,
        message,
        data,
        timestamp: new Date()
      };

      try {
        this.webSocketService.broadcastAlert(alert);
        await this.sendPushNotificationAlert(alert);
      } catch (error) {
        ErrorHandler.logError(error as Error, 'AlertEngineService.manualTriggerAlert');
        throw error;
      }
    }, 'AlertEngineService.manualTriggerAlert');
  }
}

export { AlertEngineService };