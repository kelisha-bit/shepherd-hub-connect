import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { addAttendance, updateAttendance, AttendanceRow } from "@/integrations/supabase/attendance";
import { useToast } from "@/hooks/use-toast";

interface AttendanceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  initialData?: AttendanceRow | null;
  members: { id: string; name: string; group?: string }[];
  events: { id: string; title: string; event_type: string }[];
}

export function AttendanceModal({ open, onClose, onSubmit, initialData, members, events }: AttendanceModalProps) {
  const [memberId, setMemberId] = useState(initialData?.member_id || "");
  const [eventId, setEventId] = useState(initialData?.event_id || "");
  const [date, setDate] = useState(initialData?.attendance_date || "");
  const [present, setPresent] = useState(initialData?.present ?? true);
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setMemberId(initialData.member_id);
      setEventId(initialData.event_id);
      setDate(initialData.attendance_date);
      setPresent(initialData.present ?? true);
      setNotes(initialData.notes || "");
    } else {
      setMemberId("");
      setEventId("");
      setDate("");
      setPresent(true);
      setNotes("");
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!memberId || !eventId || !date) {
        toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
        setLoading(false);
        return;
      }
      if (initialData) {
        await updateAttendance(initialData.id, {
          member_id: memberId,
          event_id: eventId,
          attendance_date: date,
          present,
          notes,
        });
      } else {
        await addAttendance({
          member_id: memberId,
          event_id: eventId,
          attendance_date: date,
          present,
          notes,
        });
      }
      toast({ title: "Success", description: `Attendance ${initialData ? "updated" : "recorded"} successfully.` });
      onSubmit();
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save attendance.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Attendance" : "Record Attendance"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Member</label>
            <Select value={memberId} onValueChange={setMemberId} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name} {m.group ? `(${m.group})` : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Event</label>
            <Select value={eventId} onValueChange={setEventId} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.title} ({e.event_type})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={present} onCheckedChange={v => setPresent(!!v)} id="present" />
            <label htmlFor="present" className="text-sm">Present</label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{initialData ? "Update" : "Record"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 