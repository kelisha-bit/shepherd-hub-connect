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

  useEffect(() => {
    if (user) fetchAttendance();
    // eslint-disable-next-line
  }, [user]);

  const fetchAttendance = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("member_id", user?.id)
      .order("attendance_date", { ascending: true });
    setAttendance(data || []);
    setLoading(false);
  };

  // Prepare chart data: count of presents per month
  const chartData = (() => {
    const byMonth: Record<string, number> = {};
    attendance.forEach((a) => {
      if (!a.present) return;
      const month = new Date(a.attendance_date).toLocaleDateString("en-US", { year: "numeric", month: "short" });
      byMonth[month] = (byMonth[month] || 0) + 1;
    });
    return Object.entries(byMonth).map(([month, count]) => ({ month, count }));
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
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id} className="border-b last:border-0">
                      <td className="p-2">{new Date(record.attendance_date).toLocaleDateString()}</td>
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
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 