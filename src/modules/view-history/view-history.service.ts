import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViewHistory } from '../../entities/view-history.entity';
import { CreateViewHistoryDto } from './dto/create-view-history.dto';

@Injectable()
export class ViewHistoryService {
  constructor(
    @InjectRepository(ViewHistory)
    private viewHistoryRepository: Repository<ViewHistory>,
  ) {}

  async create(dto: CreateViewHistoryDto): Promise<ViewHistory> {
    const viewHistory = this.viewHistoryRepository.create(dto);
    return this.viewHistoryRepository.save(viewHistory);
  }

  async findBySession(sessionId: string, limit = 50): Promise<ViewHistory[]> {
    return this.viewHistoryRepository.find({
      where: { sessionId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByUser(userId: string, limit = 50): Promise<ViewHistory[]> {
    return this.viewHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
