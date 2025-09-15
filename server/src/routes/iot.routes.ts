import { Router } from 'express';
import { IoTController } from '../controllers/IoTController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/joiValidation.middleware';
import { iotValidations } from '../validations/iot.validations';

const router: Router = Router();
const iotController = new IoTController();

// Apply authentication to all routes
router.use(authenticate);

// Sensor Management Routes
// Get sensors by farm
router.get(
  '/sensors/:farmId',
  validate({ params: iotValidations.farmIdParam }),
  iotController.getSensorsByFarm,
);

// Create new sensor
router.post(
  '/sensors',
  validate({ body: iotValidations.createSensor }),
  iotController.createSensor,
);

// Update sensor
router.put(
  '/sensors/:id',
  validate({
    params: iotValidations.uuidParam,
    body: iotValidations.updateSensor,
  }),
  iotController.updateSensor,
);

// Delete sensor
router.delete(
  '/sensors/:id',
  validate({ params: iotValidations.uuidParam }),
  iotController.deleteSensor,
);

// Sensor Reading Routes
// Submit sensor reading
router.post(
  '/readings',
  validate({ body: iotValidations.submitReading }),
  iotController.submitReading,
);

// Get sensor readings
router.get(
  '/readings/:sensorId',
  validate({
    params: iotValidations.sensorIdParam,
    query: iotValidations.getSensorReadings,
  }),
  iotController.getSensorReadings,
);

// Statistics and Analytics Routes
// Get sensor statistics
router.get(
  '/sensors/:sensorId/stats',
  validate({
    params: iotValidations.sensorIdParam,
    query: iotValidations.getSensorStatistics,
  }),
  iotController.getSensorStatistics,
);

// Device health check endpoint
router.get(
  '/sensors/:sensorId/health',
  validate({ params: iotValidations.sensorIdParam }),
  iotController.checkDeviceHealth,
);

// Batch Operations Routes
// Batch submit readings
router.post(
  '/readings/batch',
  validate({
    body: iotValidations.submitBatchReadings,
  }),
  iotController.submitBatchReadings,
);

// Calibration Routes
// Sensor calibration
router.post(
  '/sensors/:sensorId/calibrate',
  validate({
    params: iotValidations.sensorIdParam,
    body: iotValidations.calibrateSensor,
  }),
  iotController.calibrateSensor,
);

// Data Analysis Routes
// Get data trends
router.get(
  '/sensors/:sensorId/trends',
  validate({
    params: iotValidations.sensorIdParam,
    query: iotValidations.getDataTrends,
  }),
  iotController.getDataTrends,
);

export default router;