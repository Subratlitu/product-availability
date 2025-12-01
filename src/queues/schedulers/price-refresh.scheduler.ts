import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';  

import { ProductService } from '../../product/product.service';

@Injectable()
export class PriceRefreshScheduler {
  private readonly logger = new Logger(PriceRefreshScheduler.name);

  constructor(
    private readonly productService: ProductService,
    @InjectQueue('price-refresh') private readonly priceRefreshQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  //@Cron('*/300 * * * * *')  // every 300 seconds for testing

  async schedulePriceRefresh() {
    this.logger.log('🔄 CRON: Starting full price refresh...');

    const products = await this.productService.findAllProducts();

    if (!products.length) {
      this.logger.warn('⚠ No products found.');
      return;
    }

    for (const product of products) {
      await this.priceRefreshQueue.add(
        'refresh',
        { sku: product.sku },
        { removeOnComplete: true, attempts: 3 },
      );
    }

    this.logger.log(` Added ${products.length} products to refresh queue.`);
  }
}
