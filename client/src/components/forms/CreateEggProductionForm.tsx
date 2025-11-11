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
import { useCreateEggProductionLog, useBirdBatches } from '@/hooks/usePoultry';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CreateEggProductionFormProps {
  onSuccess?: () => void;
}

export default function CreateEggProductionForm({ onSuccess }: CreateEggProductionFormProps) {
  const { toast } = useToast();
  const createEggProductionMutation = useCreateEggProductionLog();
  const { data: batchesResponse, isLoading: batchesLoading } = useBirdBatches({ limit: 100 });

  const [formData, setFormData] = useState({
    batchId: '',
    date: '',
    gradeA: '',
    gradeB: '',
    cracked: '',
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

    if (!formData.batchId || !formData.date || !formData.gradeA || !formData.gradeB || !formData.cracked) {
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
        gradeA: parseInt(formData.gradeA, 10),
        gradeB: parseInt(formData.gradeB, 10),
        cracked: parseInt(formData.cracked, 10),
        notes: formData.notes || undefined,
      };

      await createEggProductionMutation.mutateAsync(payload);

      toast({
        title: 'Success',
        description: 'Egg production record created successfully',
      });

      // Reset form
      setFormData({
        batchId: '',
        date: new Date().toISOString().split('T')[0],
        gradeA: '',
        gradeB: '',
        cracked: '',
        notes: '',
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create egg production record',
        variant: 'destructive',
      });
    }
  };

  const batches = batchesResponse?.data || [];

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Record Egg Production</DialogTitle>
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
            <Label htmlFor="date">Production Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gradeA">Grade A Eggs *</Label>
            <Input
              id="gradeA"
              type="number"
              min="0"
              placeholder="e.g., 120"
              value={formData.gradeA}
              onChange={(e) => handleInputChange('gradeA', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gradeB">Grade B Eggs *</Label>
            <Input
              id="gradeB"
              type="number"
              min="0"
              placeholder="e.g., 20"
              value={formData.gradeB}
              onChange={(e) => handleInputChange('gradeB', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cracked">Cracked Eggs *</Label>
            <Input
              id="cracked"
              type="number"
              min="0"
              placeholder="e.g., 5"
              value={formData.cracked}
              onChange={(e) => handleInputChange('cracked', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional observations about egg quality, weather conditions, etc..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="submit"
            className="farm-button-primary"
            disabled={createEggProductionMutation.isPending || batchesLoading}
          >
            {createEggProductionMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              'Record Production'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

