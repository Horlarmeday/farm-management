import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Budget } from './Budget';
import { ExpenseCategory } from '@kuyash/shared';

@Entity('budget_items')
export class BudgetItem extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  category: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  budgetedAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  actualAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  remainingAmount: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => Budget, (budget) => budget.budgetItems)
  @JoinColumn({ name: 'budget_id' })
  budget: Budget;

  @Column({ type: 'varchar', length: 255 })
  budgetId: string;
}
