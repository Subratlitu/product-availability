import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name)
        private productModel: Model<ProductDocument>,
    ) { }

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
