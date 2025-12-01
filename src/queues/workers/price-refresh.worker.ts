// src/queues/workers/price-refresh.worker.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Worker } from 'bullmq';
import { Redis as RedisClient } from 'ioredis';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class PriceRefreshWorker {
  private readonly logger = new Logger(PriceRefreshWorker.name);

  constructor(
    @Inject('REDIS_CLIENT') private redisClient: RedisClient | null,
    private readonly productService: ProductService,
  ) {
    if (!this.redisClient) {
      this.logger.warn('Redis unavailable — PriceRefresh Worker not started');
      return;
    }

    //  Worker is created only if Redis is available
    const worker = new Worker(
      'price-refresh-queue',
      async (job) => {
        const sku = job.data.sku;

        this.logger.log(`Worker processing refresh for ${sku}`);

        try {
          
          await this.productService.refreshProduct(sku);

          this.logger.log(`Worker completed refresh for ${sku}`);
        } catch (err) {
          this.logger.error(
            `Worker failed for ${sku}: ${err?.message ?? err}`,
          );
          throw err;
        }
      },
      {
        connection: this.redisClient as any,
      },
    );

    // Global worker-level error handling
    worker.on('error', (err) => {
      this.logger.error('Worker error: ' + (err?.message ?? err));
    });

    this.logger.log('PriceRefresh Worker started 🚀');
  }
}
