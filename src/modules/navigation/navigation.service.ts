import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Navigation } from '../../entities/navigation.entity';

@Injectable()
export class NavigationService {
  constructor(
    @InjectRepository(Navigation)
    private navigationRepository: Repository<Navigation>,
  ) {}

  async findAll(): Promise<Navigation[]> {
    return this.navigationRepository.find({
      order: { title: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Navigation> {
    return this.navigationRepository.findOne({
      where: { id },
      relations: ['categories'],
    });
  }

  async findBySlug(slug: string): Promise<Navigation> {
    return this.navigationRepository.findOne({
      where: { slug },
      relations: ['categories'],
    });
  }
}
