import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { VendorService } from 'src/vendors/vendor.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,

    private vendorService: VendorService, // Inject VendorService
  ) {}

  async aggregate(pipeline: any[]) {
    return this.productModel.aggregate(pipeline).exec();
  }

  async getProductDetails(sku: string) {
    // 1. Fetch base product details from MongoDB
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

    // 2. Fetch vendor data (3 vendor calls)
    const vendorOffers = await this.vendorService.getAllVendors(sku);

    // If no vendor returned valid data
    if (!vendorOffers.length) {
      return {
        ...productData,
        vendor_offers: [],
        best_offer: 'OUT_OF_STOCK',
      };
    }

    //  3. Filter out invalid vendors with null price
    const validVendors = vendorOffers.filter((v) => v.price !== null);

    if (!validVendors.length) {
      return {
        ...productData,
        vendor_offers: vendorOffers,
        best_offer: 'OUT_OF_STOCK',
      };
    }

    // 🔥 4. Best vendor selection (safe comparison)
    const bestOffer = validVendors.reduce((best, current) =>
      (current.price as number) < (best.price as number) ? current : best
    );

    // 5. Final combined response
    return {
      ...productData,
      vendor_offers: vendorOffers,
      best_offer: bestOffer,
    };
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

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product | null> {
    return this.productModel.findByIdAndUpdate(id, updateProductDto, {
      new: true,
    }).exec();
  }

  async remove(id: string): Promise<Product | null> {
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
