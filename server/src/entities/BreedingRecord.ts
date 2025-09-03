import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Animal } from './Animal';

@Entity('breeding_records')
export class BreedingRecord extends BaseEntity {
  @Column({ type: 'date' })
  matingDate!: Date;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate?: Date;

  @Column({ type: 'date', nullable: true })
  actualDeliveryDate?: Date;

  @Column({ type: 'varchar', length: 100 })
  breedingMethod!: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => Animal)
  @JoinColumn({ name: 'femaleId' })
  female!: Animal;

  @Column({ type: 'varchar', length: 255 })
  femaleId!: string;

  @ManyToOne(() => Animal)
  @JoinColumn({ name: 'maleId' })
  male!: Animal;

  @Column({ type: 'varchar', length: 255 })
  maleId!: string;
}
