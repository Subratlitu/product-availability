import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { VendorModule } from 'src/vendors/vendor.module';  

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
    ]),
    VendorModule
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
