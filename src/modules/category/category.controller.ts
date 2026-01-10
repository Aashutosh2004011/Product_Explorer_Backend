import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CategoryService } from './category.service';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({ name: 'navigationId', required: false, description: 'Filter by navigation ID' })
  @ApiResponse({ status: 200, description: 'Returns all categories' })
  async findAll(@Query('navigationId') navigationId?: string) {
    return this.categoryService.findAll(navigationId);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({ status: 200, description: 'Returns category' })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get child categories' })
  @ApiParam({ name: 'id', description: 'Parent category ID' })
  @ApiResponse({ status: 200, description: 'Returns child categories' })
  async findChildren(@Param('id') id: string) {
    return this.categoryService.findChildren(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Returns category' })
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }
}
