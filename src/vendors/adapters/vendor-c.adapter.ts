export class VendorCAdapter {
  static normalize(raw: any) {
    return {
      vendor: "C",
      price: Number(raw.cost) || null,
      stock: raw.stock ?? 0,
      timestamp: new Date(raw.ts),
    };
  }
}
