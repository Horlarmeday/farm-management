import { PurchaseOrderStatus } from '../../../shared/src/types';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { PurchaseOrderItem } from './PurchaseOrderItem';
import { Supplier } from './Supplier';

@Entity('purchase_orders')
export class PurchaseOrder extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  orderNumber!: string;

  @Column({ type: 'date' })
  orderDate!: Date;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate?: Date;

  @Column({ type: 'date', nullable: true })
  actualDeliveryDate?: Date;

  @Column({ type: 'enum', enum: PurchaseOrderStatus, default: PurchaseOrderStatus.DRAFT })
  status!: PurchaseOrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => Supplier, (supplier) => supplier.purchaseOrders)
  @JoinColumn({ name: 'supplierId' })
  supplier!: Supplier;

  @Column({ type: 'varchar', length: 255 })
  supplierId!: string;

  @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder)
  items!: PurchaseOrderItem[];
}
