export interface CreateTransactionDto {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category_id: string;
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'credit_card' | 'mobile_money';
  transaction_date: string;
  subcategory?: string;
  reference_number?: string;
  notes?: string;
  cost_center_id?: string;
  user_id: string;
  farm_id: string;
}

export interface UpdateTransactionDto {
  type?: 'income' | 'expense';
  amount?: number;
  description?: string;
  category_id?: string;
  payment_method?: 'cash' | 'bank_transfer' | 'check' | 'credit_card' | 'mobile_money';
  transaction_date?: string;
  subcategory?: string;
  reference_number?: string;
  notes?: string;
  cost_center_id?: string;
}

export interface GetTransactionsQueryDto {
  page?: number;
  limit?: number;
  type?: 'income' | 'expense';
  category_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  farm_id: string;
}

export interface TransactionResponse {
  id: string;
  transaction_number: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: {
    id: string;
    name: string;
    type: 'income' | 'expense';
  };
  subcategory?: string;
  payment_method: string;
  payment_status: string;
  transaction_date: Date;
  reference_number?: string;
  notes?: string;
  cost_center?: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    first_name: string;
    last_name: string;
  };
  farm: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface GetTransactionsResponse {
  transactions: TransactionResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CategoryResponse {
  id: string;
  name: string;
  type: 'income' | 'expense';
  default_category?: string;
  description?: string;
  is_custom: boolean;
  is_active: boolean;
  color?: string;
  icon?: string;
  farm_id?: string;
  created_by?: string;
  createdAt: Date;
  updatedAt: Date;
}