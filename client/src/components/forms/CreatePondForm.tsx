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
import { useCreatePond } from '@/hooks/useFishery';
import { getPondTypeOptions } from '@/lib/formUtils';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface CreatePondFormProps {
  onSuccess?: () => void;
}

export default function CreatePondForm({ onSuccess }: CreatePondFormProps) {
  const { toast } = useToast();
  const createPondMutation = useCreatePond();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    pondType: '',
    sizeM2: '',
    maxDepthM: '',
    avgDepthM: '',
    notes: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.name ||
      !formData.location ||
      !formData.pondType ||
      !formData.sizeM2 ||
      !formData.maxDepthM ||
      !formData.avgDepthM
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Validate numeric fields are positive
    const sizeM2 = parseFloat(formData.sizeM2);
    const maxDepthM = parseFloat(formData.maxDepthM);
    const avgDepthM = parseFloat(formData.avgDepthM);

    if (isNaN(sizeM2) || sizeM2 <= 0) {
      toast({
        title: 'Error',
        description: 'Size must be a positive number',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(maxDepthM) || maxDepthM <= 0) {
      toast({
        title: 'Error',
        description: 'Maximum depth must be a positive number',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(avgDepthM) || avgDepthM <= 0) {
      toast({
        title: 'Error',
        description: 'Average depth must be a positive number',
        variant: 'destructive',
      });
      return;
    }

    // Validate average depth is not greater than max depth
    if (avgDepthM > maxDepthM) {
      toast({
        title: 'Error',
        description: 'Average depth cannot be greater than maximum depth',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Send data in the format the server expects
      await createPondMutation.mutateAsync({
        name: formData.name,
        location: formData.location,
        pondType: formData.pondType,
        sizeM2: sizeM2,
        maxDepthM: maxDepthM,
        avgDepthM: avgDepthM,
        notes: formData.notes || undefined,
      } as any);

      toast({
        title: 'Success',
        description: 'Pond created successfully',
      });

      // Reset form
      setFormData({
        name: '',
        location: '',
        pondType: '',
        sizeM2: '',
        maxDepthM: '',
        avgDepthM: '',
        notes: '',
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create pond',
        variant: 'destructive',
      });
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Pond</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Pond Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Pond A1"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              placeholder="e.g., North Section, Block B"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pondType">
              Pond Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.pondType}
              onValueChange={(value) => handleInputChange('pondType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pond type" />
              </SelectTrigger>
              <SelectContent>
                {getPondTypeOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sizeM2">
              Size (m²) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sizeM2"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 100.0"
              value={formData.sizeM2}
              onChange={(e) => handleInputChange('sizeM2', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxDepthM">
              Maximum Depth (meters) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="maxDepthM"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 2.5"
              value={formData.maxDepthM}
              onChange={(e) => handleInputChange('maxDepthM', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avgDepthM">
              Average Depth (meters) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="avgDepthM"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 1.8"
              value={formData.avgDepthM}
              onChange={(e) => handleInputChange('avgDepthM', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional information about the pond..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="submit"
            className="farm-button-primary"
            disabled={createPondMutation.isPending}
          >
            {createPondMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Pond'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
