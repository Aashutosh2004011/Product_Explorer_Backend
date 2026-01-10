import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { NavigationService } from './navigation.service';

@ApiTags('navigation')
@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all navigation items' })
  @ApiResponse({ status: 200, description: 'Returns all navigation items' })
  async findAll() {
    return this.navigationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get navigation by ID' })
  @ApiParam({ name: 'id', description: 'Navigation ID' })
  @ApiResponse({ status: 200, description: 'Returns navigation item' })
  async findOne(@Param('id') id: string) {
    return this.navigationService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get navigation by slug' })
  @ApiParam({ name: 'slug', description: 'Navigation slug' })
  @ApiResponse({ status: 200, description: 'Returns navigation item' })
  async findBySlug(@Param('slug') slug: string) {
    return this.navigationService.findBySlug(slug);
  }
}
