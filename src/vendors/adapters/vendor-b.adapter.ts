export class VendorBAdapter {
  static normalize(raw: any) {
    return {
      vendor: "VendorB",
      price: Number(raw.amount) || null,
      stock: Number(raw.stock) ?? (raw.inStock ? 5 : 0),
      availability: raw.inStock ? "IN_STOCK" : "OUT_OF_STOCK",
      timestamp: new Date(), // mock has no timestamp
    };
  }
}
