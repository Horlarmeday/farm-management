import { FinanceTransactionType, PaymentStatus, PaymentMethod } from '../../../shared/src/types';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { CostCenter } from './CostCenter';
import { Farm } from './Farm';
import { User } from './User';
import { FinancialCategory } from './FinancialCategory';

@Entity('financial_transactions')
export class FinancialTransaction extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  transactionNumber!: string;

  @Column({ type: 'enum', enum: FinanceTransactionType })
  type!: FinanceTransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @ManyToOne(() => FinancialCategory, category => category.transactions, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category!: FinancialCategory;

  @Column({ type: 'uuid' })
  category_id!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subcategory?: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'date' })
  transactionDate!: Date;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod?: PaymentMethod;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceNumber?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  referenceType?: 'invoice' | 'receipt' | 'order' | 'sale' | 'purchase' | 'manual';

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceId?: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments?: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  recordedById?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'recordedById' })
  recordedBy?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  approvedById?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy?: User;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;



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

  @ManyToOne(() => Farm, { nullable: false })
  @JoinColumn({ name: 'farmId' })
  farm!: Farm;

  @Column({ type: 'varchar', length: 255 })
  farmId!: string;
}
