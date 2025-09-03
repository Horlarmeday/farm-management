import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Pond } from './Pond';

@Entity('water_quality_logs')
export class WaterQualityLog extends BaseEntity {
  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  temperature?: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  ph?: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  dissolvedOxygen?: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  ammonia?: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  nitrite?: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  nitrate?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => Pond)
  @JoinColumn({ name: 'pondId' })
  pond!: Pond;

  @Column({ type: 'varchar', length: 255 })
  pondId!: string;
}
