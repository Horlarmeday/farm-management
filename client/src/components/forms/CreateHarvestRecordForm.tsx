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
import { useCreateHarvestLog, usePonds } from '@/hooks/useFishery';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CreateHarvestRecordFormProps {
  onSuccess?: () => void;
}

export default function CreateHarvestRecordForm({ onSuccess }: CreateHarvestRecordFormProps) {
  const { toast } = useToast();
  const createHarvestMutation = useCreateHarvestLog();
  const { data: pondsResponse, isLoading: pondsLoading } = usePonds({ limit: 100 });

  const [formData, setFormData] = useState({
    pondId: '',
    harvestDate: '',
    quantityHarvested: '',
    totalWeightKg: '',
    averageWeightKg: '',
    harvestType: '',
    notes: '',
  });

  useEffect(() => {
    // Set default date to today
    setFormData((prev) => ({ ...prev, harvestDate: new Date().toISOString().split('T')[0] }));
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate average weight when quantity or total weight changes
      if (field === 'quantityHarvested' || field === 'totalWeightKg') {
        const quantity = parseFloat(field === 'quantityHarvested' ? value : updated.quantityHarvested) || 0;
        const totalWeight = parseFloat(field === 'totalWeightKg' ? value : updated.totalWeightKg) || 0;
        if (quantity > 0 && totalWeight > 0) {
          updated.averageWeightKg = (totalWeight / quantity).toFixed(3);
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.pondId ||
      !formData.harvestDate ||
      !formData.quantityHarvested ||
      !formData.totalWeightKg ||
      !formData.harvestType
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Convert average weight from kg to grams (server expects grams)
      const averageWeightG = parseFloat(formData.averageWeightKg || '0') * 1000;

      // Server validation expects different field names than shared types
      // Using 'as any' temporarily to bypass type mismatch - will be fixed in Phase 3
      const payload: any = {
        pondId: formData.pondId,
        harvestDate: new Date(formData.harvestDate),
        quantityHarvested: parseInt(formData.quantityHarvested, 10),
        totalWeightKg: parseFloat(formData.totalWeightKg),
        averageWeightG: averageWeightG,
        harvestType: formData.harvestType as 'PARTIAL' | 'FULL',
        notes: formData.notes || undefined,
      };

      await createHarvestMutation.mutateAsync(payload);

      toast({
        title: 'Success',
        description: 'Harvest record created successfully',
      });

      // Reset form
      setFormData({
        pondId: '',
        harvestDate: new Date().toISOString().split('T')[0],
        quantityHarvested: '',
        totalWeightKg: '',
        averageWeightKg: '',
        harvestType: '',
        notes: '',
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create harvest record',
        variant: 'destructive',
      });
    }
  };

  const ponds = pondsResponse?.data || [];

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Record Fish Harvest</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pondId">Pond *</Label>
            <Select
              value={formData.pondId}
              onValueChange={(value) => handleInputChange('pondId', value)}
              disabled={pondsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pond" />
              </SelectTrigger>
              <SelectContent>
                {ponds.length === 0 ? (
                  <SelectItem value="no-ponds" disabled>
                    No ponds available
                  </SelectItem>
                ) : (
                  ponds.map((pond: any) => (
                    <SelectItem key={pond.id} value={pond.id}>
                      {pond.name} - {pond.pondType || 'N/A'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="harvestDate">Harvest Date *</Label>
            <Input
              id="harvestDate"
              type="date"
              value={formData.harvestDate}
              onChange={(e) => handleInputChange('harvestDate', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="harvestType">Harvest Type *</Label>
            <Select
              value={formData.harvestType}
              onValueChange={(value) => handleInputChange('harvestType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select harvest type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PARTIAL">Partial Harvest</SelectItem>
                <SelectItem value="FULL">Full Harvest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantityHarvested">Quantity Harvested (fish) *</Label>
            <Input
              id="quantityHarvested"
              type="number"
              min="1"
              placeholder="e.g., 250"
              value={formData.quantityHarvested}
              onChange={(e) => handleInputChange('quantityHarvested', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalWeightKg">Total Weight (kg) *</Label>
            <Input
              id="totalWeightKg"
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g., 150.5"
              value={formData.totalWeightKg}
              onChange={(e) => handleInputChange('totalWeightKg', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="averageWeightKg">Average Weight per Fish (kg)</Label>
            <Input
              id="averageWeightKg"
              type="number"
              step="0.001"
              value={formData.averageWeightKg}
              readOnly
              className="bg-gray-50 dark:bg-gray-800"
              placeholder="Auto-calculated"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional observations about harvest quality, weather conditions, etc..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="submit"
            className="farm-button-primary"
            disabled={createHarvestMutation.isPending || pondsLoading}
          >
            {createHarvestMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              'Record Harvest'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

