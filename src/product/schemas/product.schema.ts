import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
    @Prop({ required: true, unique: true })
    sku: string;

    @Prop({ required: true })
    productId: string;

    @Prop({ required: true })
    name: string;

    @Prop({ type: String, required: false })
    vendor: string | null;


    @Prop({ type: Number, required: false })
    price: number | null;  


    @Prop({ required: true })
    availability: string;

    @Prop({ type: Object })
    rawData?: any;

    @Prop({ type: Date, default: null })
    lastPriceRefreshedAt: Date | null;

}

export const ProductSchema = SchemaFactory.createForClass(Product);
