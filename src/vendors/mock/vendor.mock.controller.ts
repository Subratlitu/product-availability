import { Controller, Get, Param } from '@nestjs/common';

@Controller('mock')
export class VendorMockController {

  // -----------------------------------------------------
  // ✅ Vendor A mock (matches VendorAClient expected shape)
  // -----------------------------------------------------
  @Get('vendor-a/:sku')
  vendorA(@Param('sku') sku: string) {
    return {
      price: Number((Math.random() * 500).toFixed(2)),  // numeric
      availability: Math.random() > 0.3 ? 'IN_STOCK' : 'OUT_OF_STOCK',
      stock: Math.random() > 0.5 ? 10 : 0,              // numeric
    };
  }

  // -----------------------------------------------------
  // ✅ Vendor B mock (matches VendorBClient expected shape)
  // -----------------------------------------------------
  @Get('vendor-b/:sku')
  vendorB(@Param('sku') sku: string) {
    return {
      amount: Math.floor(Math.random() * 300),          // numeric
      inStock: Math.random() > 0.4,                     // boolean
      stock: Math.random() > 0.6 ? 0 : 5,               // numeric
    };
  }

  // -----------------------------------------------------
  // ✅ Vendor C mock (matches VendorCClient expected shape)
  // -----------------------------------------------------
  @Get('vendor-c/:sku')
  async vendorC(@Param('sku') sku: string) {
    await new Promise(res => setTimeout(res, 500)); // simulate delay

    return {
      cost: Math.floor(Math.random() * 400) + 100,      // numeric
      available: Math.random() > 0.2,                   // boolean
      quantity: Math.random() > 0.7 ? 0 : 7,            // numeric
    };
  }
}
