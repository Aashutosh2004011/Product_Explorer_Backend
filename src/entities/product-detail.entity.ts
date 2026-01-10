import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_detail')
export class ProductDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  productId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  specs: Record<string, any>;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  ratingsAvg: number;

  @Column({ type: 'int', default: 0 })
  reviewsCount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  publisher: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  isbn: string;

  @Column({ type: 'date', nullable: true })
  publicationDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  recommendations: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Product, product => product.detail, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;
}