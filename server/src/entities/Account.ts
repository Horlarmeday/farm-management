import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { AccountType } from '@kuyash/shared';

@Entity('accounts')
export class Account extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  accountNumber!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'enum', enum: AccountType })
  type!: AccountType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  parentAccountId?: string;
}
