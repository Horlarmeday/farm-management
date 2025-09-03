import { MaintenanceStatus, MaintenanceType } from '@kuyash/shared';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Asset } from './Asset';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity('maintenance_records')
export class MaintenanceRecord extends BaseEntity {
  @Column({
    type: 'enum',
    enum: MaintenanceType,
  })
  maintenanceType: MaintenanceType;

  @Column({ type: 'date' })
  scheduledDate: Date;

  @Column({ type: 'date', nullable: true })
  completedDate?: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualCost?: number;

  @Column({ type: 'int', nullable: true })
  estimatedDuration?: number;

  @Column({ type: 'int', nullable: true })
  actualDuration?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  priority?: string;

  @Column({
    type: 'enum',
    enum: MaintenanceStatus,
    default: MaintenanceStatus.SCHEDULED,
  })
  status: MaintenanceStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  partsReplaced?: string;

  @Column({ type: 'text', nullable: true })
  partsUsed?: string;

  @Column({ type: 'text', nullable: true })
  technicianNotes?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  serviceProvider?: string;

  @Column({ type: 'date', nullable: true })
  warrantyUntil?: Date;

  @Column({ type: 'date', nullable: true })
  nextMaintenanceDate?: Date;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ type: 'varchar', length: 255 })
  assetId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @Column({ type: 'varchar', length: 255 })
  assignedToId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'completed_by_id' })
  completedBy?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  completedById?: string;
}
