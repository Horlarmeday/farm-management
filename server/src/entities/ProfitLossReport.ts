import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { ProfitLossItem } from './ProfitLossItem';

@Entity('profit_loss_reports')
export class ProfitLossReport extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  reportName: string;

  @Column({ type: 'timestamp' })
  periodStart: Date;

  @Column({ type: 'timestamp' })
  periodEnd: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalIncome: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalExpenses: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netProfit: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  profitMargin: number;

  @OneToMany(() => ProfitLossItem, (item) => item.report)
  incomeItems: ProfitLossItem[];

  @OneToMany(() => ProfitLossItem, (item) => item.report)
  expenseItems: ProfitLossItem[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'generated_by_id' })
  generatedBy: User;

  @Column({ type: 'varchar', length: 255 })
  generatedById: string;
}
