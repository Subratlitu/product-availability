// import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { ProductModule } from './product/product.module';
// import { VendorModule } from './vendors/vendor.module';  
// import { MongooseModule } from '@nestjs/mongoose';
// import { RedisModule } from './cache/redis.module';
// import { CacheService } from './cache/cache.service';


// console.log('Mongo URI:', process.env.MONGODB_URI);
// console.log('Mongo URI:', process.env.MONGODB_URI);

// @Module({
   
//   imports: [
//     ConfigModule.forRoot({ isGlobal: true }),
//     MongooseModule.forRoot(process.env.MONGODB_URI),
//     RedisModule,
//     ProductModule,
//     VendorModule,
//   ],
// })
// export class AppModule {}
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from './product/product.module';
import { VendorModule } from './vendors/vendor.module';
import { RedisModule } from './cache/redis.module';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'], // ensure your .env is in root of server/
    }),

    // Configure Mongoose asynchronously with ConfigService
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error('MONGODB_URI is not defined in the environment variables!');
        }
        return {
          uri,
          // Optional Mongoose options
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      },
    }),

    // Redis module (assumes you have a proper RedisModule)
    RedisModule,

    // Your feature modules
    ProductModule,
    VendorModule,
  ],
})
export class AppModule {}
