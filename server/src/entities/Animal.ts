import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Location } from './Location';
import { Farm } from './Farm';
import { AnimalStatus, AnimalType } from '../../../shared/src/types';

@Entity('animals')
export class Animal extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  tagNumber!: string;

  @Column({ type: 'enum', enum: AnimalType })
  species!: AnimalType;

  @Column({ type: 'varchar', length: 100 })
  breed!: string;

  @Column({ type: 'varchar', length: 10 })
  gender!: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'date' })
  acquisitionDate!: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source?: string;

  @Column({ type: 'enum', enum: AnimalStatus, default: AnimalStatus.ACTIVE })
  status!: AnimalStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  acquisitionCost?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => Location, (location) => location.animals)
  @JoinColumn({ name: 'locationId' })
  location!: Location;

  @Column({ type: 'varchar', length: 255 })
  locationId!: string;

  @ManyToOne(() => User, (user) => user.assignedAnimals, { nullable: true })
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
