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
import { useCreateWaterQualityLog, usePonds } from '@/hooks/useFishery';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CreateWaterQualityFormProps {
  onSuccess?: () => void;
}

export default function CreateWaterQualityForm({ onSuccess }: CreateWaterQualityFormProps) {
  const { toast } = useToast();
  const createWaterQualityMutation = useCreateWaterQualityLog();
  const { data: pondsResponse, isLoading: pondsLoading } = usePonds({ limit: 100 });

  const [formData, setFormData] = useState({
    pondId: '',
    date: '',
    temperature: '',
    ph: '',
    dissolvedOxygen: '',
    ammonia: '',
    nitrite: '',
    nitrate: '',
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

    if (!formData.pondId || !formData.date || !formData.temperature || !formData.ph || !formData.dissolvedOxygen) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        pondId: formData.pondId,
        date: new Date(formData.date),
        temperature: parseFloat(formData.temperature),
        ph: parseFloat(formData.ph),
        dissolvedOxygen: parseFloat(formData.dissolvedOxygen),
        ammonia: formData.ammonia ? parseFloat(formData.ammonia) : undefined,
        nitrite: formData.nitrite ? parseFloat(formData.nitrite) : undefined,
        nitrate: formData.nitrate ? parseFloat(formData.nitrate) : undefined,
        notes: formData.notes || undefined,
      };

      await createWaterQualityMutation.mutateAsync(payload);

      toast({
        title: 'Success',
        description: 'Water quality record created successfully',
      });

      // Reset form
      setFormData({
        pondId: '',
        date: new Date().toISOString().split('T')[0],
        temperature: '',
        ph: '',
        dissolvedOxygen: '',
        ammonia: '',
        nitrite: '',
        nitrate: '',
        notes: '',
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create water quality record',
        variant: 'destructive',
      });
    }
  };

  const ponds = pondsResponse?.data || [];

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Record Water Quality</DialogTitle>
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
            <Label htmlFor="date">Test Date *</Label>
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
            <Label htmlFor="temperature">Temperature (°C) *</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              placeholder="e.g., 28.5"
              value={formData.temperature}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ph">pH Level *</Label>
            <Input
              id="ph"
              type="number"
              step="0.1"
              min="0"
              max="14"
              placeholder="e.g., 7.2"
              value={formData.ph}
              onChange={(e) => handleInputChange('ph', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dissolvedOxygen">Dissolved Oxygen (mg/L) *</Label>
          <Input
            id="dissolvedOxygen"
            type="number"
            step="0.1"
            min="0"
            placeholder="e.g., 6.5"
            value={formData.dissolvedOxygen}
            onChange={(e) => handleInputChange('dissolvedOxygen', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ammonia">Ammonia (mg/L)</Label>
            <Input
              id="ammonia"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 0.25"
              value={formData.ammonia}
              onChange={(e) => handleInputChange('ammonia', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nitrite">Nitrite (mg/L)</Label>
            <Input
              id="nitrite"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 0.1"
              value={formData.nitrite}
              onChange={(e) => handleInputChange('nitrite', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nitrate">Nitrate (mg/L)</Label>
            <Input
              id="nitrate"
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g., 5.0"
              value={formData.nitrate}
              onChange={(e) => handleInputChange('nitrate', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional observations about water quality, weather conditions, etc..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="submit"
            className="farm-button-primary"
            disabled={createWaterQualityMutation.isPending || pondsLoading}
          >
            {createWaterQualityMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              'Record Water Quality'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
