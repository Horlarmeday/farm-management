import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useApproveLeave } from '@/hooks/useUsers';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ApproveLeaveFormProps {
  leaveId: string;
  onSuccess?: () => void;
}

export default function ApproveLeaveForm({ leaveId, onSuccess }: ApproveLeaveFormProps) {
  const { toast } = useToast();
  const approveLeave = useApproveLeave();
  const [formData, setFormData] = useState<{ status: 'APPROVED' | 'REJECTED' | ''; comments: string }>({ status: '', comments: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.status) {
      toast({ title: 'Error', description: 'Select a status', variant: 'destructive' });
      return;
    }
    try {
      await approveLeave.mutateAsync({ id: leaveId, status: formData.status, comments: formData.comments || undefined });
      onSuccess?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update leave status', variant: 'destructive' });
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Approve/Reject Leave</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Status *</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData((p) => ({ ...p, status: v as 'APPROVED' | 'REJECTED' }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="APPROVED">Approve</SelectItem>
              <SelectItem value="REJECTED">Reject</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comments">Comments</Label>
          <Textarea id="comments" value={formData.comments} onChange={(e) => setFormData((p) => ({ ...p, comments: e.target.value }))} rows={3} />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <Button type="submit" className="farm-button-primary" disabled={approveLeave.isPending}>
            {approveLeave.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}


