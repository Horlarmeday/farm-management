import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../../shared/src/types';
import { redisService } from '../services/redis.service';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);

// Fallback in-memory cache for when Redis is unavailable
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class FallbackCache {
  private cache: Map<string, CacheEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set(key: string, data: any, ttlMinutes: number = 15): void {
    const ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  deletePattern(pattern: string): number {
    let deletedCount = 0;
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): any {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++;
      } else {
        activeEntries++;
      }
    }

    return {
      type: 'fallback',
      totalEntries: this.cache.size,
      activeEntries,
      expiredEntries,
      memoryUsage: process.memoryUsage(),
    };
  }

  clear(): void {
    this.cache.clear();
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Cache abstraction layer
class CacheService {
  private fallbackCache = new FallbackCache();

  async set(key: string, data: any, ttlMinutes: number = 15): Promise<void> {
    try {
      if (redisService.isReady()) {
        await redisService.set(key, data, ttlMinutes * 60);
      } else {
        this.fallbackCache.set(key, data, ttlMinutes);
      }
    } catch (error) {
      console.warn('Cache SET fallback to memory:', getErrorMessage(error));
      this.fallbackCache.set(key, data, ttlMinutes);
    }
  }

  async get(key: string): Promise<any | null> {
    try {
      if (redisService.isReady()) {
        return await redisService.get(key);
      } else {
        return this.fallbackCache.get(key);
      }
    } catch (error) {
      console.warn('Cache GET fallback to memory:', getErrorMessage(error));
      return this.fallbackCache.get(key);
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      if (redisService.isReady()) {
        return await redisService.delete(key);
      } else {
        return this.fallbackCache.delete(key);
      }
    } catch (error) {
      console.warn('Cache DELETE fallback to memory:', getErrorMessage(error));
      return this.fallbackCache.delete(key);
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    try {
      if (redisService.isReady()) {
        return await redisService.deletePattern(pattern);
      } else {
        return this.fallbackCache.deletePattern(pattern);
      }
    } catch (error) {
      console.warn('Cache DELETE PATTERN fallback to memory:', getErrorMessage(error));
      return this.fallbackCache.deletePattern(pattern);
    }
  }

  async getStats(): Promise<any> {
    try {
      if (redisService.isReady()) {
        const redisStats = await redisService.getStats();
        return {
          type: 'redis',
          ...redisStats,
        };
      } else {
        return this.fallbackCache.getStats();
      }
    } catch (error) {
      console.warn('Cache STATS fallback to memory:', getErrorMessage(error));
      return this.fallbackCache.getStats();
    }
  }

  async clear(): Promise<void> {
    try {
      if (redisService.isReady()) {
        await redisService.flushDb();
      } else {
        this.fallbackCache.clear();
      }
    } catch (error) {
      console.warn('Cache CLEAR fallback to memory:', getErrorMessage(error));
      this.fallbackCache.clear();
    }
  }
}

// Global cache instance
const cache = new CacheService();

/**
 * Cache middleware factory
 * Creates middleware that caches GET responses
 */
export const cacheMiddleware = (ttlMinutes: number = 15) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `cache:${req.originalUrl}:${JSON.stringify(req.query)}`;
    
    try {
      const cachedData = await cache.get(cacheKey);

      if (cachedData) {
        return res.json({
          success: true,
          data: cachedData,
          cached: true,
          timestamp: new Date().toISOString(),
        } as ApiResponse<any>);
      }
    } catch (error) {
      console.warn('Cache GET error, proceeding without cache:', getErrorMessage(error));
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache the response
    res.json = function (body: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (body && body.success && body.data) {
          // Cache asynchronously without blocking response
          cache.set(cacheKey, body.data, ttlMinutes).catch(error => {
            console.warn('Cache SET error:', getErrorMessage(error));
          });
        }
      }

      // Call original json method
      return originalJson.call(this, body);
    };

    next();
  };
};

/**
 * Middleware to invalidate cache entries
 * Useful for POST, PUT, DELETE operations
 */
export const invalidateCache = (patterns: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json;

    // Override json method to invalidate cache after successful response
    res.json = function (body: any) {
      // Only invalidate cache for successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach(pattern => {
          const cachePattern = `cache:${pattern}`;
          // Invalidate cache asynchronously without blocking response
          cache.deletePattern(cachePattern).catch(error => {
            console.warn('Cache invalidation error:', getErrorMessage(error));
          });
        });
      }

      // Call original json method
      return originalJson.call(this, body);
    };

    next();
  };
};

/**
 * Reports-specific cache middleware
 * Caches reports for 15 minutes
 */
export const reportsCacheMiddleware = cacheMiddleware(15);

/**
 * Cache statistics endpoint middleware
 */
export const getCacheStats = async (req: Request, res: Response) => {
  try {
    const stats = await cache.getStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cache statistics',
      error: getErrorMessage(error),
      timestamp: new Date().toISOString(),
    } as ApiResponse<any>);
  }
};

/**
 * Clear cache endpoint middleware
 */
export const clearCache = async (req: Request, res: Response) => {
  try {
    await cache.clear();
    res.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString(),
    } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: getErrorMessage(error),
      timestamp: new Date().toISOString(),
    } as ApiResponse<any>);
  }
};

export { cache };