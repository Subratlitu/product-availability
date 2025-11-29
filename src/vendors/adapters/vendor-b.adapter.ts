export class VendorBAdapter {
  static normalize(raw: any) {
    return {
      vendor: "B",
      price: Number(raw.amount) || null,
      stock: raw.in_stock ? 5 : 0,
      timestamp: new Date(raw.updated_at),
    };
  }
}
