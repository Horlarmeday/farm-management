import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { PayrollStatus } from '../../../shared/src/types';

@Entity('payroll_records')
export class PayrollRecord extends BaseEntity {
  @Column({ type: 'date' })
  payPeriodStart!: Date;

  @Column({ type: 'date' })
  payPeriodEnd!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseSalary!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  regularHours!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overtimeHours!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  regularPay!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtimePay!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  bonuses!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deductions!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxes!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  grossPay!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  netPay!: number;

  @Column({ type: 'enum', enum: PayrollStatus, default: PayrollStatus.PENDING })
  status!: PayrollStatus;

  @Column({ type: 'date', nullable: true })
  paidDate?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentMethod?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'simple-json', nullable: true })
  breakdown?: Record<string, any>;

  // Relationships
  @ManyToOne(() => User, (user) => user.payrollRecords)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 255 })
  userId!: string;
}
