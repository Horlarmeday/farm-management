import { ApiError } from '@/utils/ApiError';
import { NextFunction, Request, Response } from 'express';
import * as Joi from 'joi';

export interface ValidationSchema {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationErrors: string[] = [];

    // Validate request body
    if (schema.body) {
      const { error } = schema.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        validationErrors.push(...error.details.map((detail) => detail.message));
      }
    }

    // Validate query parameters
    if (schema.query) {
      const { error } = schema.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        validationErrors.push(...error.details.map((detail) => detail.message));
      }
    }

    // Validate URL parameters
    if (schema.params) {
      const { error } = schema.params.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        validationErrors.push(...error.details.map((detail) => detail.message));
      }
    }

    if (validationErrors.length > 0) {
      const error = new ApiError(400, `Validation Error: ${validationErrors.join('; ')}`);
      return next(error);
    }

    next();
  };
};

// Common validation schemas
export const commonSchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().optional(),
    dateFrom: Joi.date().iso().optional(),
    dateTo: Joi.date().iso().optional(),
    status: Joi.string().optional(),
    category: Joi.string().optional(),
  }),

  uuidParam: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  dateRange: Joi.object({
    dateFrom: Joi.date().iso().required(),
    dateTo: Joi.date().iso().required(),
  }),
};
