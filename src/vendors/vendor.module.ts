// src/vendors/vendor.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VendorHttpFactory } from './vendor-http.factory';
import { VendorAClient } from './clients/vendor-a.client';
import { VendorBClient } from './clients/vendor-b.client';
import { VendorCClient } from './clients/vendor-c.client';
import { VendorService } from './vendor.service';
import { VendorMockController } from './mock/vendor.mock.controller'; // if you have the mock controller

@Module({
  imports: [ConfigModule],
  controllers: [VendorMockController], // remove if you placed the mock controller elsewhere
  providers: [
    VendorHttpFactory,
    VendorAClient,
    VendorBClient,
    VendorCClient,
    VendorService,
  ],
  exports: [VendorService],
})
export class VendorModule {}
