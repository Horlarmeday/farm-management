import { AssetStatus, AssetType } from '@kuyash/shared';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Location } from './Location';
import { MaintenanceLog } from './MaintenanceLog';
import { User } from './User';

@Entity('assets')
export class Asset extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  assetCode!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'enum', enum: AssetType })
  type!: AssetType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serialNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer?: string;

  @Column({ type: 'date', nullable: true })
  purchaseDate?: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  purchasePrice?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  currentValue?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  bookValue?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  accumulatedDepreciation?: number;

  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.ACTIVE })
  status!: AssetStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  condition?: string;

  @Column({ type: 'int', nullable: true })
  usefulLife?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  depreciationMethod?: string;

  @Column({ type: 'date', nullable: true })
  warrantyExpiry?: Date;

  @Column({ type: 'date', nullable: true })
  disposalDate?: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  disposalValue?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalMaintenanceCost?: number;

  @Column({ type: 'date', nullable: true })
  lastMaintenanceDate?: Date;

  @Column({ type: 'date', nullable: true })
  nextMaintenanceDate?: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => Location, (location) => location.assets)
  @JoinColumn({ name: 'locationId' })
  location!: Location;

  @Column({ type: 'varchar', length: 255 })
  locationId!: string;

  @ManyToOne(() => User, (user) => user.assignedAssets, { nullable: true })
  @JoinColumn({ name: 'assignedUserId' })
  assignedUser?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  assignedUserId?: string;

  @OneToMany(() => MaintenanceLog, (log) => log.asset)
  maintenanceLogs!: MaintenanceLog[];
}
