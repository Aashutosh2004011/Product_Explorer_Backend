import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateViewHistoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty()
  @IsString()
  sessionId: string;

  @ApiProperty()
  @IsObject()
  pathJson: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  page?: string;
}
