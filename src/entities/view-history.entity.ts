import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('view_history')
export class ViewHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  sessionId: string;

  @Column({ type: 'jsonb' })
  pathJson: Record<string, any>;

  @Column({ type: 'varchar', length: 500, nullable: true })
  page: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}