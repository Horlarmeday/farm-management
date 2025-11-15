import { User } from './user.types';
export type HttpStatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 502 | 503;
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
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: Date;
    path?: string;
    method?: string;
    statusCode: HttpStatusCode;
    requestId?: string;
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
export interface SearchParams {
    query?: string;
    filters?: Record<string, any>;
    dateRange?: DateRangeFilter;
    location?: string;
    status?: string;
    category?: string;
}
export interface DateRangeFilter {
    startDate?: Date | string;
    endDate?: Date | string;
}
export interface SortOptions {
    field: string;
    order: 'ASC' | 'DESC';
}
export interface ListRequest extends PaginationParams {
    search?: SearchParams;
    include?: string[];
    fields?: string[];
}
export interface BulkRequest<T> {
    items: T[];
    options?: {
        skipValidation?: boolean;
        continueOnError?: boolean;
        batchSize?: number;
    };
}
export interface BulkResponse<T> {
    success: boolean;
    processed: number;
    failed: number;
    results: Array<{
        item: T;
        success: boolean;
        error?: string;
    }>;
}
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';
export interface ExportRequest {
    format: ExportFormat;
    filters?: SearchParams;
    fields?: string[];
    dateRange?: DateRangeFilter;
    includeHeaders?: boolean;
    fileName?: string;
}
export interface ExportResponse {
    success: boolean;
    downloadUrl?: string;
    fileName: string;
    fileSize?: number;
    expiresAt?: Date;
    format: ExportFormat;
    generatedAt: Date;
}
export interface ReportRequest {
    reportType: string;
    dateRange: DateRangeFilter;
    filters?: Record<string, any>;
    groupBy?: string[];
    metrics?: string[];
    format?: ExportFormat;
}
export interface ReportResponse {
    reportId: string;
    reportType: string;
    dateRange: DateRangeFilter;
    generatedAt: Date;
    generatedBy: User;
    data: Record<string, any>;
    summary?: Record<string, any>;
    downloadUrl?: string;
}
export interface FileUploadRequest {
    file: File;
    category?: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
}
export interface FileUploadResponse {
    fileId: string;
    fileName: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    url: string;
    publicUrl?: string;
    uploadedAt: Date;
    uploadedBy: User;
}
export interface FileDeleteRequest {
    fileId: string;
    reason?: string;
}
export interface BatchOperation<T> {
    operation: 'create' | 'update' | 'delete';
    data: T;
    id?: string;
}
export interface BatchRequest<T> {
    operations: BatchOperation<T>[];
    options?: {
        skipValidation?: boolean;
        continueOnError?: boolean;
        rollbackOnError?: boolean;
    };
}
export interface BatchResult<T> {
    operation: 'create' | 'update' | 'delete';
    success: boolean;
    data?: T;
    error?: string;
    id?: string;
}
export interface BatchResponse<T> {
    success: boolean;
    processed: number;
    successful: number;
    failed: number;
    results: BatchResult<T>[];
    errors?: string[];
}
export interface WebSocketMessage<T = any> {
    type: string;
    data: T;
    timestamp: Date;
    id?: string;
    userId?: string;
    roomId?: string;
}
export interface WebSocketResponse<T = any> {
    type: string;
    data?: T;
    error?: string;
    success: boolean;
    timestamp: Date;
    requestId?: string;
}
export type EventType = 'notification:new' | 'task:assigned' | 'task:completed' | 'alert:triggered' | 'alert:resolved' | 'stock:low' | 'health:alert' | 'production:updated' | 'user:login' | 'user:logout' | 'system:maintenance' | 'custom';
export interface RealtimeEvent<T = any> {
    type: EventType;
    data: T;
    timestamp: Date;
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
}
export interface ApiConfig {
    baseUrl: string;
    version: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    headers?: Record<string, string>;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    expiresAt: Date;
}
export interface RefreshTokenRequest {
    refreshToken: string;
}
export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: Date;
}
export interface HealthCheckResponse {
    status: 'ok' | 'degraded' | 'down';
    timestamp: Date;
    uptime: number;
    version: string;
    environment: string;
    services: {
        database: ServiceStatus;
        redis: ServiceStatus;
        email: ServiceStatus;
        storage: ServiceStatus;
        websocket: ServiceStatus;
    };
    metrics?: {
        memoryUsage: number;
        cpuUsage: number;
        diskUsage: number;
        activeConnections: number;
    };
}
export interface ServiceStatus {
    status: 'ok' | 'degraded' | 'down';
    responseTime?: number;
    lastChecked: Date;
    error?: string;
}
export interface AnalyticsRequest {
    metric: string;
    dimensions?: string[];
    filters?: Record<string, any>;
    dateRange: DateRangeFilter;
    granularity?: 'hour' | 'day' | 'week' | 'month' | 'year';
}
export interface AnalyticsResponse {
    metric: string;
    data: Array<{
        timestamp: Date;
        value: number;
        dimensions?: Record<string, any>;
    }>;
    summary: {
        total: number;
        average: number;
        min: number;
        max: number;
        change?: number;
        changePercent?: number;
    };
}
export interface AuditLogEntry {
    id: string;
    userId: string;
    userEmail: string;
    action: string;
    resource: string;
    resourceId?: string;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
}
export interface AuditLogRequest {
    userId?: string;
    action?: string;
    resource?: string;
    resourceId?: string;
    dateRange?: DateRangeFilter;
    ipAddress?: string;
}
export interface SystemInfo {
    name: string;
    version: string;
    environment: string;
    buildDate: Date;
    nodeVersion: string;
    databaseVersion: string;
    uptime: number;
    timezone: string;
    features: string[];
    limits: {
        maxFileSize: number;
        maxUsers: number;
        maxStorageSize: number;
        rateLimits: Record<string, number>;
    };
}
export interface ErrorResponse {
    error: {
        code: string;
        message: string;
        details?: Record<string, any>;
        timestamp: Date;
        path?: string;
        method?: string;
        statusCode: HttpStatusCode;
        requestId?: string;
        stack?: string;
    };
}
export declare const ERROR_CODES: {
    readonly AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS";
    readonly AUTH_TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED";
    readonly AUTH_TOKEN_INVALID: "AUTH_TOKEN_INVALID";
    readonly AUTH_INSUFFICIENT_PERMISSIONS: "AUTH_INSUFFICIENT_PERMISSIONS";
    readonly AUTH_ACCOUNT_LOCKED: "AUTH_ACCOUNT_LOCKED";
    readonly AUTH_ACCOUNT_DISABLED: "AUTH_ACCOUNT_DISABLED";
    readonly VALIDATION_FAILED: "VALIDATION_FAILED";
    readonly VALIDATION_REQUIRED_FIELD: "VALIDATION_REQUIRED_FIELD";
    readonly VALIDATION_INVALID_FORMAT: "VALIDATION_INVALID_FORMAT";
    readonly VALIDATION_DUPLICATE_VALUE: "VALIDATION_DUPLICATE_VALUE";
    readonly VALIDATION_INVALID_RANGE: "VALIDATION_INVALID_RANGE";
    readonly BUSINESS_RULE_VIOLATION: "BUSINESS_RULE_VIOLATION";
    readonly INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK";
    readonly DUPLICATE_ENTRY: "DUPLICATE_ENTRY";
    readonly INVALID_OPERATION: "INVALID_OPERATION";
    readonly RESOURCE_LOCKED: "RESOURCE_LOCKED";
    readonly SYSTEM_ERROR: "SYSTEM_ERROR";
    readonly DATABASE_ERROR: "DATABASE_ERROR";
    readonly NETWORK_ERROR: "NETWORK_ERROR";
    readonly SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE";
    readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
    readonly FILE_UPLOAD_ERROR: "FILE_UPLOAD_ERROR";
    readonly RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND";
    readonly RESOURCE_ALREADY_EXISTS: "RESOURCE_ALREADY_EXISTS";
    readonly RESOURCE_CONFLICT: "RESOURCE_CONFLICT";
    readonly RESOURCE_DELETED: "RESOURCE_DELETED";
};
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
//# sourceMappingURL=api.types.d.ts.map