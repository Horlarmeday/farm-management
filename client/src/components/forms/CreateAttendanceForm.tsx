import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCreateAttendance, useUsers } from '@/hooks/useUsers';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface CreateAttendanceFormProps {
  onSuccess?: () => void;
}

export default function CreateAttendanceForm({ onSuccess }: CreateAttendanceFormProps) {
  const { toast } = useToast();
  const createAttendance = useCreateAttendance();
  const { data: usersResponse, isLoading: usersLoading } = useUsers({ limit: 100 });

  const users = useMemo(() => usersResponse?.data?.items || usersResponse?.data || [], [usersResponse]);

  const [formData, setFormData] = useState({
    userId: '',
    date: '',
    checkIn: '',
    checkOut: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    const today = new Date();
    const yyyyMmDd = today.toISOString().split('T')[0];
    const hhmm = today.toISOString().slice(11, 16);
    setFormData((prev) => ({ ...prev, date: yyyyMmDd, checkIn: `${yyyyMmDd}T${hhmm}` }));
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.date || !formData.checkIn) {
      toast({ title: 'Error', description: 'User, date and check-in are required', variant: 'destructive' });
      return;
    }

    try {
      await createAttendance.mutateAsync({
        userId: formData.userId,
        date: new Date(formData.date),
        checkIn: new Date(formData.checkIn),
        checkOut: formData.checkOut ? new Date(formData.checkOut) : undefined,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      });

      setFormData({ userId: '', date: '', checkIn: '', checkOut: '', location: '', notes: '' });
      onSuccess?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to record attendance', variant: 'destructive' });
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Record Attendance</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>User *</Label>
            <Select value={formData.userId} onValueChange={(v) => handleInputChange('userId', v)} disabled={usersLoading}>
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
            <Label htmlFor="date">Date *</Label>
            <Input id="date" type="date" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="checkIn">Check-in *</Label>
            <Input id="checkIn" type="datetime-local" value={formData.checkIn} onChange={(e) => handleInputChange('checkIn', e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkOut">Check-out</Label>
            <Input id="checkOut" type="datetime-local" value={formData.checkOut} onChange={(e) => handleInputChange('checkOut', e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} rows={3} />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="submit" className="farm-button-primary" disabled={createAttendance.isPending || usersLoading}>
            {createAttendance.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Record Attendance'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}


