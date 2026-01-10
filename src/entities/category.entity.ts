import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Navigation } from './navigation.entity';
import { Product } from './product.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  navigationId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  parentId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  url: string;

  @Column({ type: 'int', default: 0 })
  productCount: number;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  lastScrapedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Navigation, navigation => navigation.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'navigationId' })
  navigation: Navigation;

  @ManyToOne(() => Category, category => category.children, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: Category;

  @OneToMany(() => Category, category => category.parent)
  children: Category[];

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}