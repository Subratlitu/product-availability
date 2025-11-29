// src/vendors/clients/vendor-a.client.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VendorHttpFactory } from '../vendor-http.factory';

@Injectable()
export class VendorAClient {
  private axios;

  constructor(
    private config: ConfigService,
    private httpFactory: VendorHttpFactory,
  ) {
    this.axios = this.httpFactory.getInstance();
  }

  async fetch(sku: string): Promise<any> {
    const base = this.config.get<string>('VENDOR_A_URL');
    const url = `${base}/${sku}`;
    const resp = await this.axios.get(url);
    return resp.data;
  }
}
