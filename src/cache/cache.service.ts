// src/cache/cache.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis as IORedis } from 'ioredis';

type MemoryEntry = { data: any; expiresAt: number };

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private memoryStore = new Map<string, MemoryEntry>();

  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: IORedis | null,
  ) {}

  private key(sku: string) {
    return `product:sku:${sku}`;
  }

  // GET cached product
  async getProductCache(sku: string): Promise<any | null> {
    const key = this.key(sku);

    // Try Redis first
    if (this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (err) {
        this.logger.warn('Redis GET failed, falling back to memory store');
      }
    }

    // Memory fallback
    const entry = this.memoryStore.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    return entry.data;
  }

  // SET cache with TTL in seconds (default 120 = 2 minutes)
  async setProductCache(sku: string, data: any, ttlSeconds = 120): Promise<void> {
    const key = this.key(sku);
    const payload = JSON.stringify(data);

    if (this.redisClient) {
      try {
        await this.redisClient.set(key, payload, 'EX', ttlSeconds);
        return;
      } catch (err) {
        this.logger.warn('Redis SET failed, writing to memory fallback');
      }
    }

    // Memory fallback
    this.memoryStore.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  // DELETE cache entry
  async deleteProductCache(sku: string): Promise<void> {
    const key = this.key(sku);

    if (this.redisClient) {
      try {
        await this.redisClient.del(key);
        return;
      } catch (err) {
        this.logger.warn('Redis DEL failed, removing from memory fallback');
      }
    }

    this.memoryStore.delete(key);
  }

  // Alias for backward compatibility
  async deleteVendorCache(sku: string): Promise<void> {
    return this.deleteProductCache(sku);
  }

  // For testing / debug: list memory keys (not for production)
  getMemoryKeys(): string[] {
    return Array.from(this.memoryStore.keys());
  }
}
