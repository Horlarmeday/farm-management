import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Farm } from './Farm';
import { User } from './User';
import { FinancialCategory } from './FinancialCategory';

export enum BudgetPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum BudgetStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

@Entity('budgets')
@Index(['farm_id', 'period', 'start_date'], { unique: true })
export class Budget extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: BudgetPeriod })
  period!: BudgetPeriod;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date' })
  end_date!: Date;

  @Column({ type: 'enum', enum: BudgetStatus, default: BudgetStatus.DRAFT })
  status!: BudgetStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_income_budget!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_expense_budget!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_income_actual!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_expense_actual!: number;

  @Column({ type: 'simple-json', nullable: true })
  notes?: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  // Farm association for multi-tenant support
  @ManyToOne(() => Farm, farm => farm.budgets, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id' })
  farm!: Farm;

  @Column({ type: 'uuid' })
  farm_id!: string;

  // User tracking
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by_id' })
  created_by!: User;

  @Column({ type: 'uuid' })
  created_by_id!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by_id' })
  updated_by?: User;

  @Column({ type: 'uuid', nullable: true })
  updated_by_id?: string;

  // Relations
  @OneToMany(() => BudgetCategory, budgetCategory => budgetCategory.budget, {
    cascade: true,
    eager: false,
  })
  budget_categories!: BudgetCategory[];

  // Computed properties
  get net_budget(): number {
    return Number(this.total_income_budget) - Number(this.total_expense_budget);
  }

  get net_actual(): number {
    return Number(this.total_income_actual) - Number(this.total_expense_actual);
  }

  get variance(): number {
    return this.net_actual - this.net_budget;
  }

  get budget_utilization_percentage(): number {
    if (Number(this.total_expense_budget) === 0) return 0;
    return (Number(this.total_expense_actual) / Number(this.total_expense_budget)) * 100;
  }
}

@Entity('budget_categories')
@Index(['budget_id', 'category_id'], { unique: true })
export class BudgetCategory extends BaseEntity {
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  budgeted_amount!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actual_amount!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  // Budget association
  @ManyToOne(() => Budget, budget => budget.budget_categories, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'budget_id' })
  budget!: Budget;

  @Column({ type: 'uuid' })
  budget_id!: string;

  // Category association
  @ManyToOne(() => FinancialCategory, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category!: FinancialCategory;

  @Column({ type: 'uuid' })
  category_id!: string;

  // User tracking
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by_id' })
  created_by!: User;

  @Column({ type: 'uuid' })
  created_by_id!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by_id' })
  updated_by?: User;

  @Column({ type: 'uuid', nullable: true })
  updated_by_id?: string;

  // Computed properties
  get variance(): number {
    return Number(this.actual_amount) - Number(this.budgeted_amount);
  }

  get variance_percentage(): number {
    if (Number(this.budgeted_amount) === 0) return 0;
    return (this.variance / Number(this.budgeted_amount)) * 100;
  }

  get utilization_percentage(): number {
    if (Number(this.budgeted_amount) === 0) return 0;
    return (Number(this.actual_amount) / Number(this.budgeted_amount)) * 100;
  }
}