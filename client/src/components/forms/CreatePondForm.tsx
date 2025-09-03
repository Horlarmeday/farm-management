import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreatePondFormProps {
  onSuccess?: () => void;
}

export default function CreatePondForm({ onSuccess }: CreatePondFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    type: "",
    size: "",
    depth: "",
    waterSource: "",
    fishSpecies: "",
    stockingDate: "",
    expectedHarvestDate: "",
    notes: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Pond created successfully",
      });
      
      // Reset form
      setFormData({
        name: "",
        location: "",
        type: "",
        size: "",
        depth: "",
        waterSource: "",
        fishSpecies: "",
        stockingDate: "",
        expectedHarvestDate: "",
        notes: "",
      });
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create pond",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            <Label htmlFor="name">Pond Name</Label>
            <Input
              id="name"
              placeholder="e.g., Pond A1"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., North Field"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Pond Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select pond type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="earthen">Earthen Pond</SelectItem>
                <SelectItem value="concrete">Concrete Pond</SelectItem>
                <SelectItem value="plastic">Plastic Liner</SelectItem>
                <SelectItem value="fiberglass">Fiberglass Tank</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="size">Size (sq. meters)</Label>
            <Input
              id="size"
              type="number"
              placeholder="e.g., 100"
              value={formData.size}
              onChange={(e) => handleInputChange("size", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="depth">Depth (meters)</Label>
            <Input
              id="depth"
              type="number"
              step="0.1"
              placeholder="e.g., 1.5"
              value={formData.depth}
              onChange={(e) => handleInputChange("depth", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="waterSource">Water Source</Label>
            <Select value={formData.waterSource} onValueChange={(value) => handleInputChange("waterSource", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select water source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="borehole">Borehole</SelectItem>
                <SelectItem value="river">River</SelectItem>
                <SelectItem value="rainwater">Rainwater</SelectItem>
                <SelectItem value="tap">Tap Water</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fishSpecies">Fish Species</Label>
            <Input
              id="fishSpecies"
              placeholder="e.g., Tilapia"
              value={formData.fishSpecies}
              onChange={(e) => handleInputChange("fishSpecies", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stockingDate">Stocking Date</Label>
            <Input
              id="stockingDate"
              type="date"
              value={formData.stockingDate}
              onChange={(e) => handleInputChange("stockingDate", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedHarvestDate">Expected Harvest Date</Label>
          <Input
            id="expectedHarvestDate"
            type="date"
            value={formData.expectedHarvestDate}
            onChange={(e) => handleInputChange("expectedHarvestDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional information about the pond..."
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="submit" className="farm-button-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Pond"
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}