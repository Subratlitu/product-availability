// src/vendors/vendor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { VendorAClient } from './clients/vendor-a.client';
import { VendorBClient } from './clients/vendor-b.client';
import { VendorCClient } from './clients/vendor-c.client';
import { VendorAAdapter } from './adapters/vendor-a.adapter';
import { VendorBAdapter } from './adapters/vendor-b.adapter';
import { VendorCAdapter } from './adapters/vendor-c.adapter';
import { NormalizedVendorResponse } from './types/normalized-vendor-response';

@Injectable()
export class VendorService {
  private readonly logger = new Logger(VendorService.name);

  constructor(
    private readonly vendorA: VendorAClient,
    private readonly vendorB: VendorBClient,
    private readonly vendorC: VendorCClient,
  ) {}

  /**
   * Call all vendors in parallel, normalize responses, and apply freshness rule.
   * Returns NormalizedVendorResponse[]
   */
  async getAllVendors(sku: string): Promise<NormalizedVendorResponse[]> {
    const results = await Promise.allSettled([
      this.vendorA.fetch(sku),
      this.vendorB.fetch(sku),
      this.vendorC.fetch(sku),
    ]);

    const now = Date.now();
    const TEN_MINUTES_MS = 10 * 60 * 1000;

    const normalized: NormalizedVendorResponse[] = [];

    // Vendor A result
    if (results[0].status === 'fulfilled') {
      try {
        const raw = results[0].value;
        const norm = VendorAAdapter.normalize(raw);
        if (norm && (now - norm.timestamp.getTime()) <= TEN_MINUTES_MS) {
          normalized.push(norm);
        } else {
          this.logger.warn(`VendorA returned stale or invalid data for ${sku}`);
        }
      } catch (err) {
        this.logger.error(`VendorA normalization error for ${sku}: ${err?.message ?? err}`);
      }
    } else {
      this.logger.warn(`VendorA fetch failed for ${sku}: ${String((results[0] as PromiseRejectedResult).reason)}`);
    }

    // Vendor B result
    if (results[1].status === 'fulfilled') {
      try {
        const raw = results[1].value;
        const norm = VendorBAdapter.normalize(raw);
        if (norm && (now - norm.timestamp.getTime()) <= TEN_MINUTES_MS) {
          normalized.push(norm);
        } else {
          this.logger.warn(`VendorB returned stale or invalid data for ${sku}`);
        }
      } catch (err) {
        this.logger.error(`VendorB normalization error for ${sku}: ${err?.message ?? err}`);
      }
    } else {
      this.logger.warn(`VendorB fetch failed for ${sku}: ${String((results[1] as PromiseRejectedResult).reason)}`);
    }

    // Vendor C result
    if (results[2].status === 'fulfilled') {
      try {
        const raw = results[2].value;
        const norm = VendorCAdapter.normalize(raw);
        if (norm && (now - norm.timestamp.getTime()) <= TEN_MINUTES_MS) {
          normalized.push(norm);
        } else {
          this.logger.warn(`VendorC returned stale or invalid data for ${sku}`);
        }
      } catch (err) {
        this.logger.error(`VendorC normalization error for ${sku}: ${err?.message ?? err}`);
      }
    } else {
      this.logger.warn(`VendorC fetch failed for ${sku}: ${String((results[2] as PromiseRejectedResult).reason)}`);
    }

    return normalized;
  }
}
