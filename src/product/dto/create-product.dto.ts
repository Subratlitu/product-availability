import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsString()
  productId: string;

  @IsString()
  name: string;

  @IsString()
  vendor: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsString()
  availability: string;

  @IsOptional()
  rawData?: any;
}
