import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { useCurrentFarmId } from '@/contexts/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { useCreateAsset } from '@/hooks/useAssets';
import { getAssetCategoryOptions, getAssetConditionOptions } from '@/lib/formUtils';
import { AssetCondition, AssetStatus, AssetType } from '@/types/asset.types';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface CreateAssetFormProps {
  onSuccess?: () => void;
}

export default function CreateAssetForm({ onSuccess }: CreateAssetFormProps) {
  const { toast } = useToast();
  const createAssetMutation = useCreateAsset();
  const farmId = useCurrentFarmId();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    type: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    currentValue: '',
    location: '',
    condition: '',
    notes: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if farmId is available
    if (!farmId) {
      toast({
        title: 'Error',
        description: 'Please select a farm first',
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields
    if (
      !formData.name ||
      !formData.type ||
      !formData.condition ||
      !formData.purchaseDate ||
      !formData.purchasePrice ||
      !formData.currentValue ||
      !formData.location
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Validate numeric fields are positive
    const purchasePrice = parseFloat(formData.purchasePrice);
    const currentValue = parseFloat(formData.currentValue);

    if (isNaN(purchasePrice) || purchasePrice <= 0) {
      toast({
        title: 'Error',
        description: 'Purchase price must be a positive number',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(currentValue) || currentValue < 0) {
      toast({
        title: 'Error',
        description: 'Current value must be a non-negative number',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createAssetMutation.mutateAsync({
        farmId: farmId,
        name: formData.name,
        type: formData.type as AssetType,
        category: formData.category || undefined,
        description: formData.notes || undefined,
        serialNumber: formData.serialNumber || undefined,
        model: formData.model || undefined,
        manufacturer: formData.brand || undefined,
        purchaseDate: new Date(formData.purchaseDate),
        purchasePrice: purchasePrice,
        condition: formData.condition as AssetCondition,
        status: AssetStatus.ACTIVE,
        location: formData.location,
        notes: formData.notes || undefined,
      });

      toast({
        title: 'Success',
        description: 'Asset created successfully',
      });

      // Reset form
      setFormData({
        name: '',
        category: '',
        type: '',
        brand: '',
        model: '',
        serialNumber: '',
        purchaseDate: '',
        purchasePrice: '',
        currentValue: '',
        location: '',
        condition: '',
        notes: '',
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create asset',
        variant: 'destructive',
      });
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add New Asset</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Asset Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Tractor John Deere"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {getAssetCategoryOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">
              Asset Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AssetType.VEHICLE}>Vehicle</SelectItem>
                <SelectItem value={AssetType.MACHINERY}>Machinery</SelectItem>
                <SelectItem value={AssetType.EQUIPMENT}>Equipment</SelectItem>
                <SelectItem value={AssetType.TOOLS}>Tools</SelectItem>
                <SelectItem value={AssetType.FURNITURE}>Furniture</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand/Manufacturer</Label>
            <Input
              id="brand"
              placeholder="e.g., John Deere"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              placeholder="e.g., 5055E"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input
              id="serialNumber"
              placeholder="e.g., JD123456789"
              value={formData.serialNumber}
              onChange={(e) => handleInputChange('serialNumber', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchaseDate">
              Purchase Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchasePrice">
              Purchase Price (₦) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="purchasePrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 45000"
              value={formData.purchasePrice}
              onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentValue">
              Current Value (₦) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="currentValue"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 35000"
              value={formData.currentValue}
              onChange={(e) => handleInputChange('currentValue', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              placeholder="e.g., Main Barn"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition">
            Condition <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.condition}
            onValueChange={(value) => handleInputChange('condition', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {getAssetConditionOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional information about the asset..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="submit"
            className="farm-button-primary"
            disabled={createAssetMutation.isPending || !farmId}
          >
            {createAssetMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Asset'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
