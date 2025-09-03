import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity('cash_flows')
export class CashFlow extends BaseEntity {
  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  openingBalance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalIncome: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalExpenses: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netCashFlow: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  closingBalance: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recorded_by_id' })
  recordedBy: User;

  @Column({ type: 'varchar', length: 255 })
  recordedById: string;
}
