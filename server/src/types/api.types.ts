// Local copy of shared API types to avoid import issues

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: ValidationError[];
  meta?: ResponseMeta;
  timestamp: string;
}

export interface ResponseMeta {
  requestId?: string;
  version?: string;
  serverTime?: Date;
  executionTime?: number;
  cached?: boolean;
  cacheExpiry?: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}