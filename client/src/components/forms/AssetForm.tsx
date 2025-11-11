import { Button } from '@/components/ui/button';
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
import { useCreateAsset } from '@/hooks/useAssets';
import { AssetStatus, AssetType } from '@/types/asset.types';
import { useState } from 'react';

interface AssetFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AssetForm({ onSuccess, onCancel }: AssetFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: AssetType.EQUIPMENT,
    status: AssetStatus.ACTIVE,
    condition: 'good' as const,
    purchaseDate: new Date(),
    purchasePrice: 0,
    location: '',
    description: '',
    serialNumber: '',
    model: '',
  });

  const createAssetMutation = useCreateAsset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // farmId will be added by the server from farm context
      await createAssetMutation.mutateAsync(formData as any);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create asset:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Asset Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Asset Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Tractor, Generator, etc."
            required
          />
        </div>

        {/* Asset Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Asset Type *</Label>
          <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AssetType.EQUIPMENT}>Equipment</SelectItem>
              <SelectItem value={AssetType.MACHINERY}>Machinery</SelectItem>
              <SelectItem value={AssetType.VEHICLE}>Vehicle</SelectItem>
              <SelectItem value={AssetType.BUILDING}>Building</SelectItem>
              <SelectItem value={AssetType.LAND}>Land</SelectItem>
              <SelectItem value={AssetType.TOOLS}>Tools</SelectItem>
              <SelectItem value={AssetType.TECHNOLOGY}>Technology</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Serial Number */}
        <div className="space-y-2">
          <Label htmlFor="serialNumber">Serial Number</Label>
          <Input
            id="serialNumber"
            value={formData.serialNumber || ''}
            onChange={(e) => handleChange('serialNumber', e.target.value)}
            placeholder="Optional"
          />
        </div>

        {/* Model */}
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            value={formData.model || ''}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="Optional"
          />
        </div>

        {/* Purchase Date */}
        <div className="space-y-2">
          <Label htmlFor="purchaseDate">Purchase Date *</Label>
          <Input
            id="purchaseDate"
            type="date"
            value={
              formData.purchaseDate instanceof Date
                ? formData.purchaseDate.toISOString().split('T')[0]
                : formData.purchaseDate
            }
            onChange={(e) => handleChange('purchaseDate', new Date(e.target.value))}
            required
          />
        </div>

        {/* Purchase Price */}
        <div className="space-y-2">
          <Label htmlFor="purchasePrice">Purchase Price (₦) *</Label>
          <Input
            id="purchasePrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.purchasePrice}
            onChange={(e) => handleChange('purchasePrice', parseFloat(e.target.value) || 0)}
            required
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AssetStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={AssetStatus.INACTIVE}>Inactive</SelectItem>
              <SelectItem value={AssetStatus.MAINTENANCE}>Maintenance</SelectItem>
              <SelectItem value={AssetStatus.DISPOSED}>Disposed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="e.g., Main Farm, Building A, etc."
          />
        </div>

        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Additional details about this asset..."
            rows={3}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="farm-button-primary"
          disabled={createAssetMutation.isPending}
        >
          {createAssetMutation.isPending ? 'Creating...' : 'Create Asset'}
        </Button>
      </div>

      {/* Error Display */}
      {createAssetMutation.isError && (
        <div className="text-sm text-red-600 mt-2">Failed to create asset. Please try again.</div>
      )}
    </form>
  );
}
