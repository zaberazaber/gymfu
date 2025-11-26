import { createHash } from 'crypto';
import { redisClient } from '../config/database';

export class CacheManager {
  private prefix: string = 'ai:';
  private defaultTTL: number = 86400; // 24 hours in seconds

  /**
   * Generate a cache key based on user ID, analysis type, and data hash
   */
  generateKey(userId: string, analysisType: string, dataHash: string): string {
    return `${this.prefix}${userId}:${analysisType}:${dataHash}`;
  }

  /**
   * Generate a hash from data object for cache key
   */
  hashData(data: any): string {
    const dataString = JSON.stringify(data);
    return createHash('md5').update(dataString).digest('hex');
  }

  /**
   * Get cached value
   */
  async get(key: string): Promise<string | null> {
    try {
      if (!redisClient.isOpen) {
        console.warn('Redis client not connected, skipping cache get');
        return null;
      }

      const value = await redisClient.get(key);
      
      if (value) {
        console.log(`Cache HIT: ${key}`);
      } else {
        console.log(`Cache MISS: ${key}`);
      }

      return value;
    } catch (error) {
      console.error('Error getting from cache:', error);
      return null;
    }
  }

  /**
   * Set cached value with TTL
   */
  async set(key: string, value: string, ttl: number = this.defaultTTL): Promise<void> {
    try {
      if (!redisClient.isOpen) {
        console.warn('Redis client not connected, skipping cache set');
        return;
      }

      await redisClient.setEx(key, ttl, value);
      console.log(`Cache SET: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<void> {
    try {
      if (!redisClient.isOpen) {
        console.warn('Redis client not connected, skipping cache delete');
        return;
      }

      await redisClient.del(key);
      console.log(`Cache DELETE: ${key}`);
    } catch (error) {
      console.error('Error deleting from cache:', error);
    }
  }

  /**
   * Delete all cached values for a user
   */
  async deleteUserCache(userId: string): Promise<void> {
    try {
      if (!redisClient.isOpen) {
        console.warn('Redis client not connected, skipping cache delete');
        return;
      }

      const pattern = `${this.prefix}${userId}:*`;
      const keys = await redisClient.keys(pattern);

      if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(`Cache DELETE: ${keys.length} keys for user ${userId}`);
      }
    } catch (error) {
      console.error('Error deleting user cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalKeys: number;
    aiKeys: number;
    memoryUsed: string;
  }> {
    try {
      if (!redisClient.isOpen) {
        return { totalKeys: 0, aiKeys: 0, memoryUsed: '0' };
      }

      const allKeys = await redisClient.keys('*');
      const aiKeys = await redisClient.keys(`${this.prefix}*`);
      const info = await redisClient.info('memory');
      
      // Parse memory usage from info string
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memoryUsed = memoryMatch ? memoryMatch[1] : '0';

      return {
        totalKeys: allKeys.length,
        aiKeys: aiKeys.length,
        memoryUsed,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { totalKeys: 0, aiKeys: 0, memoryUsed: '0' };
    }
  }

  /**
   * Clear all AI cache
   */
  async clearAll(): Promise<void> {
    try {
      if (!redisClient.isOpen) {
        console.warn('Redis client not connected, skipping cache clear');
        return;
      }

      const keys = await redisClient.keys(`${this.prefix}*`);
      
      if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(`Cache CLEAR: ${keys.length} AI cache keys deleted`);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Check if cache is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      return redisClient.isOpen;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
export const cacheManager = new CacheManager();
