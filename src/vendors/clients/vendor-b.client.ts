import { Injectable, Logger } from '@nestjs/common';
import { axiosWithRetry } from '../../common/helpers/retry.helper';

interface VendorBApiResponse {
  amount: number;
  inStock: boolean;
  stock: number;
}

@Injectable()
export class VendorBClient {
  private readonly logger = new Logger(VendorBClient.name);

  async fetch(sku: string) {
    const url = `http://localhost:3000/mock/vendor-b/${sku}`;

    try {
      const data = await axiosWithRetry<VendorBApiResponse>(url, {
        retries: 2,
        timeoutMs: 2000,
        retryDelayMs: 200,
      });

      return {
        price: data.amount ?? null,
        vendor: 'VendorB',
        availability: data.inStock ? 'IN_STOCK' : 'OUT_OF_STOCK',
        stock: data.stock ?? 0,
        timestamp: Date.now(),
      };
      
    } catch (err) {
      this.logger.error(`Vendor B failed for ${sku}: ${err?.message}`);
      throw err;
    }
  }
}
