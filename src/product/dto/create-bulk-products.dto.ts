import { IsArray, ValidateNested, IsString, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class BulkSingleProductDto {
  @IsString()
  sku: string;

  @IsString()
  productId: string;

  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  brand: string;

  @IsNumber()
  base_price: number;
}

export class CreateBulkProductsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkSingleProductDto)
  products: BulkSingleProductDto[];
}
