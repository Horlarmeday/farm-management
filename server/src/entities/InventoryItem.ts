import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { InventoryTransaction } from './InventoryTransaction';
import { InventoryCategory } from '@kuyash/shared';

@Entity('inventory_items')
export class InventoryItem extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  sku?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: InventoryCategory })
  category!: InventoryCategory;

  @Column({ type: 'varchar', length: 50 })
  unit!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentStock!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minimumStock!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximumStock?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCost?: number;

  @Column({ type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @OneToMany(() => InventoryTransaction, (transaction) => transaction.item)
  transactions!: InventoryTransaction[];
}
