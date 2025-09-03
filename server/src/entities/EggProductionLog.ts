import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { BirdBatch } from './BirdBatch';

@Entity('egg_production_logs')
export class EggProductionLog extends BaseEntity {
  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'int' })
  totalEggs!: number;

  @Column({ type: 'int', default: 0 })
  gradeA!: number;

  @Column({ type: 'int', default: 0 })
  gradeB!: number;

  @Column({ type: 'int', default: 0 })
  gradeC!: number;

  @Column({ type: 'int', default: 0 })
  cracked!: number;

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
