import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Payment } from './Payment';
import { PaymentMethod } from '@kuyash/shared';

@Entity('receipts')
export class Receipt extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  receiptNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentId?: string;

  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment?: Payment;

  @Column({ type: 'date' })
  receiptDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'varchar', length: 255 })
  paidBy: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'issued_by_id' })
  issuedBy: User;

  @Column({ type: 'varchar', length: 255 })
  issuedById: string;
}
