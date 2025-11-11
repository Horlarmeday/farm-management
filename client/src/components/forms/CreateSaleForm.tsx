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
import { getSalePaymentMethodOptions, getUnitOptions } from '@/lib/formUtils';
import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FinanceTransactionType, PaymentMethod } from '@/types/finance.types';

interface CreateSaleFormProps {
  onSuccess?: () => void;
}

export default function CreateSaleForm({ onSuccess }: CreateSaleFormProps) {
  const { toast } = useToast();
  const createTransactionMutation = useCreateFinancialTransaction();
  const { data: categories, isLoading: categoriesLoading } = useFinancialCategories();

  const [formData, setFormData] = useState({
    categoryId: '',
    productName: '',
    quantity: '',
    unit: '',
    unitPrice: '',
    totalAmount: '',
    customerName: '',
    customerContact: '',
    saleDate: '',
    paymentMethod: '',
    notes: '',
  });

  // Filter income categories
  const incomeCategories = useMemo(() => {
    return categories?.filter((cat) => cat.type === 'income' && cat.is_active) || [];
  }, [categories]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate total amount when quantity or unit price changes
      if (field === 'quantity' || field === 'unitPrice') {
        const quantity = parseFloat(field === 'quantity' ? value : updated.quantity) || 0;
        const unitPrice = parseFloat(field === 'unitPrice' ? value : updated.unitPrice) || 0;
        updated.totalAmount = (quantity * unitPrice).toFixed(2);
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.categoryId ||
      !formData.productName ||
      !formData.quantity ||
      !formData.unitPrice ||
      !formData.customerName ||
      !formData.saleDate ||
      !formData.paymentMethod
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Validate amounts are positive
    const totalAmount = parseFloat(formData.totalAmount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Total amount must be a positive number',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createTransactionMutation.mutateAsync({
        type: FinanceTransactionType.INCOME,
        category: formData.categoryId as any, // Category ID will be validated by server
        amount: totalAmount,
        currency: 'NGN', // Default to Nigerian Naira
        description: `Sale of ${formData.quantity} ${formData.unit || 'units'} ${formData.productName} to ${formData.customerName}`,
        date: new Date(formData.saleDate),
        paymentMethod: formData.paymentMethod as PaymentMethod,
        referenceNumber: formData.customerContact || undefined,
        referenceType: 'sale',
        notes: formData.notes || undefined,
      });

      toast({
        title: 'Success',
        description: 'Sale recorded successfully',
      });

      // Reset form
      setFormData({
        categoryId: '',
        productName: '',
        quantity: '',
        unit: '',
        unitPrice: '',
        totalAmount: '',
        customerName: '',
        customerContact: '',
        saleDate: '',
        paymentMethod: '',
        notes: '',
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record sale',
        variant: 'destructive',
      });
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Record New Sale</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="categoryId">
              Product Category <span className="text-red-500">*</span>
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
                {incomeCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productName">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productName"
              placeholder="e.g., Fresh Chicken Eggs"
              value={formData.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 50"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select
              value={formData.unit}
              onValueChange={(value) => handleInputChange('unit', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {getUnitOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitPrice">
              Unit Price (₦) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="unitPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 3.50"
              value={formData.unitPrice}
              onChange={(e) => handleInputChange('unitPrice', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalAmount">Total Amount (₦)</Label>
          <Input
            id="totalAmount"
            type="number"
            step="0.01"
            value={formData.totalAmount}
            readOnly
            className="bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">
              Customer Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerName"
              placeholder="e.g., John Smith"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerContact">Customer Contact</Label>
            <Input
              id="customerContact"
              placeholder="e.g., +1234567890"
              value={formData.customerContact}
              onChange={(e) => handleInputChange('customerContact', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="saleDate">
              Sale Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="saleDate"
              type="date"
              value={formData.saleDate}
              onChange={(e) => handleInputChange('saleDate', e.target.value)}
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
                {getSalePaymentMethodOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional information about the sale..."
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
              'Record Sale'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
