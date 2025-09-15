import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Asset } from './Asset';
import { MaintenanceType } from '../../../shared/src/types';

@Entity('maintenance_logs')
export class MaintenanceLog extends BaseEntity {
  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'enum', enum: MaintenanceType })
  type!: MaintenanceType;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  performedBy?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'date', nullable: true })
  nextMaintenanceDate?: Date;

  // Relationships
  @ManyToOne(() => Asset, (asset) => asset.maintenanceLogs)
  @JoinColumn({ name: 'assetId' })
  asset!: Asset;

  @Column({ type: 'varchar', length: 255 })
  assetId!: string;
}
