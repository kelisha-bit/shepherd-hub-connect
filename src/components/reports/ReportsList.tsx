import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, DollarSign, Calendar, TrendingUp, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ReportsList() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalDonations: 0,
    totalEvents: 0,
    totalVisitors: 0,
  });
  const [membershipData, setMembershipData] = useState<any[]>([]);
  const [donationData, setDonationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      // Fetch basic stats
      const [membersRes, donationsRes, eventsRes, visitorsRes] = await Promise.all([
        supabase.from("members").select("*", { count: "exact" }),
        supabase.from("donations").select("amount"),
        supabase.from("events").select("*", { count: "exact" }),
        supabase.from("visitors").select("*", { count: "exact" }),
      ]);

      setStats({
        totalMembers: membersRes.count || 0,
        totalDonations: donationsRes.data?.reduce((sum, d) => sum + Number(d.amount), 0) || 0,
        totalEvents: eventsRes.count || 0,
        totalVisitors: visitorsRes.count || 0,
      });

      // Fetch membership type distribution
      const { data: membershipTypes } = await supabase
        .from("members")
        .select("membership_type");

      const membershipCounts = membershipTypes?.reduce((acc: any, member) => {
        const type = member.membership_type || "unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const membershipChartData = Object.entries(membershipCounts || {}).map(([type, count]) => ({
        name: type.replace("_", " ").toUpperCase(),
        value: count,
      }));

      setMembershipData(membershipChartData);

      // Fetch monthly donations
      const { data: donations } = await supabase
        .from("donations")
        .select("amount, donation_date")
        .order("donation_date");

      const monthlyDonations = donations?.reduce((acc: any, donation) => {
        const month = new Date(donation.donation_date).toLocaleDateString("en-US", { 
          year: "numeric", 
          month: "short" 
        });
        acc[month] = (acc[month] || 0) + Number(donation.amount);
        return acc;
      }, {});

      const donationChartData = Object.entries(monthlyDonations || {}).map(([month, amount]) => ({
        month,
        amount: Number(amount),
      }));

      setDonationData(donationChartData);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reports data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return <div className="p-6">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Reports
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalDonations.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitors</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVisitors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={donationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Membership Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={membershipData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {membershipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Reports */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Member Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Track how your church membership is growing over time
            </p>
            <Button variant="outline" className="w-full">
              View Full Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Detailed breakdown of donations and financial trends
            </p>
            <Button variant="outline" className="w-full">
              View Full Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Event Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Attendance trends and event performance metrics
            </p>
            <Button variant="outline" className="w-full">
              View Full Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}