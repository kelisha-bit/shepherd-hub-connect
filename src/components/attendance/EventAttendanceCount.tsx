import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, Users, Calendar, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Event {
  id: string;
  title: string;
  event_date: string;
  event_type: string;
}

interface AttendanceCount {
  id: string;
  event_id: string;
  attendance_date: string;
  total_count: number;
  members_count: number;
  visitors_count: number;
  adults_count: number;
  children_count: number;
  notes: string;
  recorded_by: string;
  created_at: string;
  updated_at: string;
  events?: {
    title: string;
    event_type: string;
  };
}

interface AttendanceCountForm {
  event_id: string;
  attendance_date: string;
  total_count: number;
  members_count: number;
  visitors_count: number;
  adults_count: number;
  children_count: number;
  notes: string;
}

export function EventAttendanceCount() {
  const [events, setEvents] = useState<Event[]>([]);
  const [attendanceCounts, setAttendanceCounts] = useState<AttendanceCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState<AttendanceCountForm>({
    event_id: "",
    attendance_date: new Date().toISOString().split('T')[0],
    total_count: 0,
    members_count: 0,
    visitors_count: 0,
    adults_count: 0,
    children_count: 0,
    notes: ""
  });

  useEffect(() => {
    fetchEvents();
    fetchAttendanceCounts();
  }, []);

  // Auto-calculate total when breakdown numbers change
  useEffect(() => {
    const calculatedTotal = form.members_count + form.visitors_count;
    if (calculatedTotal !== form.total_count) {
      setForm(prev => ({ ...prev, total_count: calculatedTotal }));
    }
  }, [form.members_count, form.visitors_count]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, event_date, event_type")
        .order("event_date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    }
  };

  const fetchAttendanceCounts = async () => {
    try {
      const { data, error } = await supabase
        .from("event_attendance_counts")
        .select(`
          *,
          events (title, event_type)
        `)
        .order("attendance_date", { ascending: false });

      if (error) throw error;
      setAttendanceCounts(data || []);
    } catch (error) {
      console.error("Failed to fetch attendance counts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance counts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.event_id) {
      toast({
        title: "Error",
        description: "Please select an event",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const attendanceData = {
        ...form,
        recorded_by: userData.user?.id,
      };

      let error;
      if (editingId) {
        ({ error } = await supabase
          .from("event_attendance_counts")
          .update(attendanceData)
          .eq("id", editingId));
      } else {
        ({ error } = await supabase
          .from("event_attendance_counts")
          .insert([attendanceData]));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: editingId ? "Attendance count updated successfully" : "Attendance count recorded successfully",
      });

      // Reset form
      setForm({
        event_id: "",
        attendance_date: new Date().toISOString().split('T')[0],
        total_count: 0,
        members_count: 0,
        visitors_count: 0,
        adults_count: 0,
        children_count: 0,
        notes: ""
      });
      setEditingId(null);
      fetchAttendanceCounts();
    } catch (error) {
      console.error("Error saving attendance count:", error);
      toast({
        title: "Error",
        description: "Failed to save attendance count",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record: AttendanceCount) => {
    setForm({
      event_id: record.event_id,
      attendance_date: record.attendance_date,
      total_count: record.total_count,
      members_count: record.members_count,
      visitors_count: record.visitors_count,
      adults_count: record.adults_count,
      children_count: record.children_count,
      notes: record.notes || ""
    });
    setEditingId(record.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attendance count?")) return;

    try {
      const { error } = await supabase
        .from("event_attendance_counts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendance count deleted successfully",
      });
      fetchAttendanceCounts();
    } catch (error) {
      console.error("Error deleting attendance count:", error);
      toast({
        title: "Error",
        description: "Failed to delete attendance count",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setForm({
      event_id: "",
      attendance_date: new Date().toISOString().split('T')[0],
      total_count: 0,
      members_count: 0,
      visitors_count: 0,
      adults_count: 0,
      children_count: 0,
      notes: ""
    });
    setEditingId(null);
  };

  if (loading) {
    return <div className="p-6">Loading attendance counts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Event Attendance Count</h1>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editingId ? "Edit Attendance Count" : "Record Attendance Count"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Select value={form.event_id} onValueChange={(value) => setForm(prev => ({ ...prev, event_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title} - {new Date(event.event_date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendance_date">Date</Label>
                <Input
                  id="attendance_date"
                  type="date"
                  value={form.attendance_date}
                  onChange={(e) => setForm(prev => ({ ...prev, attendance_date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="members_count">Members</Label>
                <Input
                  id="members_count"
                  type="number"
                  min="0"
                  value={form.members_count}
                  onChange={(e) => setForm(prev => ({ ...prev, members_count: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitors_count">Visitors</Label>
                <Input
                  id="visitors_count"
                  type="number"
                  min="0"
                  value={form.visitors_count}
                  onChange={(e) => setForm(prev => ({ ...prev, visitors_count: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adults_count">Adults</Label>
                <Input
                  id="adults_count"
                  type="number"
                  min="0"
                  value={form.adults_count}
                  onChange={(e) => setForm(prev => ({ ...prev, adults_count: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="children_count">Children</Label>
                <Input
                  id="children_count"
                  type="number"
                  min="0"
                  value={form.children_count}
                  onChange={(e) => setForm(prev => ({ ...prev, children_count: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_count">Total Count</Label>
              <Input
                id="total_count"
                type="number"
                min="0"
                value={form.total_count}
                onChange={(e) => setForm(prev => ({ ...prev, total_count: parseInt(e.target.value) || 0 }))}
                className="font-bold text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Auto-calculated from Members + Visitors: {form.members_count + form.visitors_count}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes about the attendance..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : editingId ? "Update Count" : "Record Count"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Attendance Counts List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Attendance Counts</h2>
        {attendanceCounts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No attendance counts recorded yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {attendanceCounts.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {record.events?.title || "Unknown Event"}
                      </CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">
                          {record.events?.event_type || "Unknown Type"}
                        </Badge>
                        <Badge variant="secondary">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(record.attendance_date).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(record)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(record.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{record.total_count}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-blue-600">{record.members_count}</div>
                      <div className="text-sm text-muted-foreground">Members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-green-600">{record.visitors_count}</div>
                      <div className="text-sm text-muted-foreground">Visitors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-purple-600">{record.adults_count}</div>
                      <div className="text-sm text-muted-foreground">Adults</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-orange-600">{record.children_count}</div>
                      <div className="text-sm text-muted-foreground">Children</div>
                    </div>
                  </div>
                  {record.notes && (
                    <div className="text-sm bg-muted p-3 rounded">
                      <strong>Notes:</strong> {record.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
