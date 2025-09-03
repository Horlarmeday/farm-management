import { InvoiceStatus } from '@kuyash/shared';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { InvoiceItem } from './InvoiceItem';
import { User } from './User';

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  invoiceNumber!: string;

  @Column({ type: 'date' })
  invoiceDate!: Date;

  @Column({ type: 'date' })
  dueDate!: Date;

  @Column({ type: 'varchar', length: 255 })
  customerName!: string;

  @Column({ type: 'text', nullable: true })
  customerAddress?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerEmail?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  customerPhone?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status!: InvoiceStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentTerms?: string;

  @Column({ type: 'date', nullable: true })
  paidDate?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod?: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  // Relationships
  @OneToMany(() => InvoiceItem, (item) => item.invoice)
  items!: InvoiceItem[];

  @ManyToOne(() => User, (user) => user.createdInvoices)
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  @Column({ type: 'varchar', length: 255 })
  createdById!: string;
}
