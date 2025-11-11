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
import { useAnimals, useCreateProductionLog } from '@/hooks/useLivestock';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CreateProductionRecordFormProps {
  onSuccess?: () => void;
}

export default function CreateProductionRecordForm({ onSuccess }: CreateProductionRecordFormProps) {
  const { toast } = useToast();
  const createProductionMutation = useCreateProductionLog();
  const { data: animalsResponse, isLoading: animalsLoading } = useAnimals({ limit: 100 });

  const [formData, setFormData] = useState({
    animalId: '',
    date: '',
    productionType: '',
    quantity: '',
    unit: '',
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

    if (
      !formData.animalId ||
      !formData.date ||
      !formData.productionType ||
      !formData.quantity ||
      !formData.unit
    ) {
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
        productionType: formData.productionType as 'MILK' | 'MEAT' | 'WOOL' | 'EGGS',
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        notes: formData.notes || undefined,
      };

      await createProductionMutation.mutateAsync(payload);

      toast({
        title: 'Success',
        description: 'Production record created successfully',
      });

      // Reset form
      setFormData({
        animalId: '',
        date: new Date().toISOString().split('T')[0],
        productionType: '',
        quantity: '',
        unit: '',
        notes: '',
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create production record',
        variant: 'destructive',
      });
    }
  };

  const animals = animalsResponse?.data || [];

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Record Production</DialogTitle>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="productionType">Production Type *</Label>
            <Select
              value={formData.productionType}
              onValueChange={(value) => handleInputChange('productionType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MILK">Milk</SelectItem>
                <SelectItem value="MEAT">Meat</SelectItem>
                <SelectItem value="WOOL">Wool</SelectItem>
                <SelectItem value="EGGS">Eggs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 25.5"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Input
            id="unit"
            placeholder="e.g., liters, kg, pieces"
            value={formData.unit}
            onChange={(e) => handleInputChange('unit', e.target.value)}
            maxLength={20}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional observations about production, animal behavior, weather conditions, etc..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="submit"
            className="farm-button-primary"
            disabled={createProductionMutation.isPending || animalsLoading}
          >
            {createProductionMutation.isPending ? (
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
