import { Request, Response, NextFunction } from 'express';
import { ServiceFactory } from '../services/ServiceFactory';
import { IoTService } from '../services/IoTService';
import { ApiResponse } from '../types/api.types';

export class IoTController {
  private iotService: IoTService | null;

  constructor() {
    const serviceFactory = ServiceFactory.getInstance();
    this.iotService = serviceFactory.getIoTService();
  }

  private ensureService(): IoTService | null {
    return this.iotService;
  }

  private handleServiceUnavailable(res: Response): void {
    res.status(503).json({
      success: false,
      message: 'IoT service is currently unavailable. Please ensure WebSocket and Alert services are properly initialized.',
      error: 'SERVICE_UNAVAILABLE'
    } as ApiResponse<null>);
  }

  // Device Management
  getAllSensors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = this.ensureService();
      if (!service) {
        this.handleServiceUnavailable(res);
        return;
      }

      const { farmId } = req.params;
      const sensors = await service.getAllSensors(farmId);

      res.json({
        success: true,
        message: 'Sensors retrieved successfully',
        data: sensors,
      } as ApiResponse<typeof sensors>);
    } catch (error) {
      next(error);
    }
  };

  createSensor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = this.ensureService();
      if (!service) {
        this.handleServiceUnavailable(res);
        return;
      }

      const sensor = await service.registerDevice(req.body);

      res.status(201).json({
        success: true,
        message: 'Sensor created successfully',
        data: sensor,
      } as ApiResponse<typeof sensor>);
    } catch (error) {
      next(error);
    }
  };

  updateSensor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = this.ensureService();
      if (!service) {
        this.handleServiceUnavailable(res);
        return;
      }

      const { id } = req.params;
      const sensor = await service.updateDeviceConfiguration(id, req.body);

      res.json({
        success: true,
        message: 'Sensor updated successfully',
        data: sensor,
      } as ApiResponse<typeof sensor>);
    } catch (error) {
      next(error);
    }
  };

  deleteSensor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = this.ensureService();
      if (!service) {
        this.handleServiceUnavailable(res);
        return;
      }

      const { id } = req.params;
      await service.deactivateDevice(id);

      res.json({
        success: true,
        message: 'Sensor deleted successfully',
        data: null,
      } as ApiResponse<null>);
    } catch (error) {
      next(error);
    }
  };

  // Sensor Readings
  submitReading = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = this.ensureService();
      if (!service) {
        this.handleServiceUnavailable(res);
        return;
      }

      const reading = await service.processSensorData(req.body);

      res.status(201).json({
        success: true,
        message: 'Sensor reading submitted successfully',
        data: reading,
      } as ApiResponse<typeof reading>);
    } catch (error) {
      next(error);
    }
  };

  getSensorReadings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = this.ensureService();
      if (!service) {
        this.handleServiceUnavailable(res);
        return;
      }

      const { sensorId } = req.params;
      const { startDate, endDate, limit = 100, aggregation = 'none' } = req.query;
      
      const result = await service.getSensorReadings(sensorId, {
        startDate: startDate as string,
        endDate: endDate as string,
        limit: parseInt(limit as string),
        aggregation: aggregation as string
      });

      res.json({
        success: true,
        message: 'Sensor readings retrieved successfully',
        data: result,
      } as ApiResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  };

  getSensorStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = this.ensureService();
      if (!service) {
        this.handleServiceUnavailable(res);
        return;
      }

      const { sensorId } = req.params;
      const { period = '24h' } = req.query;
      
      const statistics = await service.getSensorStatistics(sensorId, period as string);

      res.json({
        success: true,
        message: 'Sensor statistics retrieved successfully',
        data: statistics,
      } as ApiResponse<typeof statistics>);
    } catch (error) {
      next(error);
    }
  };

  checkDeviceHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = this.ensureService();
      if (!service) {
        this.handleServiceUnavailable(res);
        return;
      }

      const { sensorId } = req.params;
      // Get sensor to find farmId
      const sensor = await service.getSensorById(sensorId);
      if (!sensor) {
        res.status(404).json({
          success: false,
          message: 'Sensor not found',
        });
        return;
      }
      const healthStatus = await service.checkDeviceHealth(sensor.farmId);

      res.json({
        success: true,
        message: 'Device health status retrieved successfully',
        data: healthStatus,
      } as ApiResponse<typeof healthStatus>);
    } catch (error) {
      next(error);
    }
  };

  submitBatchReadings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = this.ensureService();
      if (!service) {
        this.handleServiceUnavailable(res);
        return;
      }

      const { readings } = req.body;
      const processedReadings = await service.processBatchSensorData(readings);

      res.status(201).json({
        success: true,
        message: `${processedReadings.length} sensor readings processed successfully`,
        data: {
          processedCount: processedReadings.length,
          readings: processedReadings
        },
      } as ApiResponse<any>);
    } catch (error) {
      next(error);
    }
  };

  calibrateSensor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = this.ensureService();
      if (!service) {
        this.handleServiceUnavailable(res);
        return;
      }

      const { sensorId } = req.params;
      const { calibrationOffset, referenceValue } = req.body;
      
      const calibrationData = {
        sensorId,
        calibrationOffset,
        referenceValue,
        calibratedAt: new Date()
      };
      
      const calibratedSensor = await service.calibrateSensor(calibrationData);

      res.json({
        success: true,
        message: 'Sensor calibrated successfully',
        data: calibratedSensor,
      } as ApiResponse<typeof calibratedSensor>);
    } catch (error) {
      next(error);
    }
  };

  getSensorTrends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = this.ensureService();
      if (!service) {
        this.handleServiceUnavailable(res);
        return;
      }

      const { sensorId } = req.params;
      const { period = '24h', aggregation = 'avg' } = req.query;
      const trends = await service.getDataTrends(sensorId, period as string, aggregation as string);

      res.json({
        success: true,
        message: 'Sensor trends retrieved successfully',
        data: trends,
      } as ApiResponse<typeof trends>);
    } catch (error) {
      next(error);
    }
  };

  getDataTrends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = this.ensureService();
      if (!service) {
        this.handleServiceUnavailable(res);
        return;
      }

      const { sensorId } = req.params;
      const { period = '24h', interval = '1h' } = req.query;
      const trends = await service.getDataTrends(sensorId, period as string, interval as string);

      res.json({
        success: true,
        message: 'Sensor data trends retrieved successfully',
        data: trends,
      } as ApiResponse<typeof trends>);
    } catch (error) {
      next(error);
    }
  };

  getSensorsByFarm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = this.ensureService();
      if (!service) {
        this.handleServiceUnavailable(res);
        return;
      }

      const { farmId } = req.params;
      const { status, type } = req.query;

      const sensors = await service.getSensorsByFarm(farmId, {
        status: status as string,
        type: type as string,
      });

      res.json({
        success: true,
        message: 'Sensors retrieved successfully',
        data: sensors,
      } as ApiResponse<typeof sensors>);
    } catch (error) {
      next(error);
    }
  };
}