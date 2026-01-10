import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { ProductDetail } from '../../entities/product-detail.entity';
import { Review } from '../../entities/review.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductDetail)
    private productDetailRepository: Repository<ProductDetail>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async findAll(
    categoryId?: string,
    search?: string,
    limit = 20,
    page = 1,
  ): Promise<{ products: Product[]; total: number; page: number; limit: number }> {
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.title = Like(`%${search}%`);
    }

    const [products, total] = await this.productRepository.findAndCount({
      where,
      relations: ['category'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      products,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Product> {
    return this.productRepository.findOne({
      where: { id },
      relations: ['category', 'detail', 'reviews'],
    });
  }

  async findBySourceId(sourceId: string): Promise<Product> {
    return this.productRepository.findOne({
      where: { sourceId },
      relations: ['category', 'detail', 'reviews'],
    });
  }

  async getDetail(productId: string): Promise<ProductDetail> {
    return this.productDetailRepository.findOne({
      where: { productId },
      relations: ['product'],
    });
  }

  async getReviews(productId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
  }
}
