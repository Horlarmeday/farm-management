import { FinanceTransactionType } from '@kuyash/shared';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { CostCenter } from './CostCenter';
import { User } from './User';

@Entity('financial_transactions')
export class FinancialTransaction extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  transactionNumber!: string;

  @Column({ type: 'enum', enum: FinanceTransactionType })
  type!: FinanceTransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'date' })
  transactionDate!: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reference?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => User, (user) => user.financialTransactions)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 255 })
  userId!: string;

  @ManyToOne(() => CostCenter, (costCenter) => costCenter.transactions, { nullable: true })
  @JoinColumn({ name: 'costCenterId' })
  costCenter?: CostCenter;

  @Column({ type: 'varchar', length: 255, nullable: true })
  costCenterId?: string;
}
