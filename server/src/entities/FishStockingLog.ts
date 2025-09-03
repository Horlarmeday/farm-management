import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Pond } from './Pond';

@Entity('fish_stocking_logs')
export class FishStockingLog extends BaseEntity {
  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'varchar', length: 100 })
  species!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageWeight?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => Pond)
  @JoinColumn({ name: 'pondId' })
  pond!: Pond;

  @Column({ type: 'varchar', length: 255 })
  pondId!: string;
}
