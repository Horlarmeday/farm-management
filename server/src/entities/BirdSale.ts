import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { BirdBatch } from './BirdBatch';

@Entity('bird_sales')
export class BirdSale extends BaseEntity {
  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  buyerName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  buyerContact?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

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
