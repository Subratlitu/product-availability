import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class VendorLog {
  @Prop()
  sku: string;

  @Prop()
  vendor: string;

  @Prop()
  success: boolean;

  @Prop()
  responseTime: number;

  @Prop()
  price: number;

  @Prop()
  availability: string;

  @Prop()
  errorMessage: string;
}

export type VendorLogDocument = VendorLog & Document;
export const VendorLogSchema = SchemaFactory.createForClass(VendorLog);
