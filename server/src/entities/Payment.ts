import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Invoice } from './Invoice';
import { PaymentStatus, PaymentMethod } from '@kuyash/shared';

@Entity('payments')
export class Payment extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  paymentNumber!: string;

  @Column({ type: 'date' })
  paymentDate!: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  method!: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reference?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => Invoice, { nullable: true })
  @JoinColumn({ name: 'invoiceId' })
  invoice?: Invoice;

  @Column({ type: 'varchar', length: 255, nullable: true })
  invoiceId?: string;
}
