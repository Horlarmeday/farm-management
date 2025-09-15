import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../../shared/src/types';

// Simple in-memory cache for development
// In production, this should be replaced with Redis
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set(key: string, data: any, ttlMinutes: number = 10): void {
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

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Global cache instance
const cache = new MemoryCache();

/**
 * Cache middleware factory
 * Creates a cache middleware with specified TTL
 */
export const cacheMiddleware = (ttlMinutes: number = 10) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create cache key from URL and query parameters
    const cacheKey = `${req.originalUrl}_${JSON.stringify(req.query)}_${req.user?.id || 'anonymous'}`;
    
    // Try to get cached response
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      console.log(`📦 Cache HIT for key: ${cacheKey}`);
      return res.json(cachedResponse);
    }

    console.log(`🔍 Cache MISS for key: ${cacheKey}`);

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache the response
    res.json = function(data: any) {
      // Only cache successful responses
      if (res.statusCode === 200 && data && typeof data === 'object') {
        cache.set(cacheKey, data, ttlMinutes);
        console.log(`💾 Cached response for key: ${cacheKey}`);
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Cache invalidation middleware
 * Clears cache entries that match a pattern
 */
export const invalidateCache = (pattern?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (pattern) {
      // Clear specific cache entries matching pattern
      const stats = cache.getStats();
      const keysToDelete = stats.keys.filter(key => key.includes(pattern));
      keysToDelete.forEach(key => cache.delete(key));
      console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
    } else {
      // Clear all cache
      cache.clear();
      console.log('🗑️ Cleared all cache entries');
    }
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
export const getCacheStats = (req: Request, res: Response) => {
  const stats = cache.getStats();
  res.json({
    success: true,
    data: stats,
    message: 'Cache statistics retrieved successfully',
  } as ApiResponse<typeof stats>);
};

export { cache };