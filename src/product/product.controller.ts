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
import { QueueService } from './../queues/queue.service';
import { CreateBulkProductsDto } from './dto/create-bulk-products.dto';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly queueService: QueueService
  ) { }

  // ----------------------------
  // REFRESH USING QUEUE WORKER
  // ----------------------------
  @Get(':sku/refresh')
  async refreshNow(@Param('sku') sku: string) {
    await this.queueService.addRefreshJob(sku);
    return { message: `Refresh job queued for ${sku}` };
  }

  // ----------------------------
  // DIRECT REFRESH (no queue) 
  // ----------------------------
  @Post('refresh/:sku')
  async refreshDirect(@Param('sku') sku: string) {
    const product = await this.productService.findOneBySku(sku);
    
    if (!product) return { message: 'Product not found' };
    console.log(product,"????????")
    const result = await this.productService.refreshProduct(sku);
    return {
      message: `Product ${sku} refreshed`,
      result
    };
  }



  // ----------------------------
  // REFRESH ALL PRODUCTS (Loop)
  // ----------------------------
  @Post('refresh-all')
  async refreshAllProducts() {
    return this.productService.refreshAllProducts();
  }

  // ----------------------------
  // PRODUCT CRUD
  // ----------------------------
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

   @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Get('sku/:sku')
  async getBySku(@Param('sku') sku: string) {
    return this.productService.getProductDetails(sku);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }

  // ----------------------------
  // BULK INSERT
  // ----------------------------
  @Post('bulk')
  bulkInsert(@Body() body: CreateBulkProductsDto) {
    return this.productService.bulkInsert(body.products);
  }

  // ----------------------------
  // SUPPORT ROUTES
  // ----------------------------
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

  // GET ALL SKUs — useful for cron
  @Get('meta/skus')
  async getAllSkus() {
    return this.productService.getAllSkus();
  }
}
