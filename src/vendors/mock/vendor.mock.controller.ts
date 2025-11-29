import { Controller, Get, Param } from '@nestjs/common';

@Controller('mock')
export class VendorMockController {
  
  @Get('vendor-a/:sku')
  vendorA(@Param('sku') sku: string) {
    return {
      product_id: sku,
      price: Math.random() * 500,
      inventory: Math.random() > 0.5 ? 10 : null,
      status: Math.random() > 0.3 ? "IN_STOCK" : "OUT_OF_STOCK",
      timestamp: new Date(),
    };
  }

  @Get('vendor-b/:sku')
  vendorB(@Param('sku') sku: string) {
    return {
      sku,
      amount: (Math.random() * 300).toFixed(2),
      in_stock: Math.random() > 0.6,
      updated_at: new Date(),
    };
  }

  // Simulating slow + failing vendor
  @Get('vendor-c/:sku')
  async vendorC(@Param('sku') sku: string) {
    const delay = Math.random() * 3000;
    await new Promise(res => setTimeout(res, delay));

    if (Math.random() < 0.3) {  
      throw new Error("Vendor C exploded  (simulated failure)");
    }

    return {
      code: sku,
      cost: Math.floor(Math.random() * 400),
      stock: Math.random() > 0.8 ? 0 : 7,
      ts: new Date(),
    };
  }
}
