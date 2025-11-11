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
import { useCreateFeedingLog, useBirdBatches } from '@/hooks/usePoultry';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CreatePoultryFeedingFormProps {
  onSuccess?: () => void;
}

export default function CreatePoultryFeedingForm({ onSuccess }: CreatePoultryFeedingFormProps) {
  const { toast } = useToast();
  const createFeedingMutation = useCreateFeedingLog();
  const { data: batchesResponse, isLoading: batchesLoading } = useBirdBatches({ limit: 100 });

  const [formData, setFormData] = useState({
    batchId: '',
    feedingTime: '',
    feedType: '',
    quantityKg: '',
    notes: '',
  });

  useEffect(() => {
    // Set default date/time to now
    const now = new Date();
    setFormData((prev) => ({
      ...prev,
      feedingTime: now.toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
    }));
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.batchId || !formData.feedingTime || !formData.feedType || !formData.quantityKg) {
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
        feedingTime: new Date(formData.feedingTime),
        feedType: formData.feedType,
        quantityKg: parseFloat(formData.quantityKg),
        notes: formData.notes || undefined,
      };

      await createFeedingMutation.mutateAsync(payload);

      toast({
        title: 'Success',
        description: 'Feeding record created successfully',
      });

      // Reset form
      const now = new Date();
      setFormData({
        batchId: '',
        feedingTime: now.toISOString().slice(0, 16),
        feedType: '',
        quantityKg: '',
        notes: '',
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create feeding record',
        variant: 'destructive',
      });
    }
  };

  const batches = batchesResponse?.data || [];

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Record Feeding</DialogTitle>
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
            <Label htmlFor="feedingTime">Feeding Time *</Label>
            <Input
              id="feedingTime"
              type="datetime-local"
              value={formData.feedingTime}
              onChange={(e) => handleInputChange('feedingTime', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="feedType">Feed Type *</Label>
            <Input
              id="feedType"
              placeholder="e.g., Layer Feed, Starter Feed, Grower Feed"
              value={formData.feedType}
              onChange={(e) => handleInputChange('feedType', e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantityKg">Quantity (kg) *</Label>
            <Input
              id="quantityKg"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 50.5"
              value={formData.quantityKg}
              onChange={(e) => handleInputChange('quantityKg', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional observations about feeding, bird behavior, etc..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="submit"
            className="farm-button-primary"
            disabled={createFeedingMutation.isPending || batchesLoading}
          >
            {createFeedingMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              'Record Feeding'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

