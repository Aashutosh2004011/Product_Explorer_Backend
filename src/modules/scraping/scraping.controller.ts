import { Controller, Post, Param, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ScrapingService } from './scraping.service';

@ApiTags('scraping')
@Controller('scraping')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Post('navigation')
  @ApiOperation({ summary: 'Trigger navigation scrape' })
  @ApiResponse({ status: 201, description: 'Scrape initiated successfully' })
  async scrapeNavigation() {
    return this.scrapingService.scrapeNavigation();
  }

  @Post('categories/:navigationId')
  @ApiOperation({ summary: 'Trigger category scrape for a navigation item' })
  @ApiParam({ name: 'navigationId', description: 'Navigation ID' })
  @ApiResponse({ status: 201, description: 'Scrape initiated successfully' })
  async scrapeCategories(@Param('navigationId') navigationId: string) {
    return this.scrapingService.scrapeCategories(navigationId);
  }

  @Post('products/:categoryId')
  @ApiOperation({ summary: 'Trigger product scrape for a category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiResponse({ status: 201, description: 'Scrape initiated successfully' })
  async scrapeProducts(
    @Param('categoryId') categoryId: string,
    @Query('limit') limit = 20,
    @Query('page') page = 1,
  ) {
    return this.scrapingService.scrapeProducts(categoryId, limit, page);
  }

  @Post('product-detail/:productId')
  @ApiOperation({ summary: 'Trigger product detail scrape' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 201, description: 'Scrape initiated successfully' })
  async scrapeProductDetail(@Param('productId') productId: string) {
    return this.scrapingService.scrapeProductDetail(productId);
  }
}
