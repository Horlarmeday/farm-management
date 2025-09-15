import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse } from '../../../shared/src/types/api.types';

/**
 * Middleware to validate request data using express-validator
 * Returns validation errors if any exist
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }))
    } as ApiResponse<null>);
    return;
  }
  
  next();
};

/**
 * Middleware to validate UUID parameters
 */
export const validateUUID = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!value || !uuidRegex.test(value)) {
      res.status(400).json({
        success: false,
        message: `Invalid ${paramName}: must be a valid UUID`,
        error: `Parameter '${paramName}' is not a valid UUID format`
      } as ApiResponse<null>);
      return;
    }
    
    next();
  };
};

/**
 * Middleware to validate pagination parameters
 */
export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    res.status(400).json({
      success: false,
      message: 'Invalid page parameter: must be a positive integer',
      error: 'Page parameter validation failed'
    } as ApiResponse<null>);
    return;
  }
  
  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    res.status(400).json({
      success: false,
      message: 'Invalid limit parameter: must be between 1 and 100',
      error: 'Limit parameter validation failed'
    } as ApiResponse<null>);
    return;
  }
  
  next();
};