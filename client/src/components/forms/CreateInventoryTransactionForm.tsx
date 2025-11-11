import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCreateInventoryTransaction, useInventoryItems } from '@/hooks/useInventory';
import { TransactionType } from '@/types/inventory.types';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface CreateInventoryTransactionFormProps {
  onSuccess?: () => void;
}

const TRANSACTION_TYPES: TransactionType[] = [
  TransactionType.IN,
  TransactionType.OUT,
  TransactionType.ADJUSTMENT,
  TransactionType.TRANSFER,
  TransactionType.WASTE,
  TransactionType.RETURN,
];

export default function CreateInventoryTransactionForm({ onSuccess }: CreateInventoryTransactionFormProps) {
  const { toast } = useToast();
  const createTxn = useCreateInventoryTransaction();
  const { data: itemsResponse, isLoading: itemsLoading } = useInventoryItems({ limit: 200 });
  const items = useMemo(() => itemsResponse || [], [itemsResponse]);

  const [formData, setFormData] = useState({
    itemId: '',
    type: '' as '' | TransactionType,
    quantity: '',
    unitCost: '',
    reference: '',
    notes: '',
  });

  useEffect(() => {
    // Default type to OUT for common consumption; adjust as needed by context
    setFormData((p) => ({ ...p, type: TransactionType.OUT }));
  }, []);

  const handleChange = (field: string, value: string) => setFormData((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemId || !formData.type || !formData.quantity) {
      toast({ title: 'Error', description: 'Item, type and quantity are required', variant: 'destructive' });
      return;
    }

    try {
      await createTxn.mutateAsync({
        itemId: formData.itemId,
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        unitCost: formData.unitCost ? parseFloat(formData.unitCost) : undefined,
        totalCost: formData.unitCost ? parseFloat(formData.unitCost) * parseFloat(formData.quantity) : undefined,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined,
      });

      setFormData({ itemId: '', type: TransactionType.OUT, quantity: '', unitCost: '', reference: '', notes: '' });
      onSuccess?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create transaction', variant: 'destructive' });
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create Inventory Transaction</DialogTitle>
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
            <Label>Type *</Label>
            <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>
                ))}
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
            <Label htmlFor="unitCost">Unit Cost (₦)</Label>
            <Input id="unitCost" type="number" step="0.01" min="0" value={formData.unitCost} onChange={(e) => handleChange('unitCost', e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference">Reference</Label>
          <Input id="reference" value={formData.reference} onChange={(e) => handleChange('reference', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={3} />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="submit" className="farm-button-primary" disabled={createTxn.isPending || itemsLoading}>
            {createTxn.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Create Transaction'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}


