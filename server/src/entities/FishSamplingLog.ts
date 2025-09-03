import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Pond } from './Pond';

@Entity('fish_sampling_logs')
export class FishSamplingLog extends BaseEntity {
  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'int' })
  sampleSize!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  averageWeight!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumWeight?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximumWeight?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  mortalityRate?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => Pond)
  @JoinColumn({ name: 'pondId' })
  pond!: Pond;

  @Column({ type: 'varchar', length: 255 })
  pondId!: string;
}
