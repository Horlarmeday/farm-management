import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Animal } from './Animal';

@Entity('animal_production_logs')
export class AnimalProductionLog extends BaseEntity {
  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'varchar', length: 100 })
  productionType!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @Column({ type: 'varchar', length: 50 })
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
