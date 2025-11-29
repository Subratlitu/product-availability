import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { VendorService } from 'src/vendors/vendor.service';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,

    private vendorService: VendorService,
    private cacheService: CacheService,
  ) {}

  async aggregate(pipeline: any[]) {
    return this.productModel.aggregate(pipeline).exec();
  }

  async getProductDetails(sku: string) {
    // 1. Check Cache
    const cached = await this.cacheService.getProductCache(sku);
    if (cached) {
      return { ...cached, cache: 'HIT' };
    }

    // 2. Fetch base product
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

    if (!product.length) {
      throw new HttpException('Product not found', 404);
    }

    const productData = product[0];

    // 3. Fetch vendor offers
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

    // FIX: price can be null → treat null as Infinity (highest price)
    const bestOffer = vendorOffers.reduce((best, current) => {
      const bestPrice = best.price ?? Infinity;
      const currPrice = current.price ?? Infinity;
      return currPrice < bestPrice ? current : best;
    });

    const finalResponse = {
      ...productData,
      vendor_offers: vendorOffers,
      best_offer: bestOffer,
    };

    await this.cacheService.setProductCache(sku, finalResponse);

    return finalResponse;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = new this.productModel(createProductDto);
    return product.save();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<Product | null> {
    return this.productModel.findById(id).exec();
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const updated = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();

    if (updated) {
      const sku = (updated as ProductDocument).sku;
      if (sku) await this.cacheService.deleteProductCache(sku);
    }

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.productModel.findByIdAndDelete(id).exec();

    if (deleted) {
      const sku = (deleted as ProductDocument).sku;
      if (sku) await this.cacheService.deleteProductCache(sku);
    }

    return deleted;
  }
}
