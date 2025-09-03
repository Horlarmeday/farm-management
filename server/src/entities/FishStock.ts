import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Pond } from './Pond';
import { User } from './User';

@Entity('fish_stocks')
export class FishStock extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  species: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  variety?: string;

  @Column({ type: 'int' })
  initialQuantity: number;

  @Column({ type: 'int' })
  currentQuantity: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  averageWeight?: number;

  @Column({ type: 'date' })
  stockingDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPerUnit?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalCost?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => Pond)
  @JoinColumn({ name: 'pond_id' })
  pond: Pond;

  @Column({ type: 'varchar', length: 255 })
  pondId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'stocked_by_id' })
  stockedBy: User;

  @Column({ type: 'varchar', length: 255 })
  stockedById: string;
}
