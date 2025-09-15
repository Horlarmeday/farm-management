import { apiClient } from './api';
import { IoTSensor, SensorReading, SensorType, SensorHealthStatus, SensorTrends } from '@/types/iot';

export interface CreateSensorRequest {
  farmId: string;
  deviceId: string;
  name: string;
  type: SensorType;
  location: string;
  configuration?: {
    minThreshold?: number;
    maxThreshold?: number;
    unit?: string;
    calibrationOffset?: number;
    calibrationMultiplier?: number;
    alertsEnabled?: boolean;
  };
}

export interface UpdateSensorRequest {
  name?: string;
  location?: string;
  configuration?: {
    minThreshold?: number;
    maxThreshold?: number;
    unit?: string;
    calibrationOffset?: number;
    calibrationMultiplier?: number;
    alertsEnabled?: boolean;
  };
  isActive?: boolean;
}

export interface SensorReadingRequest {
  deviceId: string;
  value: number;
  unit?: string;
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
  timestamp?: string;
}

export interface BatchReadingRequest {
  readings: SensorReadingRequest[];
}

export interface CalibrationData {
  offset?: number;
  multiplier?: number;
}

export interface SensorReadingsQuery {
  startDate?: string;
  endDate?: string;
  limit?: number;
  aggregate?: 'avg' | 'min' | 'max' | 'sum';
  interval?: '1h' | '6h' | '24h';
}

export interface SensorStatsQuery {
  period?: '1h' | '6h' | '24h' | '7d' | '30d';
}

export interface SensorTrendsQuery {
  period?: '1h' | '6h' | '24h' | '7d' | '30d';
  aggregation?: 'avg' | 'min' | 'max' | 'sum';
}

class IoTService {
  private baseUrl = '/api/iot';

  // Sensor Management
  async getSensors(farmId: string): Promise<IoTSensor[]> {
    const response = await apiClient.get(`${this.baseUrl}/sensors/${farmId}`);
    return response.data.data;
  }

  async createSensor(sensorData: CreateSensorRequest): Promise<IoTSensor> {
    const response = await apiClient.post(`${this.baseUrl}/sensors`, sensorData);
    return response.data.data;
  }

  async updateSensor(sensorId: string, updates: UpdateSensorRequest): Promise<IoTSensor> {
    const response = await apiClient.put(`${this.baseUrl}/sensors/${sensorId}`, updates);
    return response.data.data;
  }

