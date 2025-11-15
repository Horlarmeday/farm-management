import Redis from 'ioredis';
import { config } from '../config';
import { AppError, ErrorType } from '../utils/error-handler';

/**
 * Redis service for caching and session management
 */
export class RedisService {
  private static instance: RedisService;
  private client: Redis;
  private isConnected: boolean = false;

  private constructor() {
    const commonOptions = {
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    } as const;

    if (config.redis.url && config.redis.url.length > 0) {
      const useTLS = config.redis.url.startsWith('rediss://');
      this.client = new Redis(config.redis.url, {
        ...commonOptions,
        ...(useTLS ? { tls: {} } : {}),
      } as any);
    } else {
      this.client = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
        ...commonOptions,
      } as any);
    }

    this.setupEventHandlers();
  }

  /**
   * Get singleton instance of RedisService
   */
  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * Setup Redis event handlers
   */
  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('🔴 Redis: Connecting...');
    });

    this.client.on('ready', () => {
      console.log('✅ Redis: Connection established successfully');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      console.error('❌ Redis: Connection error:', error.message);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('🔴 Redis: Connection closed');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Redis: Reconnecting...');
    });
  }

  /**
   * Initialize Redis connection
   */
  public async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('❌ Redis: Failed to connect:', error);
      throw new AppError('Redis connection failed', ErrorType.INTERNAL_ERROR, 500);
    }
  }

  /**
   * Check if Redis is connected
   */
  public isReady(): boolean {
    return this.isConnected && this.client.status === 'ready';
  }

  /**
   * Set a key-value pair with optional TTL
   */
  public async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      throw new AppError('Cache write failed', ErrorType.INTERNAL_ERROR, 500);
    }
  }

  /**
   * Get a value by key
   */
  public async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a key
   */
  public async delete(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Redis DELETE error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  public async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      return await this.client.del(...keys);
    } catch (error) {
      console.error(`Redis DELETE PATTERN error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if a key exists
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set TTL for an existing key
   */
  public async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttlSeconds);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get TTL for a key
   */
  public async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`Redis TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Increment a numeric value
   */
  public async increment(key: string, amount: number = 1): Promise<number> {
    try {
      if (amount === 1) {
        return await this.client.incr(key);
      } else {
        return await this.client.incrby(key, amount);
      }
    } catch (error) {
      console.error(`Redis INCREMENT error for key ${key}:`, error);
      throw new AppError('Cache increment failed', ErrorType.INTERNAL_ERROR, 500);
    }
  }

  /**
   * Get cache statistics
   */
  public async getStats(): Promise<any> {
    try {
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');
      
      return {
        connected: this.isConnected,
        memory: info,
        keyspace: keyspace,
        uptime: await this.client.info('server'),
      };
    } catch (error) {
      console.error('Redis STATS error:', error);
      return {
        connected: this.isConnected,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Flush all data from current database
   */
  public async flushDb(): Promise<void> {
    try {
      await this.client.flushdb();
    } catch (error) {
      console.error('Redis FLUSHDB error:', error);
      throw new AppError('Cache flush failed', ErrorType.INTERNAL_ERROR, 500);
    }
  }

  /**
   * Close Redis connection
   */
  public async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      this.isConnected = false;
    } catch (error) {
      console.error('Redis DISCONNECT error:', error);
    }
  }

  /**
   * Get the raw Redis client for advanced operations
   */
  public getClient(): Redis {
    return this.client;
  }
}

// Export singleton instance
export const redisService = RedisService.getInstance();