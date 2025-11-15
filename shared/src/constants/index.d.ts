export declare const APP_NAME = "Kuyash Farm Management System";
export declare const APP_VERSION = "1.0.0";
export declare const APP_DESCRIPTION = "Comprehensive multi-branch farm management platform";
export declare const API_VERSION = "v1";
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const MAX_PAGE_SIZE = 100;
export declare const DEFAULT_TIMEOUT = 30000;
export declare const JWT_EXPIRES_IN = "1h";
export declare const REFRESH_TOKEN_EXPIRES_IN = "7d";
export declare const PASSWORD_MIN_LENGTH = 8;
export declare const PASSWORD_MAX_LENGTH = 128;
export declare const MAX_FILE_SIZE: number;
export declare const ALLOWED_IMAGE_TYPES: string[];
export declare const ALLOWED_DOCUMENT_TYPES: string[];
export declare const EMAIL_REGEX: RegExp;
export declare const PHONE_REGEX: RegExp;
export declare const ALPHANUMERIC_REGEX: RegExp;
export declare const CODE_REGEX: RegExp;
export declare const MIN_STOCK_THRESHOLD = 0;
export declare const DEFAULT_REORDER_LEVEL = 10;
export declare const MAX_BATCH_SIZE = 1000;
export declare const DATE_FORMAT = "YYYY-MM-DD";
export declare const DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
export declare const TIME_FORMAT = "HH:mm:ss";
export declare const DISPLAY_DATE_FORMAT = "MMM DD, YYYY";
export declare const DISPLAY_DATETIME_FORMAT = "MMM DD, YYYY HH:mm";
export declare const DEFAULT_CURRENCY = "USD";
export declare const SUPPORTED_CURRENCIES: string[];
export declare const WEIGHT_UNITS: string[];
export declare const LENGTH_UNITS: string[];
export declare const VOLUME_UNITS: string[];
export declare const AREA_UNITS: string[];
export declare const NOTIFICATION_BATCH_SIZE = 100;
export declare const NOTIFICATION_RETRY_ATTEMPTS = 3;
export declare const NOTIFICATION_RETRY_DELAY = 5000;
export declare const CACHE_TTL: {
    SHORT: number;
    MEDIUM: number;
    LONG: number;
    VERY_LONG: number;
};
export declare const RATE_LIMITS: {
    LOGIN: {
        windowMs: number;
        max: number;
    };
    API: {
        windowMs: number;
        max: number;
    };
    UPLOAD: {
        windowMs: number;
        max: number;
    };
    EXPORT: {
        windowMs: number;
        max: number;
    };
};
export declare const WS_EVENTS: {
    readonly CONNECT: "connect";
    readonly DISCONNECT: "disconnect";
    readonly NOTIFICATION: "notification";
    readonly ALERT: "alert";
    readonly TASK_UPDATE: "task_update";
    readonly PRODUCTION_UPDATE: "production_update";
    readonly STOCK_ALERT: "stock_alert";
    readonly HEALTH_ALERT: "health_alert";
    readonly USER_ACTIVITY: "user_activity";
};
export declare const ERROR_MESSAGES: {
    readonly INVALID_CREDENTIALS: "Invalid email or password";
    readonly TOKEN_EXPIRED: "Access token has expired";
    readonly TOKEN_INVALID: "Invalid access token";
    readonly INSUFFICIENT_PERMISSIONS: "You do not have permission to perform this action";
    readonly ACCOUNT_LOCKED: "Account has been locked due to multiple failed login attempts";
    readonly ACCOUNT_DISABLED: "Account has been disabled";
    readonly REQUIRED_FIELD: "This field is required";
    readonly INVALID_EMAIL: "Please enter a valid email address";
    readonly INVALID_PHONE: "Please enter a valid phone number";
    readonly INVALID_DATE: "Please enter a valid date";
    readonly INVALID_NUMBER: "Please enter a valid number";
    readonly DUPLICATE_VALUE: "This value already exists";
    readonly MIN_LENGTH: "Must be at least {min} characters long";
    readonly MAX_LENGTH: "Must not exceed {max} characters";
    readonly MIN_VALUE: "Must be at least {min}";
    readonly MAX_VALUE: "Must not exceed {max}";
    readonly INSUFFICIENT_STOCK: "Insufficient stock available";
    readonly INVALID_OPERATION: "This operation is not allowed";
    readonly RESOURCE_IN_USE: "This resource is currently in use and cannot be deleted";
    readonly BATCH_NOT_FOUND: "Batch not found or has been deleted";
    readonly PRODUCTION_CYCLE_ACTIVE: "Cannot modify while production cycle is active";
    readonly INTERNAL_ERROR: "An internal server error occurred";
    readonly DATABASE_ERROR: "Database operation failed";
    readonly NETWORK_ERROR: "Network connection error";
    readonly SERVICE_UNAVAILABLE: "Service is temporarily unavailable";
    readonly RATE_LIMIT_EXCEEDED: "Too many requests, please try again later";
    readonly FILE_UPLOAD_ERROR: "File upload failed";
    readonly FILE_TOO_LARGE: "File size exceeds the maximum allowed limit";
    readonly INVALID_FILE_TYPE: "File type is not supported";
    readonly NOT_FOUND: "Resource not found";
    readonly ALREADY_EXISTS: "Resource already exists";
    readonly CONFLICT: "Resource conflict detected";
    readonly DELETED: "Resource has been deleted";
};
export declare const SUCCESS_MESSAGES: {
    readonly CREATED: "Successfully created";
    readonly UPDATED: "Successfully updated";
    readonly DELETED: "Successfully deleted";
    readonly SAVED: "Successfully saved";
    readonly SENT: "Successfully sent";
    readonly COMPLETED: "Successfully completed";
    readonly APPROVED: "Successfully approved";
    readonly REJECTED: "Successfully rejected";
    readonly IMPORTED: "Successfully imported";
    readonly EXPORTED: "Successfully exported";
    readonly BACKUP_CREATED: "Backup successfully created";
    readonly PASSWORD_CHANGED: "Password successfully changed";
    readonly EMAIL_VERIFIED: "Email successfully verified";
    readonly NOTIFICATION_SENT: "Notification successfully sent";
};
export declare const POULTRY_CONSTANTS: {
    MIN_TEMPERATURE: number;
    MAX_TEMPERATURE: number;
    OPTIMAL_HUMIDITY: {
        min: number;
        max: number;
    };
    EGG_GRADING_WEIGHTS: {
        JUMBO: number;
        EXTRA_LARGE: number;
        LARGE: number;
        MEDIUM: number;
        SMALL: number;
    };
    FEEDING_TIMES_PER_DAY: {
        min: number;
        max: number;
    };
    FCR_TARGETS: {
        BROILER: {
            min: number;
            max: number;
        };
        LAYER: {
            min: number;
            max: number;
        };
    };
};
export declare const LIVESTOCK_CONSTANTS: {
    BODY_CONDITION_SCORE: {
        min: number;
        max: number;
    };
    PREGNANCY_PERIOD: {
        CATTLE: number;
        GOAT: number;
        SHEEP: number;
        PIG: number;
    };
    MILKING_FREQUENCY: {
        min: number;
        max: number;
    };
    BREEDING_AGE: {
        CATTLE: {
            female: number;
            male: number;
        };
        GOAT: {
            female: number;
            male: number;
        };
        SHEEP: {
            female: number;
            male: number;
        };
        PIG: {
            female: number;
            male: number;
        };
    };
};
export declare const FISHERY_CONSTANTS: {
    WATER_QUALITY_RANGES: {
        pH: {
            min: number;
            max: number;
        };
        TEMPERATURE: {
            min: number;
            max: number;
        };
        DISSOLVED_OXYGEN: {
            min: number;
            max: number;
        };
        AMMONIA: {
            min: number;
            max: number;
        };
        NITRITE: {
            min: number;
            max: number;
        };
    };
    FEEDING_RATE: {
        min: number;
        max: number;
    };
    STOCKING_DENSITY: {
        TILAPIA: number;
        CATFISH: number;
        CARP: number;
    };
    HARVEST_SIZE: {
        TILAPIA: number;
        CATFISH: number;
        CARP: number;
    };
};
export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];
export type SuccessMessage = (typeof SUCCESS_MESSAGES)[keyof typeof SUCCESS_MESSAGES];
export type WSEvent = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];
//# sourceMappingURL=index.d.ts.map