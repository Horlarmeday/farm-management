import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { BudgetItem } from './BudgetItem';

export enum BudgetPeriod {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum BudgetStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('budgets')
export class Budget extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  budgetName: string;

  @Column({
    type: 'enum',
    enum: BudgetPeriod,
  })
  budgetPeriod: BudgetPeriod;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalBudget: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  actualSpent: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  remainingBudget: number;

  @Column({
    type: 'enum',
    enum: BudgetStatus,
    default: BudgetStatus.DRAFT,
  })
  status: BudgetStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => BudgetItem, (budgetItem) => budgetItem.budget)
  budgetItems: BudgetItem[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'varchar', length: 255 })
  createdById: string;
}
