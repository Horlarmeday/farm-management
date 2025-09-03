import { AuxiliaryProductType } from '@kuyash/shared/src/types/asset.types';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity('auxiliary_production')
export class AuxiliaryProduction extends BaseEntity {
  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'enum', enum: AuxiliaryProductType })
  productType!: AuxiliaryProductType;

  @Column({ type: 'varchar', length: 255 })
  productName!: string;

  @Column({ type: 'date' })
  productionDate!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantityProduced!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantityRemaining!: number;

  @Column({ type: 'varchar', length: 50 })
  unit!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  materialCost?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  laborCost?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  overheadCost?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCost?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  productionCost?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantitySold!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPrice?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  revenue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSales?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
