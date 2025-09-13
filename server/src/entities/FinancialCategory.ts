import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Farm } from './Farm';
import { User } from './User';
import { FinancialTransaction } from './FinancialTransaction';

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum DefaultCategory {
  // Income categories
  CROP_SALES = 'crop_sales',
  LIVESTOCK_SALES = 'livestock_sales',
  PRODUCT_SALES = 'product_sales',
  GOVERNMENT_SUBSIDIES = 'government_subsidies',
  INSURANCE_CLAIMS = 'insurance_claims',
  OTHER_INCOME = 'other_income',
  
  // Expense categories
  SEEDS_PLANTS = 'seeds_plants',
  FERTILIZERS = 'fertilizers',
  PESTICIDES = 'pesticides',
  FEED = 'feed',
  VETERINARY = 'veterinary',
  FUEL = 'fuel',
  EQUIPMENT_MAINTENANCE = 'equipment_maintenance',
  LABOR = 'labor',
  UTILITIES = 'utilities',
  INSURANCE = 'insurance',
  TAXES = 'taxes',
  RENT_LEASE = 'rent_lease',
  TRANSPORTATION = 'transportation',
  MARKETING = 'marketing',
  PROFESSIONAL_SERVICES = 'professional_services',
  OTHER_EXPENSES = 'other_expenses',
}

@Entity('financial_categories')
export class FinancialCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'enum', enum: CategoryType })
  type!: CategoryType;

  @Column({ type: 'enum', enum: DefaultCategory, nullable: true })
  default_category?: DefaultCategory;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  is_custom!: boolean;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon?: string;

  // Farm association - null for system default categories
  @ManyToOne(() => Farm, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id' })
  farm?: Farm;

  @Column({ type: 'uuid', nullable: true })
  farm_id?: string;

  // User who created this custom category
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  created_by?: User;

  @Column({ type: 'uuid', nullable: true })
  created_by_id?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @OneToMany(() => FinancialTransaction, transaction => transaction.category)
  transactions!: FinancialTransaction[];
}