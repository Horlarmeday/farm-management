import { ApiResponse } from '../types/api.types';

/**
 * Standard error types for the application
 */
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Predefined error classes for common scenarios
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, ErrorType.VALIDATION_ERROR, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, ErrorType.NOT_FOUND, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, ErrorType.UNAUTHORIZED, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, ErrorType.FORBIDDEN, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, ErrorType.CONFLICT, 409);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, ErrorType.DATABASE_ERROR, 500);
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, service: string) {
    super(`${service}: ${message}`, ErrorType.EXTERNAL_SERVICE_ERROR, 503);
  }
}

/**
 * Standard error handler utility for services
 */
export class ErrorHandler {
  /**
   * Logs error with appropriate level based on error type
   */
  static logError(error: Error, context?: string): void {
    const logContext = context ? `[${context}]` : '';
    
    if (error instanceof AppError) {
      if (error.isOperational) {
        console.warn(`${logContext} Operational Error:`, {
          type: error.type,
          message: error.message,
          statusCode: error.statusCode
        });
      } else {
        console.error(`${logContext} Programming Error:`, {
          type: error.type,
          message: error.message,
          stack: error.stack
        });
      }
    } else {
      console.error(`${logContext} Unexpected Error:`, {
        message: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Converts any error to a standardized ApiResponse format
   */
  static toApiResponse<T = any>(error: Error, context?: string): ApiResponse<T> {
    this.logError(error, context);

    if (error instanceof AppError) {
      return {
        success: false,
        message: error.message,
        error: error.type,
        timestamp: new Date().toISOString()
      };
    }

    // Handle unknown errors
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Wraps service methods with standardized error handling
   */
  static async handleServiceCall<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<ApiResponse<T>> {
    try {
      const result = await operation();
      return {
        success: true,
        data: result,
        message: 'Operation completed successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return this.toApiResponse(error as Error, context);
    }
  }

  /**
   * Wraps service methods that already return ApiResponse with error handling
   */
  static async handleApiResponse<T>(
    operation: () => Promise<ApiResponse<T>>,
    context: string
  ): Promise<ApiResponse<T>> {
    try {
      return await operation();
    } catch (error) {
      return this.toApiResponse(error as Error, context);
    }
  }

  /**
   * Validates that a value is not null/undefined and throws NotFoundError if it is
   */
  static validateExists<T>(value: T | null | undefined, entityName: string): T {
    if (value === null || value === undefined) {
      throw new NotFoundError(`${entityName} not found`);
    }
    return value;
  }

  /**
   * Validates business rules and throws ValidationError if they fail
   */
  static validateBusinessRule(condition: boolean, message: string): void {
    if (!condition) {
      throw new ValidationError(message);
    }
  }

  /**
   * Wraps database operations with proper error handling
   */
  static async handleDatabaseOperation<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const dbError = new DatabaseError(
        `Database operation failed in ${context}: ${(error as Error).message}`,
        error as Error
      );
      throw dbError;
    }
  }
}

/**
 * Utility function for consistent error message formatting
 */
export function formatErrorMessage(operation: string, entityType: string, error?: string): string {
  const baseMessage = `Failed to ${operation} ${entityType}`;
  return error ? `${baseMessage}: ${error}` : baseMessage;
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if error is operational
 */
export function isOperationalError(error: any): boolean {
  return isAppError(error) && error.isOperational;
}