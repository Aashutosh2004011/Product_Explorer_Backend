import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ViewHistoryService } from './view-history.service';
import { CreateViewHistoryDto } from './dto/create-view-history.dto';

@ApiTags('view-history')
@Controller('view-history')
export class ViewHistoryController {
  constructor(private readonly viewHistoryService: ViewHistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create view history entry' })
  @ApiResponse({ status: 201, description: 'View history created' })
  async create(@Body() dto: CreateViewHistoryDto) {
    return this.viewHistoryService.create(dto);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get view history by session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns view history' })
  async findBySession(
    @Param('sessionId') sessionId: string,
    @Query('limit') limit = 50,
  ) {
    return this.viewHistoryService.findBySession(sessionId, Number(limit));
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get view history by user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns view history' })
  async findByUser(@Param('userId') userId: string, @Query('limit') limit = 50) {
    return this.viewHistoryService.findByUser(userId, Number(limit));
  }
}
