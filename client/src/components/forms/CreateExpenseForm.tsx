import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCreateFinancialTransaction, useFinancialCategories } from '@/hooks/useFinance';
import { getPaymentMethodOptions } from '@/lib/formUtils';
import { Loader2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { FinanceTransactionType, PaymentMethod } from '../../../shared/src/types/finance.types';

interface CreateExpenseFormProps {
  onSuccess?: () => void;
}

const CreateExpenseForm: React.FC<CreateExpenseFormProps> = React.memo(({ onSuccess }) => {
  const { toast } = useToast();
  const createTransactionMutation = useCreateFinancialTransaction();
  const { data: categories, isLoading: categoriesLoading } = useFinancialCategories();

  const [formData, setFormData] = useState({
    categoryId: '',
    description: '',
    amount: '',
    expenseDate: '',
    paymentMethod: '',
    referenceNumber: '',
    notes: '',
  });

  // Filter expense categories
  const expenseCategories = useMemo(() => {
    return categories?.filter((cat) => cat.type === 'expense' && cat.is_active) || [];
  }, [categories]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.categoryId ||
      !formData.description ||
      !formData.amount ||
      !formData.expenseDate ||
      !formData.paymentMethod
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Validate amount is positive
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Error',
        description: 'Amount must be a positive number',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createTransactionMutation.mutateAsync({
        type: FinanceTransactionType.EXPENSE,
        category: formData.categoryId as any, // Category ID will be validated by server
        amount: amount,
        currency: 'NGN', // Default to Nigerian Naira
        description: formData.description,
        date: new Date(formData.expenseDate),
        paymentMethod: formData.paymentMethod as PaymentMethod,
        referenceNumber: formData.referenceNumber || undefined,
        referenceType: formData.referenceNumber ? 'manual' : undefined,
        notes: formData.notes || undefined,
      });

      toast({
        title: 'Success',
        description: 'Expense recorded successfully',
      });

      // Reset form
      setFormData({
        categoryId: '',
        description: '',
        amount: '',
        expenseDate: '',
        paymentMethod: '',
        referenceNumber: '',
        notes: '',
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record expense',
        variant: 'destructive',
      });
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Record New Expense</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="categoryId">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => handleInputChange('categoryId', value)}
              disabled={categoriesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={categoriesLoading ? 'Loading...' : 'Select category'} />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount (₦) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 150.00"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Description <span className="text-red-500">*</span>
          </Label>
          <Input
            id="description"
            placeholder="e.g., Weekly feed purchase for poultry"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expenseDate">
              Expense Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="expenseDate"
              type="date"
              value={formData.expenseDate}
              onChange={(e) => handleInputChange('expenseDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">
              Payment Method <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => handleInputChange('paymentMethod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {getPaymentMethodOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="referenceNumber">Reference Number</Label>
          <Input
            id="referenceNumber"
            placeholder="e.g., INV-001, Receipt #123"
            value={formData.referenceNumber}
            onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional information about the expense..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="submit"
            className="farm-button-primary"
            disabled={createTransactionMutation.isPending || categoriesLoading}
          >
            {createTransactionMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              'Record Expense'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
});

CreateExpenseForm.displayName = 'CreateExpenseForm';

export default CreateExpenseForm;
