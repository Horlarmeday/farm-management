import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { BirdBatch } from './BirdBatch';

@Entity('bird_feeding_logs')
export class BirdFeedingLog extends BaseEntity {
  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'varchar', length: 100 })
  feedType!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantityKg!: number;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPerKg?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost?: number;

  // Relationships
  @ManyToOne(() => BirdBatch)
  @JoinColumn({ name: 'birdBatchId' })
  birdBatch!: BirdBatch;

  @Column({ type: 'varchar', length: 255 })
  birdBatchId!: string;

  // Alias for service compatibility
  get batchId(): string {
    return this.birdBatchId;
  }

  set batchId(value: string) {
    this.birdBatchId = value;
  }

  // Additional relationship alias
  get batch(): BirdBatch {
    return this.birdBatch;
  }

  set batch(value: BirdBatch) {
    this.birdBatch = value;
  }
}
