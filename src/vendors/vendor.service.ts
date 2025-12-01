import { Injectable, Logger } from '@nestjs/common';
import { VendorAClient } from './clients/vendor-a.client';
import { VendorBClient } from './clients/vendor-b.client';
import { VendorCClient } from './clients/vendor-c.client';
import { VendorAAdapter } from './adapters/vendor-a.adapter';
import { VendorBAdapter } from './adapters/vendor-b.adapter';
import { VendorCAdapter } from './adapters/vendor-c.adapter';
import { NormalizedVendorResponse } from './types/normalized-vendor-response';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VendorLog, VendorLogDocument } from './schemas/vendor-log.schema';

@Injectable()
export class VendorService {
  private readonly logger = new Logger(VendorService.name);

  constructor(
    private readonly vendorA: VendorAClient,
    private readonly vendorB: VendorBClient,
    private readonly vendorC: VendorCClient,

    @InjectModel(VendorLog.name)
    private vendorLogModel: Model<VendorLogDocument>,
  ) {}

  private vendorMap = [
    { name: 'VendorA', client: 'vendorA', adapter: VendorAAdapter },
    { name: 'VendorB', client: 'vendorB', adapter: VendorBAdapter },
    { name: 'VendorC', client: 'vendorC', adapter: VendorCAdapter },
  ];

  /* ============================================================
      Vendor LOGGING Wrapper
  ============================================================ */
  private async logVendor({
    sku,
    vendor,
    success,
    responseTime,
    price,
    availability,
    errorMessage,
  }) {
    await this.vendorLogModel.create({
      sku,
      vendor,
      success,
      responseTime,
      price,
      availability,
      errorMessage,
    });
  }

  /* ============================================================
        FETCH ALL VENDORS + LOGGING + NORMALIZATION
  ============================================================ */
  async getAllVendors(sku: string): Promise<NormalizedVendorResponse[]> {
    const requests = this.vendorMap.map(vendorInfo => {
      const start = Date.now();
      const client = (this as any)[vendorInfo.client];

      return client
        .fetch(sku)
        .then(res => ({
          status: 'fulfilled',
          vendorInfo,
          response: res,
          duration: Date.now() - start,
        }))
        .catch(err => ({
          status: 'rejected',
          vendorInfo,
          error: err,
          duration: Date.now() - start,
        }));
    });

    const results = await Promise.all(requests);

    const TTL = 10 * 60 * 1000;
    const now = Date.now();
    const final: NormalizedVendorResponse[] = [];

    for (const r of results) {
      const vendor = r.vendorInfo;

      if (r.status === 'fulfilled') {
        try {
          const raw = r.response;
          const norm = vendor.adapter.normalize(raw);

          // Save success log
          await this.logVendor({
            sku,
            vendor: vendor.name,
            success: true,
            responseTime: r.duration,
            price: norm?.price ?? null,
            availability: norm?.availability ?? 'unknown',
            errorMessage: null,
          });

          // TTL validation
          if (norm && now - norm.timestamp.getTime() <= TTL) {
            final.push(norm);
          } else {
            this.logger.warn(
              `${vendor.name} returned stale/invalid data for ${sku}`,
            );
          }
        } catch (err) {
          this.logger.error(
            `${vendor.name} normalization error: ${err?.message ?? err}`,
          );
        }
      } else {
        // Save failed log
        await this.logVendor({
          sku,
          vendor: vendor.name,
          success: false,
          responseTime: r.duration,
          price: null,
          availability: null,
          errorMessage: r.error?.message || 'Vendor fetch failed',
        });

        this.logger.warn(`${vendor.name} fetch failed: ${String(r.error)}`);
      }
    }

    return final;
  }
  
}
