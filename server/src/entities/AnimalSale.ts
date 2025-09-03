import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Animal } from './Animal';

@Entity('animal_sales')
export class AnimalSale extends BaseEntity {
  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salePrice!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  buyerName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  buyerContact?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => Animal)
  @JoinColumn({ name: 'animalId' })
  animal!: Animal;

  @Column({ type: 'varchar', length: 255 })
  animalId!: string;
}
