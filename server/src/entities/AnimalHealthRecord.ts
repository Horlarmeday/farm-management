import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Animal } from './Animal';

@Entity('animal_health_records')
export class AnimalHealthRecord extends BaseEntity {
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

  // Relationships
  @ManyToOne(() => Animal)
  @JoinColumn({ name: 'animalId' })
  animal!: Animal;

  @Column({ type: 'varchar', length: 255 })
  animalId!: string;
}
