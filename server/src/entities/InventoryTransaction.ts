import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { InventoryItem } from './InventoryItem';
import { User } from './User';
import { TransactionType } from '../../../shared/src/types';

@Entity('inventory_transactions')
export class InventoryTransaction extends BaseEntity {
  @Column({ type: 'enum', enum: TransactionType })
  type!: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCost?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reference?: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => InventoryItem, (item) => item.transactions)
  @JoinColumn({ name: 'itemId' })
  item!: InventoryItem;

  @Column({ type: 'varchar', length: 255 })
  itemId!: string;

  @ManyToOne(() => User, (user) => user.inventoryTransactions)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 255 })
  userId!: string;
}
