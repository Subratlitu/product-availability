// src/queues/refresh.scheduler.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProductService } from 'src/product/product.service';
import { QueueService } from './queue.service';

@Injectable()
export class RefreshScheduler {
  constructor(
    private productService: ProductService,
    private queueService: QueueService,
  ) { }

  @Cron('0 */30 * * * *') // every 30 minutes
  async refreshAllProducts() {
    const products = await this.productService.getAllSkus();
    products.forEach((p) => {
      this.queueService.addRefreshJob(p.sku);
    });
  }
}
