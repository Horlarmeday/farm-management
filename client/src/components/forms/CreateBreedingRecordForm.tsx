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
import { useAnimals, useCreateBreedingRecord } from '@/hooks/useLivestock';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface CreateBreedingRecordFormProps {
  onSuccess?: () => void;
}

export default function CreateBreedingRecordForm({ onSuccess }: CreateBreedingRecordFormProps) {
  const { toast } = useToast();
  const createBreedingMutation = useCreateBreedingRecord();
  const { data: animalsResponse, isLoading: animalsLoading } = useAnimals({ limit: 100 });

  const [formData, setFormData] = useState({
    femaleId: '',
    maleId: '',
    breedingDate: '',
    breedingMethod: '',
    notes: '',
  });

  useEffect(() => {
    // Set default date to today
    setFormData((prev) => ({ ...prev, breedingDate: new Date().toISOString().split('T')[0] }));
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.femaleId || !formData.breedingDate || !formData.breedingMethod) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        femaleId: formData.femaleId,
        maleId: formData.maleId || undefined,
        breedingDate: new Date(formData.breedingDate),
        breedingMethod: formData.breedingMethod as 'NATURAL' | 'ARTIFICIAL_INSEMINATION',
        notes: formData.notes || undefined,
      };

      await createBreedingMutation.mutateAsync(payload);

      toast({
        title: 'Success',
        description: 'Breeding record created successfully',
      });

      // Reset form
      setFormData({
        femaleId: '',
        maleId: '',
        breedingDate: new Date().toISOString().split('T')[0],
        breedingMethod: '',
        notes: '',
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create breeding record',
        variant: 'destructive',
      });
    }
  };

  // Filter animals by gender
  const animals = animalsResponse?.data || [];
  const femaleAnimals = useMemo(
    () => animals.filter((animal: any) => animal.gender === 'female' && animal.status === 'active'),
    [animals],
  );
  const maleAnimals = useMemo(
    () => animals.filter((animal: any) => animal.gender === 'male' && animal.status === 'active'),
    [animals],
  );

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Record Breeding</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="femaleId">Female Animal *</Label>
            <Select
              value={formData.femaleId}
              onValueChange={(value) => handleInputChange('femaleId', value)}
              disabled={animalsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select female animal" />
              </SelectTrigger>
              <SelectContent>
                {femaleAnimals.length === 0 ? (
                  <SelectItem value="no-animals" disabled>
                    No female animals available
                  </SelectItem>
                ) : (
                  femaleAnimals.map((animal: any) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.tagNumber} - {animal.breed} ({animal.species})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maleId">Male Animal (Optional)</Label>
            <Select
              value={formData.maleId}
              onValueChange={(value) => handleInputChange('maleId', value)}
              disabled={animalsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select male animal (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {maleAnimals.map((animal: any) => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.tagNumber} - {animal.breed} ({animal.species})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="breedingDate">Breeding Date *</Label>
            <Input
              id="breedingDate"
              type="date"
              value={formData.breedingDate}
              onChange={(e) => handleInputChange('breedingDate', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="breedingMethod">Breeding Method *</Label>
            <Select
              value={formData.breedingMethod}
              onValueChange={(value) => handleInputChange('breedingMethod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NATURAL">Natural Breeding</SelectItem>
                <SelectItem value="ARTIFICIAL_INSEMINATION">Artificial Insemination</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional observations about breeding..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="submit"
            className="farm-button-primary"
            disabled={createBreedingMutation.isPending || animalsLoading}
          >
            {createBreedingMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              'Record Breeding'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
