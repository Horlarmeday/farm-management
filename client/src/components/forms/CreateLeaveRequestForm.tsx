import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCreateLeaveRequestUsers, useUsers } from '@/hooks/useUsers';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface CreateLeaveRequestFormProps {
  onSuccess?: () => void;
}

const LEAVE_TYPES = ['ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER'] as const;

export default function CreateLeaveRequestForm({ onSuccess }: CreateLeaveRequestFormProps) {
  const { toast } = useToast();
  const createLeave = useCreateLeaveRequestUsers();
  const { data: usersResponse, isLoading: usersLoading } = useUsers({ limit: 100 });
  const users = useMemo(() => usersResponse?.data?.items || usersResponse?.data || [], [usersResponse]);

  const [formData, setFormData] = useState({
    userId: '',
    type: '' as '' | typeof LEAVE_TYPES[number],
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData((p) => ({ ...p, startDate: today, endDate: today }));
  }, []);

  const handleChange = (field: string, value: string) => setFormData((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.type || !formData.startDate || !formData.endDate || !formData.reason) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' });
      return;
    }
    try {
      await createLeave.mutateAsync({
        userId: formData.userId,
        type: formData.type,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        reason: formData.reason,
      });
      setFormData({ userId: '', type: '', startDate: '', endDate: '', reason: '' });
      onSuccess?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to submit leave request', variant: 'destructive' });
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Submit Leave Request</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>User *</Label>
            <Select value={formData.userId} onValueChange={(v) => handleChange('userId', v)} disabled={usersLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u: any) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Leave Type *</Label>
            <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => handleChange('startDate', e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date *</Label>
            <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => handleChange('endDate', e.target.value)} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason *</Label>
          <Textarea id="reason" value={formData.reason} onChange={(e) => handleChange('reason', e.target.value)} rows={3} />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="submit" className="farm-button-primary" disabled={createLeave.isPending || usersLoading}>
            {createLeave.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}


