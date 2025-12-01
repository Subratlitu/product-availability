export class VendorAAdapter {
  static normalize(raw: any) {
    return {
      vendor: "VendorA",
      price: Number(raw.price) || null,
      stock: Number(raw.stock) ?? 0,
      availability: raw.availability ?? "UNKNOWN",
      timestamp: new Date(), // vendor mock has no timestamp → set now
    };
  }
}
