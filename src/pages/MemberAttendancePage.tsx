import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, XCircle } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function MemberAttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      findMemberId();
    }
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (memberId) {
      fetchAttendance();
    }
  }, [memberId]);

  const findMemberId = async () => {
    console.log("MemberAttendancePage: Finding member ID for user:", user?.email);
    
    // First try to find member by email
    const { data: emailData, error: emailError } = await supabase
      .from("members")
      .select("id")
      .eq("email", user?.email)
      .single();
    
    console.log("MemberAttendancePage: Member by email:", emailData, "Error:", emailError);
    
    if (emailData) {
      console.log("MemberAttendancePage: Found member by email, ID:", emailData.id);
      setMemberId(emailData.id);
      return;
    }
    
    // If not found by email, try by auth ID
    const { data: idData, error: idError } = await supabase
      .from("members")
      .select("id")
      .eq("id", user?.id)
      .single();
    
    console.log("MemberAttendancePage: Member by auth ID:", idData, "Error:", idError);
    
    if (idData) {
      console.log("MemberAttendancePage: Found member by auth ID:", idData.id);
      setMemberId(idData.id);
      return;
    }
    
    console.log("MemberAttendancePage: Could not find member ID, using auth ID as fallback");
    setMemberId(user?.id || null);
  };

  const fetchAttendance = async () => {
    setLoading(true);
    console.log("MemberAttendancePage: Fetching attendance for member ID:", memberId);
    
    if (!memberId) {
      console.error("MemberAttendancePage: No member ID available");
      setLoading(false);
      return;
    }
    
    const { data, error } = await supabase
      .from("attendance")
      .select(`
        *,
        events (id, title, event_type)
      `)
      .eq("member_id", memberId)
      .order("attendance_date", { ascending: true });
    
    console.log("MemberAttendancePage: Attendance data:", data, "Error:", error);
    
    if (error) {
      console.error("MemberAttendancePage: Error fetching attendance:", error);
    } else if (!data || data.length === 0) {
      console.log("MemberAttendancePage: No attendance records found for this member");
    }
    
    setAttendance(data || []);
    setLoading(false);
  };

  // Prepare chart data: count of presents per month with event details
  const chartData = (() => {
    const byMonth: Record<string, any> = {};
    
    // First pass: count presents per month
    attendance.forEach((a) => {
      if (!a.present) return;
      const month = new Date(a.attendance_date).toLocaleDateString("en-US", { year: "numeric", month: "short" });
      
      if (!byMonth[month]) {
        byMonth[month] = { count: 0, events: [] };
      }
      
      byMonth[month].count += 1;
      
      // Add event to the month's events list if it exists
      if (a.events && a.events.title) {
        const eventDate = new Date(a.attendance_date).toLocaleDateString();
        byMonth[month].events.push({
          date: eventDate,
          title: a.events.title,
          type: a.events.event_type || 'General'
        });
      }
    });
    
    // Convert to array format for chart
    return Object.entries(byMonth).map(([month, data]) => ({ 
      month, 
      count: data.count,
      events: data.events
    }));
  })();

  return (
    <div className="py-8 px-4 md:px-12 lg:px-32 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : attendance.length === 0 ? (
            <div className="text-muted-foreground">No attendance records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Event</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id} className="border-b last:border-0">
                      <td className="p-2">{new Date(record.attendance_date).toLocaleDateString()}</td>
                      <td className="p-2">
                        {record.events ? (
                          <Badge variant="outline" className="font-normal">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            {record.events.title || "Unknown Event"}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-2">
                        {record.present ? (
                          <Badge variant="default"><CheckCircle className="inline h-4 w-4 mr-1 text-green-600" />Present</Badge>
                        ) : (
                          <Badge variant="destructive"><XCircle className="inline h-4 w-4 mr-1 text-red-600" />Absent</Badge>
                        )}
                      </td>
                      <td className="p-2">{record.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 border rounded-md shadow-sm">
                          <p className="font-medium">{data.month}: {data.count} attendances</p>
                          {data.events && data.events.length > 0 ? (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Events attended:</p>
                              <ul className="text-xs mt-1 space-y-1">
                                {data.events.map((event: any, i: number) => (
                                  <li key={i}>{event.date}: {event.title}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}