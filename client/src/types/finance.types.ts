export type ExpenseCategory =
  | 'feed'
  | 'medicine'
  | 'veterinary'
  | 'labor'
  | 'utilities'
  | 'equipment'
  | 'maintenance'
  | 'transport'
  | 'insurance'
  | 'taxes'
  | 'rent'
  | 'other_expense';

export type IncomeCategory =
  | 'egg_sales'
  | 'bird_sales'
  | 'fish_sales'
  | 'livestock_sales'
  | 'milk_sales'
  | 'meat_sales'
  | 'manure_sales'
  | 'service_income'
  | 'other_income';

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
  CREDIT_CARD = 'credit_card',
  MOBILE_MONEY = 'mobile_money',
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum FinanceTransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface CreateTransactionRequest {
  type: FinanceTransactionType;
  category: IncomeCategory | ExpenseCategory;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}