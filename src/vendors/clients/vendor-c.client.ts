// src/vendors/clients/vendor-c.client.ts
import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VendorHttpFactory } from '../vendor-http.factory';
import { CircuitBreaker } from '../circuit-breaker.util';

@Injectable()
export class VendorCClient {
  private axios;

  constructor(
    private config: ConfigService,
    private httpFactory: VendorHttpFactory,
    private circuit: CircuitBreaker,
  ) {
    this.axios = this.httpFactory.getInstance();
  }

  async fetch(sku: string): Promise<any> {
    // ---- CIRCUIT BREAKER ----
    if (!this.circuit.canRequest()) {
      throw new HttpException(
        'VendorC circuit breaker: temporarily unavailable',
        503,
      );
    }

    const base = this.config.get<string>('VENDOR_C_URL');
    const url = `${base}/${sku}`;

    try {
      const resp = await this.axios.get(url);

      // SUCCESS → reset breaker
      this.circuit.onSuccess();

      return resp.data;
    } catch (err) {
      // FAILURE → update breaker
      this.circuit.onFailure();

      throw err;
    }
  }
}
