export class VendorAAdapter {
  static normalize(raw: any) {
    let stock = 0;

    if (raw.inventory === null && raw.status === "IN_STOCK") {
      stock = 5;
    } else if (raw.inventory > 0) {
      stock = raw.inventory;
    }

    return {
      vendor: "A",
      price: Number(raw.price) || null,
      stock,
      timestamp: new Date(raw.timestamp),
    };
  }
}
