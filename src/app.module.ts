import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductModule } from './product/product.module';
import { VendorModule } from './vendors/vendor.module';
import { RedisModule } from './cache/redis.module';
import { QueueModule } from './queues/queue.module';  
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),

    RedisModule,      // redis provider
    QueueModule,      
    ProductModule,
    VendorModule,
     ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
