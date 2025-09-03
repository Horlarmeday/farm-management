import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Animal } from './Animal';
import { ProductionType } from '@kuyash/shared';

@Entity('production_logs')
export class ProductionLog extends BaseEntity {
  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: ProductionType,
  })
  productionType: ProductionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'varchar', length: 50 })
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quality?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => Animal)
  @JoinColumn({ name: 'animal_id' })
  animal: Animal;

  @Column({ type: 'varchar', length: 255 })
  animalId: string;
}
