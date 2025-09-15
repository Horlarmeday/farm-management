export enum SensorType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  SOIL_MOISTURE = 'soil_moisture',
  PH = 'ph',
  LIGHT = 'light',
  PRESSURE = 'pressure',
  WIND_SPEED = 'wind_speed',
  RAINFALL = 'rainfall',
  CO2 = 'co2',
  AMMONIA = 'ammonia',
  ELECTRICAL_CONDUCTIVITY = 'electrical_conductivity'
}

export interface IoTSensor {
  id: string;
  farmId: string;
  deviceId: string;
  name: string;
  type: SensorType;
  location: string;
  configuration: {
    minThreshold?: number;
    maxThreshold?: number;
    unit?: string;
    calibrationOffset?: number;
    calibrationMultiplier?: number;
    alertsEnabled?: boolean;
  };
  isActive: boolean;
  lastReading?: {
    timestamp: string;
    value: number;
  };
  batteryLevel?: number;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  readings?: SensorReading[];
}

export interface SensorReading {
  id: string;
  sensorId: string;
  value: number;
  unit?: string;
  readingTime: Date;
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
  createdAt: Date;
  // Relations
  sensor?: IoTSensor;
}

export interface SensorHealthStatus {
  sensorId: string;
  isOnline: boolean;
  lastSeen: Date;
  batteryLevel?: number;
  signalStrength?: number;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  issues: string[];
  uptime: number; // in hours
  dataQuality: {
    accuracy: number; // percentage
    completeness: number; // percentage
    consistency: number; // percentage
  };
}

export interface SensorAlert {
  id: string;
  sensorId: string;
  type: 'threshold_exceeded' | 'device_offline' | 'low_battery' | 'data_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  value?: number;
  threshold?: number;
  isResolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
  // Relations
  sensor?: IoTSensor;
}

export interface SensorTrends {
  sensorId: string;
  period: string;
  aggregation: string;
  dataPoints: {
    timestamp: Date;
    value: number;
    count?: number;
  }[];
  statistics: {
    average: number;
    minimum: number;
    maximum: number;
    standardDeviation: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    changeRate: number; // percentage change
  };
  predictions?: {
    nextValue: number;
    confidence: number;
    timeframe: string;
  };
}

export interface SensorCalibration {
  sensorId: string;
  offset: number;
  multiplier: number;
  calibratedAt: Date;
  calibratedBy: string;
  referenceValue?: number;
  notes?: string;
}

export interface SensorConfiguration {
  minThreshold?: number;
  maxThreshold?: number;
  unit?: string;
  calibrationOffset?: number;
  calibrationMultiplier?: number;
  alertsEnabled?: boolean;
  samplingInterval?: number; // in seconds
  dataRetention?: number; // in days
  qualityThresholds?: {
    minAccuracy: number;
    minCompleteness: number;
    maxGap: number; // in minutes
  };
}

export interface DeviceStatus {
  deviceId: string;
  isConnected: boolean;
  lastSeen: Date;
  firmwareVersion?: string;
  hardwareVersion?: string;
  batteryLevel?: number;
  signalStrength?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  diagnostics?: {
    cpuUsage: number;
    memoryUsage: number;
    temperature: number;
    uptime: number;
  };
}

export interface SensorStatistics {
  sensorId: string;
  period: string;
  totalReadings: number;
  averageValue: number;
  minimumValue: number;
  maximumValue: number;
  standardDeviation: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  dataQuality: {
    accuracy: number;
    completeness: number;
    consistency: number;
  };
  alerts: {
    total: number;
    resolved: number;
    pending: number;
    bySeverity: Record<string, number>;
  };
}

export interface SensorNetwork {
  id: string;
  farmId: string;
  name: string;
  description?: string;
  sensors: IoTSensor[];
  gateway?: {
    id: string;
    name: string;
    location: string;
    status: 'online' | 'offline' | 'maintenance';
  };
  configuration: {
    protocol: 'wifi' | 'lora' | 'zigbee' | 'bluetooth';
    frequency: string;
    range: number; // in meters
    encryption: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SensorDataExport {
  sensorId: string;
  format: 'csv' | 'json' | 'xlsx';
  dateRange: {
    start: Date;
    end: Date;
  };
  fields: string[];
  aggregation?: 'raw' | 'hourly' | 'daily' | 'weekly';
  includeMetadata: boolean;
}

// WebSocket event types for real-time updates
export interface SensorWebSocketEvent {
  type: 'sensor_reading' | 'sensor_alert' | 'sensor_status' | 'device_connected' | 'device_disconnected';
  sensorId: string;
  farmId: string;
  timestamp: Date;
  data: any;
}

export interface SensorReadingEvent extends SensorWebSocketEvent {
  type: 'sensor_reading';
  data: {
    reading: SensorReading;
    isAlert: boolean;
    alertType?: string;
  };
}

export interface SensorAlertEvent extends SensorWebSocketEvent {
  type: 'sensor_alert';
  data: {
    alert: SensorAlert;
    reading?: SensorReading;
  };
}

export interface SensorStatusEvent extends SensorWebSocketEvent {
  type: 'sensor_status';
  data: {
    status: SensorHealthStatus;
    previousStatus?: string;
  };
}

// Form types for UI components
export interface CreateSensorFormData {
  deviceId: string;
  name: string;
  type: SensorType;
  location: string;
  minThreshold?: number;
  maxThreshold?: number;
  unit?: string;
  alertsEnabled: boolean;
}

export interface UpdateSensorFormData {
  name?: string;
  location?: string;
  minThreshold?: number;
  maxThreshold?: number;
  unit?: string;
  alertsEnabled?: boolean;
  isActive?: boolean;
}

export interface SensorFilterOptions {
  type?: SensorType[];
  status?: ('active' | 'inactive' | 'offline')[];
  location?: string;
  hasAlerts?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SensorSortOptions {
  field: 'name' | 'type' | 'location' | 'lastReading' | 'createdAt';
  direction: 'asc' | 'desc';
}

// Dashboard types
export interface SensorDashboardData {
  totalSensors: number;
  activeSensors: number;
  offlineSensors: number;
  alertCount: number;
  recentReadings: SensorReading[];
  recentAlerts: SensorAlert[];
  sensorsByType: Record<SensorType, number>;
  networkHealth: {
    overall: number;
    byLocation: Record<string, number>;
  };
}

export interface SensorChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill?: boolean;
  }[];
}

// API Response types
export interface SensorApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SensorErrorResponse {
  success: false;
  message: string;
  error: string;
  details?: any;
}