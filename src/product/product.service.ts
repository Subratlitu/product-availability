import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { VendorService } from 'src/vendors/vendor.service';
import { CacheService } from 'src/cache/cache.service';
import { NormalizedVendorResponse } from '../vendors/types/normalized-vendor-response';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,

    private vendorService: VendorService,
    private cacheService: CacheService,
  ) { }

  /* ============================================================
     MERGE VENDOR RESPONSES (10% RULE + IN-STOCK PRIORITY)
  =============================================================== */
  private mergeVendorResponses(responses: any[]) {
    // Step 1: Only valid vendors
    const valid = responses.filter(
      r => r && typeof r.price === 'number' && r.availability
    );

    if (valid.length === 0) return null;

    // Step 2: Average price
    const avgPrice = valid.reduce((s, v) => s + v.price, 0) / valid.length;
    const minAllowed = avgPrice * 0.9;
    const maxAllowed = avgPrice * 1.1;

    // Step 3: Remove price anomalies
    const filtered = valid.filter(v => v.price >= minAllowed && v.price <= maxAllowed);
    const finalPool = filtered.length > 0 ? filtered : valid;

    // Step 4: Prefer in_stock vendors
    const inStock = finalPool.filter(v => v.availability === 'in_stock');
    const candidates = inStock.length ? inStock : finalPool;

    // Step 5: Lowest price wins
    candidates.sort((a, b) => a.price - b.price);
    const best = candidates[0];

    return {
      vendor: best.vendor,
      price: best.price,
      availability: best.availability,
      allVendorData: valid,
    };
  }

  /* ============================================================
     BASIC AGGREGATIONS
  =============================================================== */
  async aggregate(pipeline: any[]) {
    return this.productModel.aggregate(pipeline).exec();
  }

  /* ============================================================
     GET PRODUCT DETAILS (CACHE → DB → VENDORS)
  =============================================================== */
  async getProductDetails(sku: string) {
    // 1. Cache
    const cached = await this.cacheService.getProductCache(sku);
    if (cached) return { ...cached, cache: 'HIT' };

    // 2. Base product info
    const product = await this.productModel.aggregate([
      { $match: { sku } },
      {
        $project: {
          _id: 0,
          sku: 1,
          name: 1,
          category: 1,
          brand: 1,
          base_price: 1,
        },
      },
    ]);

    if (!product.length) throw new HttpException('Product not found', 404);

    const productData = product[0];

    // 3. Vendor offers
    const vendorOffers = await this.vendorService.getAllVendors(sku);
    if (!vendorOffers.length) {
      const out = {
        ...productData,
        vendor_offers: [],
        best_offer: 'OUT_OF_STOCK',
      };

      await this.cacheService.setProductCache(sku, out);
      return out;
    }

    // Step 9 selection logic applied
    const merged = this.mergeVendorResponses(vendorOffers);

    const finalResponse = {
      ...productData,
      vendor_offers: vendorOffers,
      best_offer: merged,
    };

    await this.cacheService.setProductCache(sku, finalResponse);
    return finalResponse;
  }

  /* ============================================================
     BULK INSERT (ASSIGNMENT USE CASE)
  =============================================================== */
  async bulkInsert(products: any[]) {
    await this.productModel.deleteMany({});

    const formatted = products.map(p => ({
      sku: p.sku,
      productId: p.productId,
      name: p.name,
      category: p.category,
      brand: p.brand,
      price: null,
      vendor: null,
      availability: 'Unknown',
      rawData: [],
      base_price: p.base_price,
    }));

    return this.productModel.insertMany(formatted);
  }

  /* ============================================================
     CREATE PRODUCT
  =============================================================== */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = new this.productModel(createProductDto);
    return product.save();
  }

/* ============================================================
   REFRESH SINGLE PRODUCT (FIXED FOR NULL PRICES & TYPE SAFETY)
   ============================================================ */
async refreshProduct(sku: string) {
  // Fetch latest live vendor data
  const vendors = await this.vendorService.getAllVendors(sku);

  if (!vendors.length) {
    throw new Error(`No vendor data found for ${sku}`);
  }

  // Filter only vendors that have a price
  const priced = vendors.filter(v => typeof v.price === "number");

  let best;

  // Case: all vendors returned null price
  if (priced.length === 0) {
    best = { price: null, vendor: null, availability: "Unavailable" };
  } else {
    // Pick lowest price
    best = priced.reduce((min, v) =>
      v.price! < min.price! ? v : min
    );
  }

  // Update DB
  await this.productModel.findOneAndUpdate(
    { sku },
    {
      $set: {
        price: best.price,
        vendor: best.vendor,
        availability: best.availability ?? "Unavailable",
        rawData: vendors,
        lastPriceRefreshedAt: new Date(),
      },
    },
    { new: true },
  );

  return {
    bestPrice: best.price,
    bestVendor: best.vendor,
    vendorResponses: vendors,
  };
}





/* ============================================================
   REFRESH ALL PRODUCTS (ADMIN USE) 
=============================================================== */
async refreshAllProducts() {
  const products = await this.productModel.find().exec();

  const results: {
    productId: string;
    name: string;
    updatedPrice: number | null;
    vendors: NormalizedVendorResponse[];
  }[] = [];

  for (const product of products) {
    const updated = await this.refreshProduct(product.sku);

    results.push({
      productId: product._id.toString(),
      name: product.name,
      updatedPrice: updated.bestPrice,
      vendors: updated.vendorResponses,
    });
  }

  return {
    total: results.length,
    results,
  };
}



  /* ============================================================
     BASIC CRUD
  =============================================================== */
  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }
  async findAllProducts() {
  return this.productModel.find().select('sku').lean();
}


  async findOne(id: string): Promise<Product | null> {
    return this.productModel.findById(id).exec();
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const updated = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();

    if (updated) {
      const sku = updated.sku;
      await this.cacheService.deleteProductCache(sku);
    }
    return updated;
  }
  async findOneBySku(sku: string) {
  return this.productModel.findOne({ sku }).exec();
}

  async remove(id: string) {
    const deleted = await this.productModel.findByIdAndDelete(id).exec();
    if (deleted) {
      await this.cacheService.deleteProductCache(deleted.sku);
    }
    return deleted;
  }

  /* ============================================================
     USED FOR CRON WARM-UP
  =============================================================== */
  async getAllSkus() {
    return this.productModel.find({}, { sku: 1, _id: 0 });
  }
}
