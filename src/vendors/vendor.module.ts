// src/vendors/vendor.module.ts
import { Module } from '@nestjs/common';
import { VendorAClient } from './clients/vendor-a.client';
import { VendorBClient } from './clients/vendor-b.client';
import { VendorCClient } from './clients/vendor-c.client';
import { VendorService } from './vendor.service';
import { CircuitBreakerService } from './circuit-breaker.service';
import { VendorMockController } from './mock/vendor.mock.controller';
import { VendorLog, VendorLogSchema } from './schemas/vendor-log.schema';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VendorLog.name, schema: VendorLogSchema }
    ]),
  ],
  controllers: [VendorMockController], 
  providers: [
    VendorAClient,
    VendorBClient,
    VendorCClient,
    VendorService,
    CircuitBreakerService,
  ],
  exports: [VendorService],
})
export class VendorModule {}
