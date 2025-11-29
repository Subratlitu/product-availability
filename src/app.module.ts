import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { VendorModule } from './vendors/vendor.module';  
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),

    MongooseModule.forRoot(
      process.env.MONGO_URI ||
        'mongodb+srv://subrat1234:litu1234@cluster0.h1cfx.mongodb.net/product_availability?retryWrites=true&w=majority'
    ),

    ProductModule,
    VendorModule,   // <-- YOU FORGOT THIS
  ],
})
export class AppModule {}
