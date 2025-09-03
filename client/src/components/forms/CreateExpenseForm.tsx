import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreateExpenseFormProps {
  onSuccess?: () => void;
}

export default function CreateExpenseForm({ onSuccess }: CreateExpenseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    vendor: "",
    expenseDate: "",
    paymentMethod: "",
    reference: "",
    project: "",
    isRecurring: false,
    notes: "",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
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
        description: "Expense recorded successfully",
      });
      
      // Reset form
      setFormData({
        category: "",
        description: "",
        amount: "",
        vendor: "",
        expenseDate: "",
        paymentMethod: "",
        reference: "",
        project: "",
        isRecurring: false,
        notes: "",
      });
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record expense",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Record New Expense</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feed">Feed & Nutrition</SelectItem>
                <SelectItem value="veterinary">Veterinary Services</SelectItem>
                <SelectItem value="equipment">Equipment & Tools</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="labor">Labor & Wages</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="maintenance">Maintenance & Repairs</SelectItem>
                <SelectItem value="supplies">Supplies</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="taxes">Taxes & Fees</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="e.g., 150.00"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="e.g., Weekly feed purchase for poultry"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor/Supplier</Label>
            <Input
              id="vendor"
              placeholder="e.g., Local Feed Store"
              value={formData.vendor}
              onChange={(e) => handleInputChange("vendor", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expenseDate">Expense Date</Label>
            <Input
              id="expenseDate"
              type="date"
              value={formData.expenseDate}
              onChange={(e) => handleInputChange("expenseDate", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange("paymentMethod", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number</Label>
            <Input
              id="reference"
              placeholder="e.g., INV-001, Receipt #123"
              value={formData.reference}
              onChange={(e) => handleInputChange("reference", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project">Project/Department</Label>
          <Select value={formData.project} onValueChange={(value) => handleInputChange("project", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select project/department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="poultry">Poultry</SelectItem>
              <SelectItem value="livestock">Livestock</SelectItem>
              <SelectItem value="fishery">Fishery</SelectItem>
              <SelectItem value="crops">Crops</SelectItem>
              <SelectItem value="general">General Farm</SelectItem>
              <SelectItem value="infrastructure">Infrastructure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isRecurring"
            checked={formData.isRecurring}
            onChange={(e) => handleInputChange("isRecurring", e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="isRecurring">This is a recurring expense</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional information about the expense..."
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
                Recording...
              </>
            ) : (
              "Record Expense"
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}