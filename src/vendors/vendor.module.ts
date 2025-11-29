// src/vendors/vendor.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { VendorHttpFactory } from './vendor-http.factory';
import { CircuitBreaker } from './circuit-breaker.util';

import { VendorAClient } from './clients/vendor-a.client';
import { VendorBClient } from './clients/vendor-b.client';
import { VendorCClient } from './clients/vendor-c.client';

import { VendorService } from './vendor.service';
import { VendorMockController } from './mock/vendor.mock.controller';

@Module({
  imports: [ConfigModule],
  controllers: [VendorMockController],
  providers: [
    VendorHttpFactory,
    CircuitBreaker,

    VendorAClient,
    VendorBClient,
    VendorCClient,

    VendorService,
  ],
  exports: [VendorService],
})
export class VendorModule {}
