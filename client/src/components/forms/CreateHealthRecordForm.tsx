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
import { useCreateHealthRecord, useBirdBatches } from '@/hooks/usePoultry';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CreateHealthRecordFormProps {
  onSuccess?: () => void;
}

export default function CreateHealthRecordForm({ onSuccess }: CreateHealthRecordFormProps) {
  const { toast } = useToast();
  const createHealthMutation = useCreateHealthRecord();
  const { data: batchesResponse, isLoading: batchesLoading } = useBirdBatches({ limit: 100 });

  const [formData, setFormData] = useState({
    batchId: '',
    date: '',
    healthType: '',
    description: '',
    quantity: '',
    cost: '',
    notes: '',
  });

  useEffect(() => {
    // Set default date to today
    setFormData((prev) => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.batchId || !formData.date || !formData.healthType || !formData.description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        batchId: formData.batchId,
        date: new Date(formData.date),
        healthType: formData.healthType as 'VACCINATION' | 'TREATMENT' | 'MORTALITY' | 'ILLNESS',
        description: formData.description,
        quantity: formData.quantity ? parseInt(formData.quantity, 10) : undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        notes: formData.notes || undefined,
      };

      await createHealthMutation.mutateAsync(payload);

      toast({
        title: 'Success',
        description: 'Health record created successfully',
      });

      // Reset form
      setFormData({
        batchId: '',
        date: new Date().toISOString().split('T')[0],
        healthType: '',
        description: '',
        quantity: '',
        cost: '',
        notes: '',
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create health record',
        variant: 'destructive',
      });
    }
  };

  const batches = batchesResponse?.data || [];

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Record Health Status</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="batchId">Bird Batch *</Label>
            <Select
              value={formData.batchId}
              onValueChange={(value) => handleInputChange('batchId', value)}
              disabled={batchesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.length === 0 ? (
                  <SelectItem value="no-batches" disabled>
                    No batches available
                  </SelectItem>
                ) : (
                  batches
                    .filter((batch: any) => batch.status === 'active')
                    .map((batch: any) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.batchNumber || batch.name} - {batch.birdType || 'N/A'}
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Record Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="healthType">Health Event Type *</Label>
          <Select
            value={formData.healthType}
            onValueChange={(value) => handleInputChange('healthType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select health event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VACCINATION">Vaccination</SelectItem>
              <SelectItem value="TREATMENT">Treatment</SelectItem>
              <SelectItem value="MORTALITY">Mortality</SelectItem>
              <SelectItem value="ILLNESS">Illness</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe the health event, symptoms, diagnosis, treatment, etc..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            maxLength={500}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (e.g., birds affected)</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              placeholder="e.g., 5"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Cost (NGN)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 5000.00"
              value={formData.cost}
              onChange={(e) => handleInputChange('cost', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any additional observations or recommendations..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="submit"
            className="farm-button-primary"
            disabled={createHealthMutation.isPending || batchesLoading}
          >
            {createHealthMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              'Record Health Status'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

