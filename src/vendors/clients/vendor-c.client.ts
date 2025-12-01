// src/vendors/clients/vendor-c.client.ts
import { Injectable, Logger, HttpException } from '@nestjs/common';
import { axiosWithRetry } from '../../common/helpers/retry.helper';
import { CircuitBreakerService } from '../circuit-breaker.service';

interface VendorCApiResponse {
  cost: number;
  available: boolean;
  quantity: number;
}

@Injectable()
export class VendorCClient {
  private readonly logger = new Logger(VendorCClient.name);
  private readonly breakerKey = 'vendorC'; // identifier for this vendor in the breaker

  constructor(private readonly circuit: CircuitBreakerService) {}

  /**
   * Fetch vendor-C data with retries (axiosWithRetry) and circuit-breaker protection.
   * If the circuit is OPEN -> we throw a special HttpException to be logged and skipped upstream.
   */
  async fetch(sku: string) {
    // Check circuit state first
    if (!this.circuit.canRequest(this.breakerKey)) {
      // Circuit is open — skip calling vendor C
      this.logger.warn(`VendorC skipped by circuit breaker for SKU=${sku}`);
      // Throwing allows upstream Promise.allSettled to mark it as rejected; we could also return a sentinel value
      throw new HttpException('VendorC circuit open - skipped', 503);
    }

    const url = `${process.env.VENDOR_C_URL ?? 'http://localhost:3000/mock/vendor-c'}/${sku}`;

    try {
      const data = await axiosWithRetry<VendorCApiResponse>(url, {
        retries: Number(process.env.VENDOR_RETRIES ?? 2),
        timeoutMs: Number(process.env.VENDOR_REQUEST_TIMEOUT_MS ?? 2000),
        retryDelayMs: 200,
      });

      // On success -> inform circuit breaker
      this.circuit.onSuccess(this.breakerKey);

      return {
        price: data.cost ?? null,
        vendor: 'VendorC',
        availability: data.available ? 'IN_STOCK' : 'OUT_OF_STOCK',
        stock: data.quantity ?? 0,
        timestamp: new Date(),
      };
    } catch (err) {
      // Final failure (after retries) -> inform circuit breaker
      this.circuit.onFailure(this.breakerKey);

      this.logger.error(`Vendor C failed for ${sku}: ${err?.message ?? err}`);

      // Bubble the error upstream so ProductService/vendor.service can ignore it gracefully
      throw err;
    }
  }
}
