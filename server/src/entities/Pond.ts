import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Location } from './Location';
import { PondType, PondStatus } from '@kuyash/shared';

@Entity('ponds')
export class Pond extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'enum', enum: PondType })
  type!: PondType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  size!: number;

  @Column({ type: 'varchar', length: 50, default: 'm2' })
  sizeUnit!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  depth?: number;

  @Column({ type: 'enum', enum: PondStatus, default: PondStatus.ACTIVE })
  status!: PondStatus;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'date', nullable: true })
  constructionDate?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => Location, (location) => location.ponds)
  @JoinColumn({ name: 'locationId' })
  location!: Location;

  @Column({ type: 'varchar', length: 255 })
  locationId!: string;
}
