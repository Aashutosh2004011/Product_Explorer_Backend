import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(navigationId?: string): Promise<Category[]> {
    this.logger.log(`Finding all categories, navigationId: ${navigationId}`);
    const where = navigationId ? { navigationId, parentId: null } : { parentId: null };
    const categories = await this.categoryRepository.find({
      where,
      relations: ['children'],
      order: { title: 'ASC' },
    });
    this.logger.log(`Found ${categories.length} categories`);
    return categories;
  }

  async findOne(id: string): Promise<Category> {
    this.logger.log(`Finding category by ID: ${id}`);
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children', 'parent', 'navigation'],
    });
    this.logger.log(`Category found: ${category ? category.title : 'NOT FOUND'}`);
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    this.logger.log(`Finding category by slug: ${slug}`);
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['children', 'parent', 'products'],
    });
    this.logger.log(`Category found: ${category ? category.title : 'NOT FOUND'}`);
    return category;
  }

  async findChildren(parentId: string): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parentId },
      order: { title: 'ASC' },
    });
  }
}
