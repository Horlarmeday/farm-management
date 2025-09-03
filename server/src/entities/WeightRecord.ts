import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Animal } from './Animal';

@Entity('weight_records')
export class WeightRecord extends BaseEntity {
  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weight!: number;

  @Column({ type: 'varchar', length: 50, default: 'kg' })
  unit!: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => Animal)
  @JoinColumn({ name: 'animalId' })
  animal!: Animal;

  @Column({ type: 'varchar', length: 255 })
  animalId!: string;
}
