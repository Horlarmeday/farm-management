import Joi from 'joi';

export const iotValidations = {
  // Common schemas
  uuidParam: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  farmIdParam: Joi.object({
    farmId: Joi.string().uuid().required(),
  }),

  sensorIdParam: Joi.object({
    sensorId: Joi.string().uuid().required(),
  }),

  // Sensor Management
  createSensor: Joi.object({
    deviceId: Joi.string().required().messages({
      'any.required': 'Device ID is required',
      'string.empty': 'Device ID cannot be empty',
    }),
    type: Joi.string()
      .valid('temperature', 'humidity', 'soil_moisture', 'ph', 'light', 'pressure')
      .required()
      .messages({
        'any.required': 'Sensor type is required',
        'any.only': 'Invalid sensor type. Must be one of: temperature, humidity, soil_moisture, ph, light, pressure',
      }),
    location: Joi.string().required().messages({
      'any.required': 'Location is required',
      'string.empty': 'Location cannot be empty',
    }),
    farmId: Joi.string().uuid().required().messages({
      'any.required': 'Farm ID is required',
      'string.guid': 'Valid farm ID is required',
    }),
    name: Joi.string().optional().max(100),
    unit: Joi.string().optional().max(20),
    minValue: Joi.number().optional(),
    maxValue: Joi.number().optional(),
    alertThresholds: Joi.object({
      min: Joi.number().optional(),
      max: Joi.number().optional(),
    }).optional(),
  }),

  updateSensor: Joi.object({
    name: Joi.string().optional().min(1).max(100).messages({
      'string.min': 'Sensor name cannot be empty',
      'string.max': 'Sensor name cannot exceed 100 characters',
    }),
    location: Joi.string().optional().min(1).max(200).messages({
      'string.min': 'Location cannot be empty',
      'string.max': 'Location cannot exceed 200 characters',
    }),
    unit: Joi.string().optional().min(1).max(20).messages({
      'string.min': 'Unit cannot be empty',
      'string.max': 'Unit cannot exceed 20 characters',
    }),
    minValue: Joi.number().optional().messages({
      'number.base': 'Min value must be numeric',
    }),
    maxValue: Joi.number().optional().messages({
      'number.base': 'Max value must be numeric',
    }),
    alertThresholds: Joi.object({
      min: Joi.number().optional().messages({
        'number.base': 'Alert min threshold must be numeric',
      }),
      max: Joi.number().optional().messages({
        'number.base': 'Alert max threshold must be numeric',
      }),
    }).optional(),
  }),

  // Sensor Readings
  submitReading: Joi.object({
    deviceId: Joi.string().required().messages({
      'any.required': 'Device ID is required',
      'string.empty': 'Device ID cannot be empty',
    }),
    value: Joi.number().required().messages({
      'any.required': 'Value is required',
      'number.base': 'Value must be numeric',
    }),
    timestamp: Joi.date().iso().optional().messages({
      'date.format': 'Invalid timestamp format',
    }),
  }),

  getSensorReadings: Joi.object({
    startDate: Joi.date().iso().optional().messages({
      'date.format': 'Invalid start date format',
    }),
    endDate: Joi.date().iso().optional().messages({
      'date.format': 'Invalid end date format',
    }),
    limit: Joi.number().integer().min(1).max(1000).optional().messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 1000',
    }),
    aggregation: Joi.string()
      .valid('none', 'hourly', 'daily', 'weekly')
      .optional()
      .messages({
        'any.only': 'Invalid aggregation type. Must be one of: none, hourly, daily, weekly',
      }),
  }),

  // Sensor Statistics
  getSensorStatistics: Joi.object({
    period: Joi.string()
      .valid('24h', '7d', '30d', '90d')
      .optional()
      .messages({
        'any.only': 'Invalid period. Must be one of: 24h, 7d, 30d, 90d',
      }),
  }),

  // Batch Readings
  submitBatchReadings: Joi.object({
    readings: Joi.array()
      .items(
        Joi.object({
          sensorId: Joi.string().uuid().required().messages({
            'any.required': 'Sensor ID is required',
            'string.guid': 'Valid sensor ID is required',
          }),
          value: Joi.number().required().messages({
            'any.required': 'Numeric value is required',
            'number.base': 'Value must be numeric',
          }),
          timestamp: Joi.date().iso().optional().messages({
            'date.format': 'Valid timestamp required',
          }),
        })
      )
      .min(1)
      .required()
      .messages({
        'any.required': 'Readings array is required',
        'array.min': 'At least one reading is required',
      }),
  }),

  // Sensor Calibration
  calibrateSensor: Joi.object({
    calibrationOffset: Joi.number().optional().messages({
      'number.base': 'Calibration offset must be numeric',
    }),
    referenceValue: Joi.number().optional().messages({
      'number.base': 'Reference value must be numeric',
    }),
  }),

  // Data Trends
  getDataTrends: Joi.object({
    period: Joi.string()
      .valid('1h', '6h', '24h', '7d', '30d')
      .optional()
      .messages({
        'any.only': 'Invalid period. Must be one of: 1h, 6h, 24h, 7d, 30d',
      }),
    interval: Joi.string()
      .valid('5m', '15m', '1h', '6h', '1d')
      .optional()
      .messages({
        'any.only': 'Invalid interval. Must be one of: 5m, 15m, 1h, 6h, 1d',
      }),
  }),
};