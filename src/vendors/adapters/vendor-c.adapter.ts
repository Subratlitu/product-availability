export class VendorCAdapter {
  static normalize(raw: any) {
    return {
      vendor: "VendorC",
      price: Number(raw.cost) || null,
      stock: Number(raw.quantity) ?? 0,
      availability: raw.available ? "IN_STOCK" : "OUT_OF_STOCK",
      timestamp: new Date(), // mock has no timestamp
    };
  }
}
