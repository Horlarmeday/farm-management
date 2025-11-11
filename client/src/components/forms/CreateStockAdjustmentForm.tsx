import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCreateStockAdjustment, useInventoryItems } from '@/hooks/useInventory';
import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';

interface CreateStockAdjustmentFormProps {
  onSuccess?: () => void;
}

export default function CreateStockAdjustmentForm({ onSuccess }: CreateStockAdjustmentFormProps) {
  const { toast } = useToast();
  const createAdjustment = useCreateStockAdjustment();
  const { data: itemsResponse, isLoading: itemsLoading } = useInventoryItems({ limit: 200 });
  const items = useMemo(() => itemsResponse || [], [itemsResponse]);

  const [formData, setFormData] = useState({
    itemId: '',
    adjustmentType: '' as '' | 'increase' | 'decrease',
    quantity: '',
    reason: '',
    notes: '',
  });

  const handleChange = (field: string, value: string) => setFormData((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemId || !formData.adjustmentType || !formData.quantity || !formData.reason) {
      toast({ title: 'Error', description: 'All required fields must be filled', variant: 'destructive' });
      return;
    }
    try {
      await createAdjustment.mutateAsync({
        itemId: formData.itemId,
        adjustmentType: formData.adjustmentType,
        quantity: parseFloat(formData.quantity),
        reason: formData.reason,
        notes: formData.notes || undefined,
      });
      setFormData({ itemId: '', adjustmentType: '', quantity: '', reason: '', notes: '' });
      onSuccess?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create stock adjustment', variant: 'destructive' });
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create Stock Adjustment</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Item *</Label>
            <Select value={formData.itemId} onValueChange={(v) => handleChange('itemId', v)} disabled={itemsLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {items.map((it: any) => (
                  <SelectItem key={it.id} value={it.id}>
                    {it.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Adjustment Type *</Label>
            <Select value={formData.adjustmentType} onValueChange={(v) => handleChange('adjustmentType', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">Increase</SelectItem>
                <SelectItem value="decrease">Decrease</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input id="quantity" type="number" step="0.01" min="0" value={formData.quantity} onChange={(e) => handleChange('quantity', e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Input id="reason" value={formData.reason} onChange={(e) => handleChange('reason', e.target.value)} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={3} />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="submit" className="farm-button-primary" disabled={createAdjustment.isPending || itemsLoading}>
            {createAdjustment.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Create Adjustment'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}


