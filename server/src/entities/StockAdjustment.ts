import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Farm } from './Farm';
import { InventoryItem } from './InventoryItem';
import { InventoryTransaction } from './InventoryTransaction';
import { User } from './User';

export enum AdjustmentType {
  PHYSICAL_COUNT = 'physical_count',
  DAMAGED = 'damaged',
  LOST = 'lost',
  EXPIRED = 'expired',
  THEFT = 'theft',
  OTHER = 'other',
}

export enum AdjustmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('stock_adjustments')
export class StockAdjustment extends BaseEntity {
  @Column({ type: 'enum', enum: AdjustmentType })
  adjustmentType!: AdjustmentType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  oldQuantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  newQuantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantityDifference!: number;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'enum', enum: AdjustmentStatus, default: AdjustmentStatus.PENDING })
  status!: AdjustmentStatus;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedValue?: number;

  // Relationships
  @ManyToOne(() => InventoryItem, { nullable: false })
  @JoinColumn({ name: 'itemId' })
  item!: InventoryItem;

  @Column({ type: 'varchar', length: 255 })
  itemId!: string;

  @ManyToOne(() => Farm, { nullable: false })
  @JoinColumn({ name: 'farmId' })
  farm!: Farm;

  @Column({ type: 'varchar', length: 255 })
  farmId!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  @Column({ type: 'varchar', length: 255 })
  createdById!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  approvedById?: string;

  @ManyToOne(() => InventoryTransaction, { nullable: true })
  @JoinColumn({ name: 'transactionId' })
  transaction?: InventoryTransaction;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionId?: string;
}
