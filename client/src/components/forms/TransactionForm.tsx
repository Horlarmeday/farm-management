import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useCreateFinancialTransaction } from '@/hooks/useFinance';
import { Loader2, DollarSign, Calendar, FileText, CreditCard } from 'lucide-react';
import {
  FinanceTransactionType,
  PaymentMethod,
  IncomeCategory,
  ExpenseCategory,
  CreateTransactionRequest
} from '@/types/finance.types';

// Form validation schema
const transactionSchema = z.object({
  type: z.nativeEnum(FinanceTransactionType),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().default('NGN'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Category options
const incomeCategories: { value: IncomeCategory; label: string }[] = [
  { value: 'egg_sales', label: 'Egg Sales' },
  { value: 'bird_sales', label: 'Bird Sales' },
  { value: 'fish_sales', label: 'Fish Sales' },
  { value: 'livestock_sales', label: 'Livestock Sales' },
  { value: 'milk_sales', label: 'Milk Sales' },
  { value: 'meat_sales', label: 'Meat Sales' },
  { value: 'manure_sales', label: 'Manure Sales' },
  { value: 'service_income', label: 'Service Income' },
  { value: 'other_income', label: 'Other Income' },
];

const expenseCategories: { value: ExpenseCategory; label: string }[] = [
  { value: 'feed', label: 'Feed' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'veterinary', label: 'Veterinary' },
  { value: 'labor', label: 'Labor' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'transport', label: 'Transport' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'taxes', label: 'Taxes' },
  { value: 'rent', label: 'Rent' },
  { value: 'other_expense', label: 'Other Expense' },
];

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: PaymentMethod.CASH, label: 'Cash' },
  { value: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer' },
  { value: PaymentMethod.CHEQUE, label: 'Cheque' },
  { value: PaymentMethod.CREDIT_CARD, label: 'Credit Card' },
  { value: PaymentMethod.MOBILE_MONEY, label: 'Mobile Money' },
  { value: PaymentMethod.OTHER, label: 'Other' },
];

export default function TransactionForm({ onSuccess, onCancel }: TransactionFormProps) {
  const { toast } = useToast();
  const createTransactionMutation = useCreateFinancialTransaction();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: FinanceTransactionType.EXPENSE,
      currency: 'NGN',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: PaymentMethod.CASH,
      category: '',
      amount: 0,
      description: '',
      referenceNumber: '',
      notes: '',
    },
  });

  const watchedType = form.watch('type');
  const isIncome = watchedType === FinanceTransactionType.INCOME;

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const transactionData: CreateTransactionRequest = {
        ...data,
        date: new Date(data.date),
        category: data.category as IncomeCategory | ExpenseCategory,
      };

      await createTransactionMutation.mutateAsync(transactionData);
      
      toast({
        title: 'Success',
        description: `${isIncome ? 'Income' : 'Expense'} transaction recorded successfully`,
      });
      
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record transaction. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getCategoryOptions = () => {
    return isIncome ? incomeCategories : expenseCategories;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Record Transaction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Transaction Type Toggle */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.value === FinanceTransactionType.INCOME}
                        onCheckedChange={(checked) => {
                          const newType = checked ? FinanceTransactionType.INCOME : FinanceTransactionType.EXPENSE;
                          field.onChange(newType);
                          // Reset category when type changes
                          form.setValue('category', '');
                        }}
                      />
                      <Label className={`font-medium ${
                        field.value === FinanceTransactionType.INCOME 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {field.value === FinanceTransactionType.INCOME ? 'Income' : 'Expense'}
                      </Label>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Selection */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getCategoryOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (NGN)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter transaction description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Transaction Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Method */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment Method
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Reference Number */}
            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Reference Number (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Invoice #, Receipt #, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this transaction"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={createTransactionMutation.isPending}
                className={isIncome ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {createTransactionMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Record {isIncome ? 'Income' : 'Expense'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}