import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { FinancialTransaction } from './FinancialTransaction';

@Entity('cost_centers')
export class CostCenter extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budgetLimit?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  actualSpent!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  managerId?: string;

  @OneToMany(() => FinancialTransaction, (transaction) => transaction.costCenter)
  transactions!: FinancialTransaction[];
}
