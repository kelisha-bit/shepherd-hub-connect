import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSign, CheckCircle, Activity, Users, Calendar, Mail, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function MemberProfile() {
  const params = useParams();
  const id = params.id;
  const [member, setMember] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const attendancePercent = attendance.length > 0 ? Math.round(100 * attendance.filter(a => a.present).length / attendance.length) : 0;
  const activitiesCount = activities.length;

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      setLoading(true);
      // Fetch member info
      const { data: memberData } = await supabase.from("members").select("*").eq("id", id).single();
      setMember(memberData);
      // Fetch donations
      const { data: donationData } = await supabase.from("donations").select("*").eq("member_id", id);
      setDonations(donationData || []);
      // Fetch attendance
      const { data: attendanceData } = await supabase.from("attendance").select("*").eq("member_id", id);
      setAttendance(attendanceData || []);
      // Fetch activities (placeholder: use events attended)
      const { data: activityData } = await supabase.from("events").select("*").contains("attendees", [id]);
      setActivities(activityData || []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!member) return <div className="min-h-screen flex items-center justify-center">Member not found</div>;

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-12 lg:px-32">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <Avatar className="h-28 w-28 shadow-lg">
          <AvatarImage src={member.profile_image_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">
            {`${member.first_name?.[0] || ""}${member.last_name?.[0] || ""}`.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-foreground">{member.first_name} {member.last_name}</h1>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
            <Badge>{member.membership_status || "Unknown"}</Badge>
            {member.ministry && <Badge variant="outline">{member.ministry.replace(/_/g, " ")}</Badge>}
            {member.role && <Badge variant="secondary">{member.role}</Badge>}
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-muted-foreground text-sm justify-center md:justify-start">
            <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{member.email || <span className="italic">No email</span>}</span>
            <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{member.phone_number || <span className="italic">No phone</span>}</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{member.address || <span className="italic">No address</span>}</span>
          </div>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${totalDonations.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance %</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{attendancePercent}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
            <Activity className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{activitiesCount}</div>
          </CardContent>
        </Card>
      </div>
      {/* Tabs for Details */}
      <Tabs defaultValue="donations" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>
        <TabsContent value="donations">
          <div className="space-y-4">
            {donations.length === 0 && <div className="text-muted-foreground">No donations found.</div>}
            {donations.map((donation) => (
              <Card key={donation.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">${Number(donation.amount).toFixed(2)}</CardTitle>
                  <Badge variant="outline">{donation.donation_type}</Badge>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(donation.donation_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="secondary">{donation.payment_method}</Badge>
                    {donation.is_recurring && <Badge variant="default">Recurring</Badge>}
                  </div>
                  {donation.reference_number && <div className="text-xs">Ref: {donation.reference_number}</div>}
                  {donation.notes && <div className="text-xs bg-muted p-2 rounded">{donation.notes}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="attendance">
          <div className="space-y-4">
            {attendance.length === 0 && <div className="text-muted-foreground">No attendance records found.</div>}
            {attendance.map((record) => (
              <Card key={record.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">{record.present ? "Present" : "Absent"}</CardTitle>
                  <Badge variant={record.present ? "default" : "destructive"}>{record.present ? "Present" : "Absent"}</Badge>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(record.attendance_date).toLocaleDateString()}</span>
                  </div>
                  {record.notes && <div className="text-xs bg-muted p-2 rounded">{record.notes}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="activities">
          <div className="space-y-4">
            {activities.length === 0 && <div className="text-muted-foreground">No activities found.</div>}
            {activities.map((activity) => (
              <Card key={activity.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">{activity.title}</CardTitle>
                  <Badge variant="outline">{activity.event_type}</Badge>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(activity.event_date).toLocaleDateString()}</span>
                  </div>
                  {activity.location && <div className="text-xs"><MapPin className="inline h-3 w-3 mr-1" />{activity.location}</div>}
                  {activity.description && <div className="text-xs bg-muted p-2 rounded">{activity.description}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <div className="mt-8 flex justify-center">
        <Button variant="outline" onClick={() => window.history.back()}>Back to Members</Button>
      </div>
    </div>
  );
} 