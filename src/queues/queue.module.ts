import { Global, Module } from '@nestjs/common';
import { RedisModule } from '../cache/redis.module';
import { QueueService } from './queue.service';
import { PriceRefreshWorker } from './workers/price-refresh.worker';
import { ProductModule } from 'src/product/product.module';
import { PriceRefreshScheduler } from './schedulers/price-refresh.scheduler';

import { BullModule } from '@nestjs/bull';

@Global()
@Module({
  imports: [
    RedisModule,
    ProductModule,
    BullModule.registerQueue({
      name: 'price-refresh',
    }),
  ],
  providers: [
    QueueService,
    PriceRefreshWorker,
    PriceRefreshScheduler,
  ],
  exports: [QueueService],
})
export class QueueModule { }
