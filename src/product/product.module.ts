// src/product/product.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { VendorModule } from 'src/vendors/vendor.module';
import { CacheModule } from 'src/cache/cache.module';
import { PriceRefreshWorker } from 'src/queues/workers/price-refresh.worker';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    VendorModule,
    CacheModule,
  ],
  controllers: [ProductController],
  providers: [ProductService , PriceRefreshWorker],
  exports: [ProductService]
})
export class ProductModule {}

