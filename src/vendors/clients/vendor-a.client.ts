import { Injectable, Logger } from '@nestjs/common';
import { axiosWithRetry } from '../../common/helpers/retry.helper';

interface VendorAApiResponse {
  price: number;
  availability: string;
  stock: number;
}

@Injectable()
export class VendorAClient {
  private readonly logger = new Logger(VendorAClient.name);

  async fetch(sku: string) {
    const url = `http://localhost:3000/mock/vendor-a/${sku}`;

    try {
      const data = await axiosWithRetry<VendorAApiResponse>(url, {
        retries: 2,
        timeoutMs: 2000,
        retryDelayMs: 200,
      });

      return {
        price: data.price ?? null,
        vendor: 'VendorA',
        availability: data.availability ?? 'UNKNOWN',
        stock: data.stock ?? 0,
        timestamp: Date.now(),
      };
    } catch (err) {
      this.logger.error(`Vendor A failed for ${sku}: ${err?.message}`);
      throw err;
    }
  }
}
