import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Pond } from './Pond';

@Entity('fish_harvest_logs')
export class FishHarvestLog extends BaseEntity {
  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'int' })
  quantityHarvested!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalWeight!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  averageWeight!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  marketPrice?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  revenue?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => Pond)
  @JoinColumn({ name: 'pondId' })
  pond!: Pond;

  @Column({ type: 'varchar', length: 255 })
  pondId!: string;
}
