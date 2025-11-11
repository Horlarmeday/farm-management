import { FinanceTransactionType, PaymentStatus, PaymentMethod } from '../../../shared/src/types';
import { Column, Entity, JoinColumn, ManyToOne, BeforeInsert, BeforeUpdate, AfterLoad } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { CostCenter } from './CostCenter';
import { Farm } from './Farm';
import { User } from './User';
import { FinancialCategory } from './FinancialCategory';
import { getEncryptionService } from '../services/encryption.service';

@Entity('financial_transactions')
export class FinancialTransaction extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  transactionNumber!: string;

  @Column({ type: 'enum', enum: FinanceTransactionType })
  type!: FinanceTransactionType;

  @Column({ type: 'text' })
  private _encryptedAmount!: string;

  // Virtual property for amount
  private _amount?: number;
  
  get amount(): number {
    return this._amount ?? 0;
  }
  
  set amount(value: number) {
    this._amount = value;
  }

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

  @Column({ type: 'text', nullable: true })
  private _encryptedReferenceNumber?: string;

  // Virtual property for reference number
  private _referenceNumber?: string;
  
  get referenceNumber(): string | undefined {
    return this._referenceNumber;
  }
  
  set referenceNumber(value: string | undefined) {
    this._referenceNumber = value;
  }

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

  // Encryption hooks
  @BeforeInsert()
  @BeforeUpdate()
  encryptSensitiveData(): void {
    const encryptionService = getEncryptionService();
    if (this._amount !== undefined) {
      this._encryptedAmount = encryptionService.encryptAmount(this._amount);
    }
    if (this._referenceNumber !== undefined) {
      this._encryptedReferenceNumber = this._referenceNumber ? 
        encryptionService.encrypt(this._referenceNumber) : undefined;
    }
  }

  @AfterLoad()
  decryptSensitiveData(): void {
    const encryptionService = getEncryptionService();
    if (this._encryptedAmount) {
      this._amount = encryptionService.decryptAmount(this._encryptedAmount);
    }
    if (this._encryptedReferenceNumber) {
      this._referenceNumber = encryptionService.decrypt(this._encryptedReferenceNumber);
    }
  }
}
