import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { AppDataSource } from '../config/database';
import { IoTSensor, SensorType } from '../entities/IoTSensor';
import { SensorReading } from '../entities/SensorReading';
import { Farm } from '../entities/Farm';
import { WebSocketService } from './websocket.service';
import { AlertEngineService } from './alert-engine.service';
import { ErrorHandler, NotFoundError, ValidationError, ConflictError } from '../utils/error-handler';

export interface DeviceRegistrationData {
  deviceId: string;
  farmId: string;
  type: SensorType;
  location: string;
  configuration: {
    minThreshold?: number;
    maxThreshold?: number;
    unit: string;
    calibrationOffset?: number;
    alertsEnabled: boolean;
  };
}

export interface SensorDataPayload {
  deviceId: string;
  value: number;
  unit: string;
  timestamp?: Date;
  metadata?: {
    batteryLevel?: number;
    signalStrength?: number;
    temperature?: number;
    humidity?: number;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface SensorCalibrationData {
  sensorId: string;
  calibrationOffset: number;
  referenceValue: number;
  calibratedAt: Date;
}

export interface DeviceStatus {
  sensorId: string;
  isOnline: boolean;
  lastSeen: Date;
  batteryLevel?: number;
  signalStrength?: number;
  errorCount: number;
  lastError?: string;
}

export class IoTService {
  private sensorRepository: Repository<IoTSensor>;
  private readingRepository: Repository<SensorReading>;
  private farmRepository: Repository<Farm>;
  private webSocketService: WebSocketService;
  private alertEngineService: AlertEngineService;
  private deviceStatusMap: Map<string, DeviceStatus> = new Map();
  private dataProcessingQueue: SensorDataPayload[] = [];
  private processingInterval: NodeJS.Timeout | null = null;

  /**
   * Initializes the IoT Service with required dependencies
   * @param webSocketService - Service for real-time communication
   * @param alertEngineService - Service for handling alerts
   */
  constructor(
    webSocketService: WebSocketService,
    alertEngineService: AlertEngineService
  ) {
    this.sensorRepository = AppDataSource.getRepository(IoTSensor);
    this.readingRepository = AppDataSource.getRepository(SensorReading);
    this.farmRepository = AppDataSource.getRepository(Farm);
    this.webSocketService = webSocketService;
    this.alertEngineService = alertEngineService;
    
    this.startDataProcessing();
  }

  /**
   * Registers a new IoT device/sensor in the system
   * @param data - Device registration information including farm ID, type, and configuration
   * @returns Promise resolving to the created IoT sensor entity
   * @throws {NotFoundError} When the specified farm doesn't exist
   * @throws {ConflictError} When device ID is already registered
   */
  async registerDevice(data: DeviceRegistrationData): Promise<IoTSensor> {
    // Check if farm exists
    const farm = await ErrorHandler.handleDatabaseOperation(
      () => this.farmRepository.findOne({ where: { id: data.farmId } }),
      'registerDevice - farm lookup'
    );
    ErrorHandler.validateExists(farm, 'Farm');

    // Check for duplicate device ID
    const existingSensor = await ErrorHandler.handleDatabaseOperation(
      () => this.sensorRepository.findOne({ where: { deviceId: data.deviceId } }),
      'registerDevice - device lookup'
    );
    if (existingSensor) {
      throw new ConflictError('Device ID already registered');
    }

    // Create new sensor
    const sensor = this.sensorRepository.create({
      deviceId: data.deviceId,
      farmId: data.farmId,
      type: data.type,
      location: data.location,
      configuration: data.configuration,
      active: true,
      lastSeen: new Date()
    });

    const savedSensor = await ErrorHandler.handleDatabaseOperation(
      () => this.sensorRepository.save(sensor),
      'registerDevice - save sensor'
    );

    // Initialize device status
    this.deviceStatusMap.set(savedSensor.id, {
      sensorId: savedSensor.id,
      isOnline: true,
      lastSeen: new Date(),
      errorCount: 0
    });

    // Broadcast device registration
    this.webSocketService.broadcastSensorData({
      farmId: data.farmId,
      sensorId: savedSensor.id,
      type: data.type,
      value: 0,
      unit: data.configuration.unit,
      timestamp: new Date(),
      metadata: { event: 'device_registered' }
    });

    return savedSensor;
  }

  /**
   * Updates the configuration of an existing IoT device
   * @param sensorId - Unique identifier of the sensor to update
   * @param configuration - Partial configuration object with updated settings
   * @returns Promise resolving to the updated IoT sensor entity
   * @throws {NotFoundError} When the specified sensor doesn't exist
   */
  async updateDeviceConfiguration(
    sensorId: string,
    configuration: Partial<IoTSensor['configuration']>
  ): Promise<IoTSensor> {
    const sensor = await ErrorHandler.handleDatabaseOperation(
      () => this.sensorRepository.findOne({ where: { id: sensorId } }),
      'updateDeviceConfiguration - sensor lookup'
    );
    ErrorHandler.validateExists(sensor, 'Sensor');

    if (!sensor) {
      throw new NotFoundError('Sensor not found');
    }

    sensor.configuration = { 
      ...sensor.configuration, 
      ...configuration,
      unit: configuration?.unit || sensor.configuration?.unit || 'units'
    };
    sensor.updatedAt = new Date();

    return await ErrorHandler.handleDatabaseOperation(
      () => this.sensorRepository.save(sensor),
      'updateDeviceConfiguration - save sensor'
    );
  }

  /**
   * Deactivates an IoT device, stopping data collection and removing from monitoring
   * @param sensorId - Unique identifier of the sensor to deactivate
   * @throws {NotFoundError} When the specified sensor doesn't exist
   */
  async deactivateDevice(sensorId: string): Promise<void> {
    const sensor = await ErrorHandler.handleDatabaseOperation(
      () => this.sensorRepository.findOne({ where: { id: sensorId } }),
      'deactivateDevice - sensor lookup'
    );
    ErrorHandler.validateExists(sensor, 'Sensor');

    if (!sensor) {
      throw new NotFoundError('Sensor not found');
    }

    sensor.active = false;
    sensor.updatedAt = new Date();
    await ErrorHandler.handleDatabaseOperation(
      () => this.sensorRepository.save(sensor),
      'deactivateDevice - save sensor'
    );

    // Remove from status map
    this.deviceStatusMap.delete(sensorId);

    // Broadcast device deactivation
    this.webSocketService.broadcastSensorData({
      farmId: sensor.farmId,
      sensorId: sensor.id,
      type: sensor.type,
      value: 0,
      unit: sensor.configuration?.unit || 'units',
      timestamp: new Date(),
      metadata: { event: 'device_deactivated' }
    });
  }

  /**
   * Processes incoming sensor data, applies calibration, and triggers alerts if needed
   * @param data - Sensor data payload containing device ID, value, and metadata
   * @returns Promise resolving to the created sensor reading entity
   * @throws {NotFoundError} When the specified device doesn't exist or is inactive
   */
  async processSensorData(data: SensorDataPayload): Promise<SensorReading> {
    // Find sensor by device ID
    const sensor = await ErrorHandler.handleDatabaseOperation(
      () => this.sensorRepository.findOne({
        where: { deviceId: data.deviceId, active: true }
      }),
      'processSensorData - sensor lookup'
    );
    ErrorHandler.validateExists(sensor, 'Active sensor');

    if (!sensor) {
      throw new NotFoundError('Sensor not found');
    }

    // Apply calibration if configured
    let calibratedValue = data.value;
    if (sensor.configuration?.calibration_offset) {
      calibratedValue += sensor.configuration.calibration_offset;
    }

    // Create sensor reading
    const reading = this.readingRepository.create({
      sensorId: sensor.id,
      value: calibratedValue,
      unit: data.unit,
      readingTime: data.timestamp || new Date(),
      metadata: {
        battery_level: data.metadata?.batteryLevel,
        signal_strength: data.metadata?.signalStrength,
        device_id: data.deviceId,
        calibrated: true
      }
    });

    const savedReading = await ErrorHandler.handleDatabaseOperation(
      () => this.readingRepository.save(reading),
      'processSensorData - save reading'
    ) as SensorReading;

    // Update sensor last seen
    sensor.lastSeen = new Date();
    await ErrorHandler.handleDatabaseOperation(
      () => this.sensorRepository.save(sensor),
      'processSensorData - update sensor'
    );

    // Update device status
    this.updateDeviceStatus(sensor.id, {
      isOnline: true,
      lastSeen: new Date(),
      batteryLevel: data.metadata?.batteryLevel,
      signalStrength: data.metadata?.signalStrength
    });

    // Broadcast real-time data
    this.webSocketService.broadcastSensorData({
      farmId: sensor.farmId,
      sensorId: sensor.id,
      type: sensor.type,
      value: calibratedValue,
      unit: data.unit,
      timestamp: savedReading.readingTime,
      metadata: data.metadata
    });

    // Check alert conditions
    await this.checkAlertConditions(sensor, calibratedValue);

    return savedReading;
  }

  /**
   * Processes multiple sensor data payloads in batch for improved performance
   * @param dataArray - Array of sensor data payloads to process
   * @returns Promise resolving to array of created sensor readings
   */
  async batchProcessSensorData(dataArray: SensorDataPayload[]): Promise<SensorReading[]> {
    const results: SensorReading[] = [];
    
    for (const data of dataArray) {
      try {
        const reading = await this.processSensorData(data);
        results.push(reading);
      } catch (error) {
        ErrorHandler.logError(
          error as Error,
          `batchProcessSensorData - device ${data.deviceId}`
        );
        // Continue processing other readings
      }
    }

    return results;
  }

  /**
   * Queues sensor data for batch processing to improve system performance
   * @param data - Sensor data payload to queue for processing
   */
  queueSensorData(data: SensorDataPayload): void {
    this.dataProcessingQueue.push(data);
  }

  /**
   * Calibrates a sensor by updating its calibration offset based on reference values
   * @param data - Calibration data including sensor ID, reference value, and calibration offset
   * @returns Promise resolving to the updated IoT sensor entity
   * @throws {NotFoundError} When the specified sensor doesn't exist
   */
  async calibrateSensor(data: SensorCalibrationData): Promise<IoTSensor> {
    const sensor = await ErrorHandler.handleDatabaseOperation(
      () => this.sensorRepository.findOne({ where: { id: data.sensorId } }),
      'calibrateSensor - sensor lookup'
    );
    ErrorHandler.validateExists(sensor, 'Sensor');

    if (!sensor) {
      throw new NotFoundError('Sensor not found');
    }

    // Calculate calibration offset
    const offset = data.referenceValue - data.calibrationOffset;
    
    sensor.configuration = {
      ...sensor.configuration,
      calibration_offset: offset,
      unit: sensor.configuration?.unit || 'units'
    };
    sensor.updatedAt = new Date();

    const updatedSensor = await ErrorHandler.handleDatabaseOperation(
      () => this.sensorRepository.save(sensor),
      'calibrateSensor - save sensor'
    );

    // Broadcast calibration update
    this.webSocketService.broadcastSensorData({
      farmId: sensor.farmId,
      sensorId: sensor.id,
      type: sensor.type,
      value: 0,
      unit: sensor.configuration?.unit || 'units',
      timestamp: new Date(),
      metadata: { 
        event: 'sensor_calibrated',
        calibration_offset: offset,
        calibratedAt: data.calibratedAt
      }
    });

    return updatedSensor;
  }

  /**
   * Updates the status information for a specific device
   * @param sensorId - Unique identifier of the sensor
   * @param status - Partial status object with updated information
   */
  updateDeviceStatus(sensorId: string, status: Partial<DeviceStatus>): void {
    const currentStatus = this.deviceStatusMap.get(sensorId) || {
      sensorId,
      isOnline: false,
      lastSeen: new Date(),
      errorCount: 0
    };

    this.deviceStatusMap.set(sensorId, {
      ...currentStatus,
      ...status
    });
  }

  /**
   * Retrieves the current status of a specific device
   * @param sensorId - Unique identifier of the sensor
   * @returns Device status object or null if not found
   */
  getDeviceStatus(sensorId: string): DeviceStatus | null {
    return this.deviceStatusMap.get(sensorId) || null;
  }

  /**
   * Retrieves status information for all devices in a farm
   * @param farmId - Unique identifier of the farm
   * @returns Promise resolving to array of device statuses
   */
  getAllDeviceStatuses(farmId: string): Promise<DeviceStatus[]> {
    return new Promise(async (resolve) => {
      const sensors = await this.sensorRepository.find({ where: { farmId } });
      const statuses = sensors.map(sensor => 
        this.deviceStatusMap.get(sensor.id) || {
          sensorId: sensor.id,
          isOnline: false,
          lastSeen: sensor.lastSeen || new Date(),
          errorCount: 0
        }
      );
      resolve(statuses);
    });
  }

  /**
   * Retrieves all sensors for a specific farm with optional filtering
   * @param farmId - Unique identifier of the farm
   * @param filters - Optional filters for status and sensor type
   * @returns Promise resolving to array of IoT sensors
   */
  async getSensorsByFarm(
    farmId: string,
    filters?: { status?: string; type?: string }
  ): Promise<IoTSensor[]> {
    const whereClause: any = { farmId };
    
    if (filters?.status) {
      whereClause.active = filters.status === 'active';
    }
    if (filters?.type) {
      whereClause.type = filters.type;
    }

    return await ErrorHandler.handleDatabaseOperation(
      () => this.sensorRepository.find({
        where: whereClause,
        order: { createdAt: 'DESC' },
      }),
      'getSensorsByFarm'
    );
  }

  /**
   * Retrieves sensor data trends for analytics and reporting
   * @param farmId - Unique identifier of the farm
   * @param type - Type of sensor to analyze
   * @param startDate - Start date for the trend analysis
   * @param endDate - End date for the trend analysis
   * @returns Promise resolving to array of trend data points
   */
  async getSensorDataTrends(
    farmId: string,
    type: SensorType,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    const sensors = await this.sensorRepository.find({
      where: { farmId, type }
    });

    if (sensors.length === 0) {
      return [];
    }

    const sensorIds = sensors.map(s => s.id);
    
    const readings = await this.readingRepository
      .createQueryBuilder('reading')
      .where('reading.sensorId IN (:...sensorIds)', { sensorIds })
      .andWhere('reading.readingTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })
      .orderBy('reading.readingTime', 'ASC')
      .getMany();

    return readings.map(reading => ({
      timestamp: reading.readingTime,
      value: reading.value,
      unit: reading.unit,
      sensorId: reading.sensorId,
      metadata: reading.metadata
    }));
  }

  // Alert Integration
  /**
   * Checks if sensor reading triggers any alert conditions and broadcasts alerts if needed
   * @private
   * @param sensor - The IoT sensor entity to check alerts for
   * @param value - The current sensor reading value
   * @returns Promise that resolves when alert checking is complete
   */
  private async checkAlertConditions(sensor: IoTSensor, value: number): Promise<void> {
    if (!sensor.configuration) return;
    
    const { min_threshold, max_threshold, alert_enabled } = sensor.configuration;
    
    if (!alert_enabled) return;

    let alertTriggered = false;
    let alertMessage = '';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';

    if (min_threshold !== undefined && value < min_threshold) {
      alertTriggered = true;
      alertMessage = `${sensor.type} reading (${value} ${sensor.configuration?.unit || 'units'}) is below minimum threshold (${min_threshold})`;
      severity = 'high';
    } else if (max_threshold !== undefined && value > max_threshold) {
      alertTriggered = true;
      alertMessage = `${sensor.type} reading (${value} ${sensor.configuration?.unit || 'units'}) is above maximum threshold (${max_threshold})`;
      severity = 'high';
    }

    if (alertTriggered) {
      // Trigger alert through alert engine
      this.webSocketService.broadcastAlert({
        id: `sensor-${sensor.id}-${Date.now()}`,
        farmId: sensor.farmId,
        type: 'iot_sensor',
        severity,
        title: `${sensor.type} Alert`,
        message: alertMessage,
        timestamp: new Date(),
        data: {
          sensorId: sensor.id,
          type: sensor.type,
          location: sensor.location,
          value,
          unit: sensor.configuration?.unit || 'units',
          threshold: min_threshold !== undefined ? min_threshold : max_threshold
        }
      });
    }
  }

  // Data Processing Queue Management
  /**
   * Starts the data processing interval for batch processing queued sensor data
   * @private
   */
  private startDataProcessing(): void {
    this.processingInterval = setInterval(async () => {
      if (this.dataProcessingQueue.length > 0) {
        const batch = this.dataProcessingQueue.splice(0, 50); // Process 50 at a time
        await this.batchProcessSensorData(batch);
      }
    }, 5000); // Process every 5 seconds
  }

  /**
   * Stops the data processing interval and cleans up resources
   * @private
   */
  private stopDataProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Performs a comprehensive health check of all devices in a farm
   * @param farmId - Unique identifier of the farm
   * @returns Promise resolving to health check summary with device counts and status
   */
  async performHealthCheck(farmId: string): Promise<{
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    devicesWithErrors: number;
    lowBatteryDevices: number;
  }> {
    const sensors = await this.sensorRepository.find({ where: { farmId, active: true } });
    const statuses = await this.getAllDeviceStatuses(farmId);
    
    const totalDevices = sensors.length;
    const onlineDevices = statuses.filter(s => s.isOnline).length;
    const offlineDevices = totalDevices - onlineDevices;
    const devicesWithErrors = statuses.filter(s => s.errorCount > 0).length;
    const lowBatteryDevices = statuses.filter(s => 
      s.batteryLevel !== undefined && s.batteryLevel < 20
    ).length;

    return {
      totalDevices,
      onlineDevices,
      offlineDevices,
      devicesWithErrors,
      lowBatteryDevices
    };
  }

  /**
   * Alias for performHealthCheck - checks device health for controller compatibility
   * @param farmId - Unique identifier of the farm
   * @returns Promise resolving to health check summary
   */
  async checkDeviceHealth(farmId: string) {
    return this.performHealthCheck(farmId);
  }

  /**
   * Alias for batchProcessSensorData - processes batch data for controller compatibility
   * @param data - Array of sensor data to process
   * @returns Promise resolving to array of processed readings
   */
  async processBatchSensorData(data: any[]) {
    return this.batchProcessSensorData(data);
  }

  /**
   * Retrieves data trends for a specific sensor over a time period
   * @param sensorId - Unique identifier of the sensor
   * @param period - Time period for analysis ('1h', '6h', '24h', '7d', '30d')
   * @param aggregation - Aggregation type ('avg', 'min', 'max', 'sum')
   * @returns Promise resolving to trend data
   */
  async getDataTrends(
    sensorId: string,
    period: string,
    aggregation: string
  ) {
    return ErrorHandler.handleDatabaseOperation(async () => {
      const hours = period === '1h' ? 1 : period === '6h' ? 6 : period === '24h' ? 24 : period === '7d' ? 168 : 720;
      const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
      const endDate = new Date();
      
      const query = `
        SELECT 
          DATE_TRUNC('${period === '1h' || period === '6h' ? 'hour' : period === '24h' ? 'hour' : 'day'}', reading_time) as period,
          ${aggregation.toUpperCase()}(value) as value,
          COUNT(*) as reading_count
        FROM sensor_readings 
        WHERE sensor_id = $1 AND reading_time >= $2 AND reading_time <= $3
        GROUP BY period
        ORDER BY period ASC
      `;
      
      const trends = await AppDataSource.query(query, [sensorId, startDate, endDate]);
      
      return {
        sensorId,
        period,
        aggregation,
        startDate,
        endDate,
        trends
      };
    }, 'IoTService.getDataTrends');
  }

  /**
   * Retrieves sensor readings with optional filtering and aggregation
   * @param sensorId - Unique identifier of the sensor
   * @param options - Query options including date range, limit, and aggregation type
   * @returns Promise resolving to sensor readings with metadata
   */
  async getSensorReadings(
    sensorId: string,
    options: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      aggregation?: string;
    }
  ) {
    return ErrorHandler.handleDatabaseOperation(async () => {
      const { startDate, endDate, limit = 100, aggregation = 'none' } = options;
      const whereConditions: any = { sensorId };
      
      if (startDate && endDate) {
        whereConditions.readingTime = Between(new Date(startDate), new Date(endDate));
      } else if (startDate) {
        whereConditions.readingTime = MoreThan(new Date(startDate));
      } else if (endDate) {
        whereConditions.readingTime = LessThan(new Date(endDate));
      }
      
      let readings;
      
      if (aggregation === 'none') {
        readings = await this.readingRepository.find({
          where: whereConditions,
          order: { readingTime: 'DESC' },
          take: limit
        });
      } else {
        // For aggregated data, use raw SQL for better performance
        const query = `
          SELECT 
            DATE_TRUNC('${aggregation === 'hourly' ? 'hour' : aggregation === 'daily' ? 'day' : 'week'}', reading_time) as period,
            AVG(value) as avg_value,
            MIN(value) as min_value,
            MAX(value) as max_value,
            COUNT(*) as reading_count
          FROM sensor_readings 
          WHERE sensor_id = $1
          ${startDate ? 'AND reading_time >= $2' : ''}
          ${endDate ? `AND reading_time <= $${startDate ? '3' : '2'}` : ''}
          GROUP BY period
          ORDER BY period DESC
          LIMIT $${startDate && endDate ? '4' : startDate || endDate ? '3' : '2'}
        `;
        
        const params = [sensorId];
        if (startDate) params.push(startDate);
        if (endDate) params.push(endDate);
        params.push(limit.toString());
        
        readings = await AppDataSource.query(query, params);
      }

      return {
        readings,
        aggregation,
        total: readings.length
      };
    }, 'IoTService.getSensorReadings');
  }

  /**
   * Calculates statistical analysis for a sensor over a specified period
   * @param sensorId - Unique identifier of the sensor
   * @param period - Time period for analysis ('24h', '7d', '30d', or '90d')
   * @returns Promise resolving to statistical summary and trend analysis
   */
  async getSensorStatistics(sensorId: string, period: string) {
    return ErrorHandler.handleDatabaseOperation(async () => {
      const hours = period === '24h' ? 24 : period === '7d' ? 168 : period === '30d' ? 720 : 2160;
      const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const stats = await this.readingRepository
        .createQueryBuilder('reading')
        .select([
          'AVG(reading.value) as avg_value',
          'MIN(reading.value) as min_value',
          'MAX(reading.value) as max_value',
          'COUNT(*) as total_readings',
          'STDDEV(reading.value) as std_deviation'
        ])
        .where('reading.sensorId = :sensorId', { sensorId })
        .andWhere('reading.readingTime >= :startDate', { startDate })
        .getRawOne();
      
      // Get recent trend (last 10 readings)
      const recentReadings = await this.readingRepository.find({
        where: { sensorId },
        order: { readingTime: 'DESC' },
        take: 10
      });
      
      let trend = 'stable';
      if (recentReadings.length >= 2) {
        const latest = recentReadings[0].value;
        const previous = recentReadings[recentReadings.length - 1].value;
        const change = ((latest - previous) / previous) * 100;
        
        if (change > 5) trend = 'increasing';
        else if (change < -5) trend = 'decreasing';
      }

      return {
        period,
        statistics: {
          average: parseFloat(stats.avg_value || '0'),
          minimum: parseFloat(stats.min_value || '0'),
          maximum: parseFloat(stats.max_value || '0'),
          totalReadings: parseInt(stats.total_readings || '0'),
          standardDeviation: parseFloat(stats.std_deviation || '0'),
          trend
        },
        recentReadings: recentReadings.slice(0, 5)
      };
    }, 'IoTService.getSensorStatistics');
  }

  /**
   * Retrieves a single sensor by its ID
   * @param sensorId - Unique identifier of the sensor
   * @returns Promise resolving to the IoT sensor or null if not found
   */
  async getSensorById(sensorId: string): Promise<IoTSensor | null> {
    return await ErrorHandler.handleDatabaseOperation(
      () => this.sensorRepository.findOne({ where: { id: sensorId } }),
      'getSensorById'
    );
  }

  /**
   * Retrieves all sensors for a specific farm
   * @param farmId - Unique identifier of the farm
   * @returns Promise resolving to array of all IoT sensors in the farm
   */
  async getAllSensors(farmId: string): Promise<IoTSensor[]> {
    return await ErrorHandler.handleDatabaseOperation(
      () => this.sensorRepository.find({
        where: { farmId },
        order: { createdAt: 'DESC' },
      }),
      'getAllSensors'
    );
  }

  /**
   * Gracefully shuts down the IoT service, processing remaining queue and cleaning up resources
   * @returns Promise that resolves when shutdown is complete
   */
  async shutdown(): Promise<void> {
    this.stopDataProcessing();
    
    // Process remaining queue
    if (this.dataProcessingQueue.length > 0) {
      await this.batchProcessSensorData(this.dataProcessingQueue);
      this.dataProcessingQueue = [];
    }
    
    this.deviceStatusMap.clear();
  }
}