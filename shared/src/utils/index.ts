import { ERROR_MESSAGES, EMAIL_REGEX, PHONE_REGEX } from '../constants';

// Date utilities
export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const diffInDays = (date1: Date, date2: Date): number => {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isExpired = (date: Date): boolean => {
  return date < new Date();
};

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => capitalize(txt));
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateCode = (prefix: string = '', length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix ? `${prefix}-${result}` : result;
};

export const truncate = (str: string, maxLength: number, suffix: string = '...'): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

// Number utilities
export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100; // Round to 2 decimal places
};

export const roundToDecimals = (num: number, decimals: number = 2): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Array utilities
export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    },
    {} as Record<string, T[]>,
  );
};

export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Object utilities
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const isEmpty = (value: any): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateRequired = (value: any, fieldName: string): string | null => {
  if (isEmpty(value)) {
    return ERROR_MESSAGES.REQUIRED_FIELD.replace('{field}', fieldName);
  }
  return null;
};

export const validateMinLength = (value: string, min: number, fieldName: string): string | null => {
  if (value && value.length < min) {
    return ERROR_MESSAGES.MIN_LENGTH.replace('{min}', String(min)).replace('{field}', fieldName);
  }
  return null;
};

export const validateMaxLength = (value: string, max: number, fieldName: string): string | null => {
  if (value && value.length > max) {
    return ERROR_MESSAGES.MAX_LENGTH.replace('{max}', String(max)).replace('{field}', fieldName);
  }
  return null;
};

export const validateMinValue = (value: number, min: number, fieldName: string): string | null => {
  if (value != null && value < min) {
    return ERROR_MESSAGES.MIN_VALUE.replace('{min}', String(min)).replace('{field}', fieldName);
  }
  return null;
};

export const validateMaxValue = (value: number, max: number, fieldName: string): string | null => {
  if (value != null && value > max) {
    return ERROR_MESSAGES.MAX_VALUE.replace('{max}', String(max)).replace('{field}', fieldName);
  }
  return null;
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

export const getMimeTypeFromExtension = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    txt: 'text/plain',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

// Color utilities
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result && result[1] && result[2] && result[3]
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
};

export const getContrastColor = (hex: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';

  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

// Farm-specific utilities
export const calculateFeedConversionRatio = (feedConsumed: number, weightGain: number): number => {
  if (weightGain === 0) return 0;
  return roundToDecimals(feedConsumed / weightGain, 2);
};

export const calculateProductionRate = (eggsProduced: number, totalBirds: number): number => {
  if (totalBirds === 0) return 0;
  return roundToDecimals((eggsProduced / totalBirds) * 100, 2);
};

export const calculateMortalityRate = (deaths: number, totalAnimals: number): number => {
  if (totalAnimals === 0) return 0;
  return roundToDecimals((deaths / totalAnimals) * 100, 2);
};

export const calculateProfitMargin = (revenue: number, costs: number): number => {
  if (revenue === 0) return 0;
  const profit = revenue - costs;
  return roundToDecimals((profit / revenue) * 100, 2);
};

export const calculateStockingDensity = (fishCount: number, pondVolume: number): number => {
  if (pondVolume === 0) return 0;
  return roundToDecimals(fishCount / pondVolume, 2);
};

export const calculateBMI = (weight: number, height: number): number => {
  if (height === 0) return 0;
  return roundToDecimals(weight / Math.pow(height / 100, 2), 2);
};

// Export all utilities as a default object for convenience
export default {
  // Date utilities
  formatDate,
  parseDate,
  isValidDate,
  addDays,
  diffInDays,
  isToday,
  isExpired,

  // String utilities
  capitalize,
  capitalizeWords,
  slugify,
  generateCode,
  truncate,

  // Number utilities
  formatNumber,
  formatCurrency,
  calculatePercentage,
  roundToDecimals,
  clamp,

  // Array utilities
  unique,
  groupBy,
  sortBy,
  chunk,

  // Object utilities
  omit,
  pick,
  isEmpty,
  deepClone,

  // Validation utilities
  isValidEmail,
  isValidPhone,
  isValidUrl,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateMinValue,
  validateMaxValue,

  // File utilities
  formatFileSize,
  getFileExtension,
  getMimeTypeFromExtension,

  // Color utilities
  hexToRgb,
  rgbToHex,
  getContrastColor,

  // Farm-specific utilities
  calculateFeedConversionRatio,
  calculateProductionRate,
  calculateMortalityRate,
  calculateProfitMargin,
  calculateStockingDensity,
  calculateBMI,
};
