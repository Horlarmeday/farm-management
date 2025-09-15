import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Farm } from './Farm';
import { User } from './User';
import { Location } from './Location';
import { BirdType, BirdStatus } from '../../../shared/src/types';

@Entity('bird_batches')
export class BirdBatch extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  batchCode!: string;

  @Column({ type: 'enum', enum: BirdType })
  birdType!: BirdType;

  @Column({ type: 'varchar', length: 100 })
  breed!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'int' })
  currentQuantity!: number;

  @Column({ type: 'int', nullable: true })
  remainingQuantity?: number;

  @Column({ type: 'date' })
  arrivalDate!: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source?: string;

  @Column({ type: 'int', nullable: true })
  ageInDays?: number;

  @Column({ type: 'enum', enum: BirdStatus, default: BirdStatus.ACTIVE })
  status!: BirdStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCost?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost?: number;

  // Production tracking
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
  totalFeedConsumed?: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  totalEggsProduced?: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  totalMortality?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
  totalSales?: number;

  @Column({ type: 'decimal', precision: 5, scale: 3, nullable: true })
  feedConversionRatio?: number;

  // Date tracking
  @Column({ type: 'timestamp', nullable: true })
  lastFeedingDate?: Date;

  @Column({ type: 'date', nullable: true })
  lastEggProductionDate?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => Location, (location) => location.birdBatches)
  @JoinColumn({ name: 'locationId' })
  location!: Location;

  @Column({ type: 'varchar', length: 255 })
  locationId!: string;

  @ManyToOne(() => User, (user) => user.assignedBirdBatches, { nullable: true })
  @JoinColumn({ name: 'assignedUserId' })
  assignedUser?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  assignedUserId?: string;

  @ManyToOne(() => Farm, { nullable: false })
  @JoinColumn({ name: 'farmId' })
  farm!: Farm;

  @Column({ type: 'varchar', length: 255 })
  farmId!: string;
}
