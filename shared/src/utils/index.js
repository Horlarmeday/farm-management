import { ERROR_MESSAGES, EMAIL_REGEX, PHONE_REGEX } from '../constants';
export const formatDate = (date, format = 'YYYY-MM-DD') => {
    const d = new Date(date);
    if (isNaN(d.getTime()))
        return '';
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
export const parseDate = (dateString) => {
    if (!dateString)
        return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
};
export const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date.getTime());
};
export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
export const diffInDays = (date1, date2) => {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};
export const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
};
export const isExpired = (date) => {
    return date < new Date();
};
export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
export const capitalizeWords = (str) => {
    return str.replace(/\w\S*/g, (txt) => capitalize(txt));
};
export const slugify = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
export const generateCode = (prefix = '', length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix ? `${prefix}-${result}` : result;
};
export const truncate = (str, maxLength, suffix = '...') => {
    if (str.length <= maxLength)
        return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
};
export const formatNumber = (num, decimals = 2) => {
    return num.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};
export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
    }).format(amount);
};
export const calculatePercentage = (value, total) => {
    if (total === 0)
        return 0;
    return Math.round((value / total) * 100 * 100) / 100;
};
export const roundToDecimals = (num, decimals = 2) => {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};
export const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};
export const unique = (array) => {
    return Array.from(new Set(array));
};
export const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
        const group = String(item[key]);
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
};
export const sortBy = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal < bVal)
            return order === 'asc' ? -1 : 1;
        if (aVal > bVal)
            return order === 'asc' ? 1 : -1;
        return 0;
    });
};
export const chunk = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};
export const omit = (obj, keys) => {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result;
};
export const pick = (obj, keys) => {
    const result = {};
    keys.forEach((key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
};
export const isEmpty = (value) => {
    if (value == null)
        return true;
    if (typeof value === 'string')
        return value.trim() === '';
    if (Array.isArray(value))
        return value.length === 0;
    if (typeof value === 'object')
        return Object.keys(value).length === 0;
    return false;
};
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};
export const isValidEmail = (email) => {
    return EMAIL_REGEX.test(email);
};
export const isValidPhone = (phone) => {
    return PHONE_REGEX.test(phone);
};
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
export const validateRequired = (value, fieldName) => {
    if (isEmpty(value)) {
        return ERROR_MESSAGES.REQUIRED_FIELD.replace('{field}', fieldName);
    }
    return null;
};
export const validateMinLength = (value, min, fieldName) => {
    if (value && value.length < min) {
        return ERROR_MESSAGES.MIN_LENGTH.replace('{min}', String(min)).replace('{field}', fieldName);
    }
    return null;
};
export const validateMaxLength = (value, max, fieldName) => {
    if (value && value.length > max) {
        return ERROR_MESSAGES.MAX_LENGTH.replace('{max}', String(max)).replace('{field}', fieldName);
    }
    return null;
};
export const validateMinValue = (value, min, fieldName) => {
    if (value != null && value < min) {
        return ERROR_MESSAGES.MIN_VALUE.replace('{min}', String(min)).replace('{field}', fieldName);
    }
    return null;
};
export const validateMaxValue = (value, max, fieldName) => {
    if (value != null && value > max) {
        return ERROR_MESSAGES.MAX_VALUE.replace('{max}', String(max)).replace('{field}', fieldName);
    }
    return null;
};
export const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
export const getFileExtension = (filename) => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};
export const getMimeTypeFromExtension = (extension) => {
    const mimeTypes = {
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
export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result && result[1] && result[2] && result[3]
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
};
export const rgbToHex = (r, g, b) => {
    return ('#' +
        [r, g, b]
            .map((x) => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        })
            .join(''));
};
export const getContrastColor = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb)
        return '#000000';
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
};
export const calculateFeedConversionRatio = (feedConsumed, weightGain) => {
    if (weightGain === 0)
        return 0;
    return roundToDecimals(feedConsumed / weightGain, 2);
};
export const calculateProductionRate = (eggsProduced, totalBirds) => {
    if (totalBirds === 0)
        return 0;
    return roundToDecimals((eggsProduced / totalBirds) * 100, 2);
};
export const calculateMortalityRate = (deaths, totalAnimals) => {
    if (totalAnimals === 0)
        return 0;
    return roundToDecimals((deaths / totalAnimals) * 100, 2);
};
export const calculateProfitMargin = (revenue, costs) => {
    if (revenue === 0)
        return 0;
    const profit = revenue - costs;
    return roundToDecimals((profit / revenue) * 100, 2);
};
export const calculateStockingDensity = (fishCount, pondVolume) => {
    if (pondVolume === 0)
        return 0;
    return roundToDecimals(fishCount / pondVolume, 2);
};
export const calculateBMI = (weight, height) => {
    if (height === 0)
        return 0;
    return roundToDecimals(weight / Math.pow(height / 100, 2), 2);
};
export default {
    formatDate,
    parseDate,
    isValidDate,
    addDays,
    diffInDays,
    isToday,
    isExpired,
    capitalize,
    capitalizeWords,
    slugify,
    generateCode,
    truncate,
    formatNumber,
    formatCurrency,
    calculatePercentage,
    roundToDecimals,
    clamp,
    unique,
    groupBy,
    sortBy,
    chunk,
    omit,
    pick,
    isEmpty,
    deepClone,
    isValidEmail,
    isValidPhone,
    isValidUrl,
    validateRequired,
    validateMinLength,
    validateMaxLength,
    validateMinValue,
    validateMaxValue,
    formatFileSize,
    getFileExtension,
    getMimeTypeFromExtension,
    hexToRgb,
    rgbToHex,
    getContrastColor,
    calculateFeedConversionRatio,
    calculateProductionRate,
    calculateMortalityRate,
    calculateProfitMargin,
    calculateStockingDensity,
    calculateBMI,
};
//# sourceMappingURL=index.js.map