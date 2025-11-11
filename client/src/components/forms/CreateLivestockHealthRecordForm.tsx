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
import { useAnimals, useCreateHealthRecord } from '@/hooks/useLivestock';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CreateLivestockHealthRecordFormProps {
  onSuccess?: () => void;
}

export default function CreateLivestockHealthRecordForm({
  onSuccess,
}: CreateLivestockHealthRecordFormProps) {
  const { toast } = useToast();
  const createHealthMutation = useCreateHealthRecord();
  const { data: animalsResponse, isLoading: animalsLoading } = useAnimals({ limit: 100 });

  const [formData, setFormData] = useState({
    animalId: '',
    date: '',
    healthType: '',
    description: '',
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

    if (!formData.animalId || !formData.date || !formData.healthType || !formData.description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        animalId: formData.animalId,
        date: new Date(formData.date),
        type: formData.healthType as 'VACCINATION' | 'TREATMENT' | 'CHECKUP' | 'ILLNESS',
        description: formData.description,
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
        animalId: '',
        date: new Date().toISOString().split('T')[0],
        healthType: '',
        description: '',
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

  const animals = animalsResponse?.data || [];

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Record Animal Health</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="animalId">Animal *</Label>
            <Select
              value={formData.animalId}
              onValueChange={(value) => handleInputChange('animalId', value)}
              disabled={animalsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select animal" />
              </SelectTrigger>
              <SelectContent>
                {animals.length === 0 ? (
                  <SelectItem value="no-animals" disabled>
                    No animals available
                  </SelectItem>
                ) : (
                  animals
                    .filter((animal: any) => animal.status === 'active')
                    .map((animal: any) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.tagNumber} - {animal.breed} ({animal.species})
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
              <SelectItem value="CHECKUP">Checkup</SelectItem>
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

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional observations, recommendations, or follow-up instructions..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="submit"
            className="farm-button-primary"
            disabled={createHealthMutation.isPending || animalsLoading}
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
