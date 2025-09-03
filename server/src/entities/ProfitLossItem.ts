import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { ProfitLossReport } from './ProfitLossReport';
import { FinanceTransactionType } from '@kuyash/shared';

@Entity('profit_loss_items')
export class ProfitLossItem extends BaseEntity {
  @Column({
    type: 'enum',
    enum: FinanceTransactionType,
  })
  type: FinanceTransactionType;

  @Column({ type: 'varchar', length: 255 })
  category: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage: number;

  @ManyToOne(() => ProfitLossReport, (report) => report.incomeItems)
  @JoinColumn({ name: 'report_id' })
  report: ProfitLossReport;

  @Column({ type: 'varchar', length: 255 })
  reportId: string;
}
