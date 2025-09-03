import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Pond } from './Pond';
import { User } from './User';

@Entity('fish_sales')
export class FishSale extends BaseEntity {
  @Column({ type: 'date' })
  saleDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalWeight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerKg: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'varchar', length: 255 })
  buyerName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  buyerContact?: string;

  @Column({ type: 'text', nullable: true })
  buyerAddress?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentReference?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => Pond)
  @JoinColumn({ name: 'pond_id' })
  pond: Pond;

  @Column({ type: 'varchar', length: 255 })
  pondId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sold_by_id' })
  soldBy: User;

  @Column({ type: 'varchar', length: 255 })
  soldById: string;
}
