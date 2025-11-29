// src/vendors/clients/vendor-c.client.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VendorHttpFactory } from '../vendor-http.factory';

@Injectable()
export class VendorCClient {
  private axios;

  constructor(
    private config: ConfigService,
    private httpFactory: VendorHttpFactory,
  ) {
    this.axios = this.httpFactory.getInstance();
  }

  async fetch(sku: string): Promise<any> {
    const base = this.config.get<string>('VENDOR_C_URL');
    const url = `${base}/${sku}`;
    const resp = await this.axios.get(url);
    return resp.data;
  }
}
