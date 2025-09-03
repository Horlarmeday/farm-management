import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Pond } from './Pond';
import { User } from './User';

export enum HarvestType {
  PARTIAL = 'PARTIAL',
  FULL = 'FULL',
}

@Entity('fish_harvests')
export class FishHarvest extends BaseEntity {
  @Column({ type: 'date' })
  harvestDate: Date;

  @Column({ type: 'int' })
  quantityHarvested: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalWeight: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  averageWeight: number;

  @Column({
    type: 'enum',
    enum: HarvestType,
  })
  harvestType: HarvestType;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  mortalityCount?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedValue?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  gradeQuality?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  marketPrice?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalValue?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => Pond)
  @JoinColumn({ name: 'pond_id' })
  pond: Pond;

  @Column({ type: 'varchar', length: 255 })
  pondId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'harvested_by_id' })
  harvestedBy: User;

  @Column({ type: 'varchar', length: 255 })
  harvestedById: string;
}
