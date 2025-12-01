// src/queues/queue.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Redis as RedisClient } from 'ioredis';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  public priceRefreshQueue: Queue;

  constructor(
    @Inject('REDIS_CLIENT') private redisClient: RedisClient | null,
  ) {
    if (this.redisClient) {
      this.priceRefreshQueue = new Queue('price-refresh-queue', {
        connection: this.redisClient,
      });
    } else {
      this.logger.warn('Redis not available. QueueService running in fallback mode');
    }
  }

  async addRefreshJob(sku: string) {
    if (!this.redisClient) {
      this.logger.warn('Skipping job add — Redis not available');
      return;
    }

    await this.priceRefreshQueue.add(
      'refresh-product',
      { sku },
      { removeOnComplete: true, removeOnFail: true },
    );

    this.logger.log(`Job added: refresh product ${sku}`);
  }
}
