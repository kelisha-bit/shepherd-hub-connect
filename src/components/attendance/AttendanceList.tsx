import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, Users, CheckCircle, XCircle, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AttendanceModal } from "./AttendanceModal";
import { useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

interface AttendanceRecord {
  id: string;
  attendance_date: string;
  present: boolean;
  notes: string;
  member_id: string;
  event_id: string;
  members?: {
    first_name: string;
    last_name: string;
    group?: string;
  };
  events?: {
    title: string;
    event_type: string;
  };
  created_at: string;
  updated_at: string;
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

  // Add state for modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null);
  const [members, setMembers] = useState<{ id: string; name: string; group?: string }[]>([]);

  // Add state for advanced filters
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  // Fetch members for modal
  const fetchMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from("members")
      .select("id, first_name, last_name, group");
    if (!error && data) {
      setMembers(
        data.map((m: any) => ({
          id: m.id,
          name: `${m.first_name} ${m.last_name}`,
          group: m.group || undefined,
        }))
      );
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
    fetchEvents();
    fetchMembers();
  }, []);

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          *,
          members (first_name, last_name, group),
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

  // Extract unique service types from events
  const serviceTypes = Array.from(new Set(events.map(e => e.event_type).filter(Boolean)));
  // Extract unique groups from members
  const groups = Array.from(new Set(members.map(m => m.group).filter(Boolean)));

  const filteredAttendance = attendance.filter((record) => {
    const memberName = record.members 
      ? `${record.members.first_name} ${record.members.last_name}`
      : "";
    const matchesSearch = memberName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = selectedEventId === "all" || record.event_id === selectedEventId;
    const matchesDate = !selectedDate || record.attendance_date === selectedDate;
    const matchesServiceType = selectedServiceType === "all" || record.events?.event_type === selectedServiceType;
    const matchesGroup = selectedGroup === "all" || (record.members && record.members.group === selectedGroup);
    return matchesSearch && matchesEvent && matchesDate && matchesServiceType && matchesGroup;
  });

  const presentCount = filteredAttendance.filter(record => record.present).length;
  const absentCount = filteredAttendance.filter(record => !record.present).length;

  const handleAdd = () => {
    setEditRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (record: AttendanceRecord) => {
    setEditRecord({
      ...record,
      created_at: record.created_at || "",
      updated_at: record.updated_at || "",
      notes: record.notes || "",
    });
    setModalOpen(true);
  };

  const handleModalSubmit = () => {
    fetchAttendance();
  };

  // --- Analytics Data Preparation ---
  // Total attendance per service type over time (monthly)
  const attendanceByServiceType: Record<string, Record<string, number>> = {};
  attendance.forEach((record) => {
    const month = new Date(record.attendance_date).toLocaleDateString("en-US", { year: "numeric", month: "short" });
    const type = record.events?.event_type || "Unknown";
    if (!attendanceByServiceType[type]) attendanceByServiceType[type] = {};
    attendanceByServiceType[type][month] = (attendanceByServiceType[type][month] || 0) + (record.present ? 1 : 0);
  });
  const months = Array.from(new Set(
    Object.values(attendanceByServiceType).flatMap(obj => Object.keys(obj))
  )).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const serviceTypeChartData = months.map(month => {
    const entry: any = { month };
    Object.keys(attendanceByServiceType).forEach(type => {
      entry[type] = attendanceByServiceType[type][month] || 0;
    });
    return entry;
  });

  // Individual member attendance trends (top 5 by attendance)
  const memberAttendance: Record<string, { name: string; data: Record<string, number> }> = {};
  attendance.forEach((record) => {
    if (!record.members) return;
    const name = `${record.members.first_name} ${record.members.last_name}`;
    const month = new Date(record.attendance_date).toLocaleDateString("en-US", { year: "numeric", month: "short" });
    if (!memberAttendance[record.member_id]) memberAttendance[record.member_id] = { name, data: {} };
    memberAttendance[record.member_id].data[month] = (memberAttendance[record.member_id].data[month] || 0) + (record.present ? 1 : 0);
  });
  const topMembers = Object.entries(memberAttendance)
    .sort((a, b) => Object.values(b[1].data).reduce((s, v) => s + v, 0) - Object.values(a[1].data).reduce((s, v) => s + v, 0))
    .slice(0, 5);
  const memberMonths = Array.from(new Set(
    topMembers.flatMap(([_, m]) => Object.keys(m.data))
  )).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const memberTrendChartData = memberMonths.map(month => {
    const entry: any = { month };
    topMembers.forEach(([_, m]) => {
      entry[m.name] = m.data[month] || 0;
    });
    return entry;
  });

  // Group-based attendance breakdown (pie chart)
  const groupAttendance: Record<string, number> = {};
  attendance.forEach((record) => {
    const group = record.members?.group || "Unknown";
    if (record.present) groupAttendance[group] = (groupAttendance[group] || 0) + 1;
  });
  const groupPieData = Object.entries(groupAttendance).map(([group, value]) => ({ name: group, value }));
  const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6699", "#A28CFF", "#FFB6B6"];

  if (loading) {
    return <div className="p-6">Loading attendance...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Analytics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <>
          {/* Service Type Attendance Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance by Service Type (Monthly)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={serviceTypeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  {Object.keys(attendanceByServiceType).map((type, idx) => (
                    <Bar key={type} dataKey={type} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {/* Member Attendance Trends Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top Member Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={memberTrendChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  {topMembers.map(([_, m], idx) => (
                    <Line key={m.name} type="monotone" dataKey={m.name} stroke={PIE_COLORS[idx % PIE_COLORS.length]} strokeWidth={2} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {/* Group Attendance Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Group Attendance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={groupPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {groupPieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      </div>
      <AttendanceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editRecord}
        members={members}
        events={events}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <Button onClick={handleAdd}>
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

      <div className="flex items-center space-x-4 flex-wrap gap-y-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="w-40"
          placeholder="Filter by date"
        />
        <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by service type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Service Types</SelectItem>
            {serviceTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {groups.map(group => (
              <SelectItem key={group} value={group}>{group}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                <div className="flex gap-2 items-center">
                  <Badge variant={record.present ? "default" : "destructive"}>
                    {record.present ? "Present" : "Absent"}
                  </Badge>
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(record)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
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