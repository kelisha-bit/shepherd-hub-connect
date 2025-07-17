import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, Users, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AttendanceRecord {
  id: string;
  attendance_date: string;
  present: boolean;
  notes?: string;
  member_id: string;
  event_id: string;
  members?: {
    first_name: string;
    last_name: string;
  };
  events?: {
    title: string;
    event_type: string;
  };
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  event_type: string;
}

export function AttendanceList() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendance();
    fetchEvents();
  }, []);

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          *,
          members (first_name, last_name),
          events (title, event_type)
        `)
        .order("attendance_date", { ascending: false });

      if (error) throw error;
      setAttendance(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch attendance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const filteredAttendance = attendance.filter((record) => {
    const memberName = record.members 
      ? `${record.members.first_name} ${record.members.last_name}`
      : "";
    const matchesSearch = memberName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = selectedEventId === "all" || record.event_id === selectedEventId;
    
    return matchesSearch && matchesEvent;
  });

  const presentCount = filteredAttendance.filter(record => record.present).length;
  const absentCount = filteredAttendance.filter(record => !record.present).length;

  if (loading) {
    return <div className="p-6">Loading attendance...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Record Attendance
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredAttendance.map((record) => (
          <Card key={record.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {record.members 
                    ? `${record.members.first_name} ${record.members.last_name}`
                    : "Unknown Member"
                  }
                </CardTitle>
                <Badge variant={record.present ? "default" : "destructive"}>
                  {record.present ? "Present" : "Absent"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {record.events?.event_type || "Unknown Event Type"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(record.attendance_date).toLocaleDateString()}</span>
              </div>
              
              <div className="text-sm">
                <span className="font-medium">Event: </span>
                {record.events?.title || "Unknown Event"}
              </div>
              
              {record.notes && (
                <div className="text-sm bg-muted p-2 rounded">
                  {record.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAttendance.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No attendance records found</p>
        </div>
      )}
    </div>
  );
}