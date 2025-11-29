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

  @Prop({ required: true })
  vendor: string;

  @Prop({ type: Number, required: false })
  price?: number;

  @Prop({ required: true })
  availability: string;

  @Prop({ type: Object })
  rawData?: any;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
