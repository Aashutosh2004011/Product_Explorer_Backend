import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'search', required: false, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiResponse({ status: 200, description: 'Returns paginated products' })
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('limit') limit = 20,
    @Query('page') page = 1,
  ) {
    return this.productService.findAll(categoryId, search, Number(limit), Number(page));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Returns product' })
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Get('source/:sourceId')
  @ApiOperation({ summary: 'Get product by source ID' })
  @ApiParam({ name: 'sourceId', description: 'Product source ID' })
  @ApiResponse({ status: 200, description: 'Returns product' })
  async findBySourceId(@Param('sourceId') sourceId: string) {
    return this.productService.findBySourceId(sourceId);
  }

  @Get(':id/detail')
  @ApiOperation({ summary: 'Get product detail' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Returns product detail' })
  async getDetail(@Param('id') id: string) {
    return this.productService.getDetail(id);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get product reviews' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Returns product reviews' })
  async getReviews(@Param('id') id: string) {
    return this.productService.getReviews(id);
  }
}
