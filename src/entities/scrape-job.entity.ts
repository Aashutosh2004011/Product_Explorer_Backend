import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ScrapeJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ScrapeTargetType {
  NAVIGATION = 'navigation',
  CATEGORY = 'category',
  PRODUCT_LIST = 'product_list',
  PRODUCT_DETAIL = 'product_detail',
}

@Entity('scrape_job')
export class ScrapeJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  targetUrl: string;

  @Column({
    type: 'enum',
    enum: ScrapeTargetType,
  })
  @Index()
  targetType: ScrapeTargetType;

  @Column({
    type: 'enum',
    enum: ScrapeJobStatus,
    default: ScrapeJobStatus.PENDING,
  })
  @Index()
  status: ScrapeJobStatus;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date;

  @Column({ type: 'text', nullable: true })
  errorLog: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}