  async deleteSensor(sensorId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/sensors/${sensorId}`);
  }

  // Sensor Readings
  async submitReading(reading: SensorReadingRequest): Promise<SensorReading> {
    const response = await apiClient.post(`${this.baseUrl}/readings`, reading);
    return response.data.data;
  }

  async submitBatchReadings(batch: BatchReadingRequest): Promise<SensorReading[]> {
    const response = await apiClient.post(`${this.baseUrl}/readings/batch`, batch);
    return response.data.data.readings;
  }

  async getSensorReadings(
    sensorId: string,
    query: SensorReadingsQuery = {}
  ): Promise<SensorReading[]> {
    const params = new URLSearchParams();
    
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.aggregate) params.append('aggregate', query.aggregate);
    if (query.interval) params.append('interval', query.interval);

    const response = await apiClient.get(
      `${this.baseUrl}/readings/${sensorId}?${params.toString()}`
    );
    return response.data.data;
  }

  // Sensor Statistics
  async getSensorStats(
    sensorId: string,
    query: SensorStatsQuery = {}
  ): Promise<{
    average: number;
    minimum: number;
    maximum: number;
    totalReadings: number;
    standardDeviation: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    recentReadings: SensorReading[];
  }> {
    const params = new URLSearchParams();
    if (query.period) params.append('period', query.period);

    const response = await apiClient.get(
      `${this.baseUrl}/sensors/${sensorId}/stats?${params.toString()}`
    );
    return response.data.data;
  }

  // Device Health
  async getDeviceHealth(sensorId: string): Promise<SensorHealthStatus> {
    const response = await apiClient.get(`${this.baseUrl}/sensors/${sensorId}/health`);
    return response.data.data;
  }

  // Sensor Calibration
  async calibrateSensor(
    sensorId: string,
    calibrationData: CalibrationData
  ): Promise<IoTSensor> {
    const response = await apiClient.post(
      `${this.baseUrl}/sensors/${sensorId}/calibrate`,
      { calibrationData }
    );
    return response.data.data;
  }

  // Sensor Trends
  async getSensorTrends(
    sensorId: string,
    query: SensorTrendsQuery = {}
  ): Promise<SensorTrends> {
    const params = new URLSearchParams();
    if (query.period) params.append('period', query.period);
    if (query.aggregation) params.append('aggregation', query.aggregation);

    const response = await apiClient.get(
      `${this.baseUrl}/sensors/${sensorId}/trends?${params.toString()}`
    );
    return response.data.data;
  }

  // Real-time data subscription helpers
  subscribeToSensorUpdates(callback: (data: any) => void): () => void {
    // This would integrate with WebSocket service
    const handleSensorUpdate = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === 'sensor_reading' || data.type === 'sensor_alert') {
        callback(data);
      }
    };

    // Add WebSocket event listener
    if (typeof window !== 'undefined' && window.WebSocket) {
      // This would be handled by the WebSocket context/service
      // For now, we'll return a no-op unsubscribe function
    }

    return () => {
      // Cleanup subscription
    };
  }

  // Utility methods
  formatSensorValue(value: number, unit?: string): string {
    const formattedValue = Number(value).toFixed(2);
    return unit ? `${formattedValue} ${unit}` : formattedValue;
  }

  getSensorTypeLabel(type: SensorType): string {
    const labels: Record<SensorType, string> = {
      [SensorType.TEMPERATURE]: 'Temperature',
      [SensorType.HUMIDITY]: 'Humidity',
      [SensorType.SOIL_MOISTURE]: 'Soil Moisture',
      [SensorType.PH]: 'pH Level',
      [SensorType.LIGHT]: 'Light Intensity',
      [SensorType.PRESSURE]: 'Pressure',
      [SensorType.WIND_SPEED]: 'Wind Speed',
      [SensorType.RAINFALL]: 'Rainfall',
      [SensorType.CO2]: 'CO2 Level',
      [SensorType.AMMONIA]: 'Ammonia Level',
      [SensorType.ELECTRICAL_CONDUCTIVITY]: 'Electrical Conductivity'
    };
    return labels[type] || 'Unknown';
  }

  getDefaultUnit(type: SensorType): string {
    const units: Record<SensorType, string> = {
      [SensorType.TEMPERATURE]: '°C',
      [SensorType.HUMIDITY]: '%',
      [SensorType.SOIL_MOISTURE]: '%',
      [SensorType.PH]: 'pH',
      [SensorType.LIGHT]: 'lux',
      [SensorType.PRESSURE]: 'hPa',
      [SensorType.WIND_SPEED]: 'm/s',
      [SensorType.RAINFALL]: 'mm',
      [SensorType.CO2]: 'ppm',
      [SensorType.AMMONIA]: 'ppm',
      [SensorType.ELECTRICAL_CONDUCTIVITY]: 'mS/cm'
    };
    return units[type] || '';
  }

  isValueInRange(value: number, min?: number, max?: number): boolean {
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
  }

  calculateTrend(readings: SensorReading[]): 'increasing' | 'decreasing' | 'stable' {
    if (readings.length < 2) return 'stable';
    
    const sortedReadings = readings.sort(
      (a, b) => new Date(a.readingTime).getTime() - new Date(b.readingTime).getTime()
    );
    
    const firstHalf = sortedReadings.slice(0, Math.floor(sortedReadings.length / 2));
    const secondHalf = sortedReadings.slice(Math.floor(sortedReadings.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, r) => sum + r.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, r) => sum + r.value, 0) / secondHalf.length;
    
    const threshold = 0.05; // 5% threshold for stability
    const percentChange = Math.abs((secondAvg - firstAvg) / firstAvg);
    
    if (percentChange < threshold) return 'stable';
    return secondAvg > firstAvg ? 'increasing' : 'decreasing';
  }
}

export const iotService = new IoTService();
export default iotService;