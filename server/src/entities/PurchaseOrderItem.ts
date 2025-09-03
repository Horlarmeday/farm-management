import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { PurchaseOrder } from './PurchaseOrder';
import { InventoryItem } from './InventoryItem';

@Entity('purchase_order_items')
export class PurchaseOrderItem extends BaseEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  receivedQuantity!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.items)
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder!: PurchaseOrder;

  @Column({ type: 'varchar', length: 255 })
  purchaseOrderId!: string;

  @ManyToOne(() => InventoryItem)
  @JoinColumn({ name: 'itemId' })
  item!: InventoryItem;

  @Column({ type: 'varchar', length: 255 })
  itemId!: string;
}
