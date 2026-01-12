import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get API welcome message' })
  @ApiResponse({
    status: 200,
    description: 'Returns welcome message',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Hello Aashutosh here! 👋' },
        version: { type: 'string', example: '1.0.0' },
        docs: { type: 'string', example: '/api' },
        endpoints: {
          type: 'object',
          properties: {
            navigation: { type: 'string', example: '/navigation' },
            categories: { type: 'string', example: '/categories' },
            products: { type: 'string', example: '/products' },
            scraping: { type: 'string', example: '/scraping' },
          }
        }
      }
    }
  })
  getRoot() {
    return this.appService.getWelcomeMessage();
  }
}
