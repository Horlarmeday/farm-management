import { Response } from 'express';
import {
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
} from '../../../shared/src/types/api.types';

/**
 * Helper class for standardized API responses
 */
export class ResponseHelper {
  /**
   * Send a successful response
   */
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message: message || 'Request successful',
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send a created (201) response
   */
  static created<T>(res: Response, data: T, message?: string): Response {
    return this.success(res, data, message || 'Resource created successfully', 201);
  }

  /**
   * Send a no content (204) response
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send an error response
   */
  static error(res: Response, message: string, statusCode: number = 400, error?: string): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send a paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message?: string,
  ): Response {
    const response: ApiResponse<PaginatedResponse<T>> = {
      success: true,
      data: {
        data,
        pagination,
      },
      message: message || 'Request successful',
      timestamp: new Date().toISOString(),
    };
    return res.status(200).json(response);
  }

  /**
   * Create pagination metadata
   */
  static createPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
    const pages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    };
  }

  /**
   * Standardize query pagination parameters
   */
  static getPaginationParams(query: any): { page: number; limit: number } {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    return { page, limit };
  }
}
