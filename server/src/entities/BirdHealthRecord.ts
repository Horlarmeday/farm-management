import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { BirdBatch } from './BirdBatch';

@Entity('bird_health_records')
export class BirdHealthRecord extends BaseEntity {
  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'varchar', length: 100 })
  type!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', nullable: true })
  treatment?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  veterinarian?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  medicationUsed?: string;

  @Column({ type: 'int', nullable: true })
  quantityUsed?: number;

  // Relationships
  @ManyToOne(() => BirdBatch)
  @JoinColumn({ name: 'birdBatchId' })
  birdBatch!: BirdBatch;

  @Column({ type: 'varchar', length: 255 })
  birdBatchId!: string;

  // Aliases for service compatibility
  get batchId(): string {
    return this.birdBatchId;
  }

  set batchId(value: string) {
    this.birdBatchId = value;
  }

  get batch(): BirdBatch {
    return this.birdBatch;
  }

  set batch(value: BirdBatch) {
    this.birdBatch = value;
  }
}
