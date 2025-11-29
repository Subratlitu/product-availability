import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
    AvailableProductsPipeline
} from './pipelines/available-products.pipeline';
import {
    AvailabilityCountPipeline
} from './pipelines/availability-count.pipeline';
import {
    SortByPricePipeline
} from './pipelines/sort-by-price.pipeline';
import {
    GroupByProductPipeline
} from './pipelines/group-by-product.pipeline';
import {
    NormalizedProductsPipeline
} from './pipelines/normalized-products.pipeline';


@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get('aggregate/available')
  getAvailable() {
    return this.productService.aggregate(AvailableProductsPipeline);
  }

  @Get('aggregate/availability-count')
  getAvailabilityCount() {
    return this.productService.aggregate(AvailabilityCountPipeline);
  }

  @Get('aggregate/sort-by-price')
  sortByPrice() {
    return this.productService.aggregate(SortByPricePipeline);
  }

  @Get('aggregate/group-by-product')
  groupByProduct() {
    return this.productService.aggregate(GroupByProductPipeline);
  }

  @Get('aggregate/normalized')
  getNormalized() {
    return this.productService.aggregate(NormalizedProductsPipeline);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}


// @Controller('products')
// export class ProductController {
//     constructor(private readonly productService: ProductService) { }

//     @Post()
//     create(@Body() createProductDto: CreateProductDto) {
//         return this.productService.create(createProductDto);
//     }
//      @Get('aggregate/available')
//     getAvailable() {
//         console.log(">>>>>>>>>>>")
//         return this.productService.aggregate(AvailableProductsPipeline);
//     }

//     @Get('aggregate/availability-count')
//     getAvailabilityCount() {
//         return this.productService.aggregate(AvailabilityCountPipeline);
//     }

//     @Get('aggregate/sort-by-price')
//     sortByPrice() {
//         return this.productService.aggregate(SortByPricePipeline);
//     }

//     @Get('aggregate/group-by-product')
//     groupByProduct() {
//         return this.productService.aggregate(GroupByProductPipeline);
//     }

//     @Get('aggregate/normalized')
//     getNormalized() {
//         return this.productService.aggregate(NormalizedProductsPipeline);
//     }

//     @Get()
//     findAll() {
//         return this.productService.findAll();
//     }

//     @Get(':id')
//     findOne(@Param('id') id: string) {
//         return this.productService.findOne(id);
//     }

//     @Patch(':id')
//     update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
//         return this.productService.update(id, updateProductDto);
//     }

//     @Delete(':id')
//     remove(@Param('id') id: string) {
//         return this.productService.remove(id);
//     }
    

// }
