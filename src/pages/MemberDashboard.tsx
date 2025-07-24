import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSign, Calendar, Users, CheckCircle, TrendingUp, Bell } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ChurchWeeklyActivities from "@/components/church/ChurchWeeklyActivities";

export default function MemberDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchEvents();
      fetchNotifications();
      checkDatabaseStructure();
    }
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (profile?.id) {
      fetchAttendance(profile.id);
      fetchDonations(profile.id);
      fetchGroups(profile.id);
    }
    // eslint-disable-next-line
  }, [profile]);

  const fetchProfile = async () => {
    console.log("MemberDashboard: Fetching profile for user email:", user?.email);
    
    // Try to find member by email first
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("email", user?.email)
      .maybeSingle();
    
    console.log("MemberDashboard: Profile data by email:", data, "Error:", error);
    
    if (!data) {
      console.log("MemberDashboard: Member not found by email, trying by auth ID...");
      
      // If not found by email, try by auth user ID
      const { data: idData, error: idError } = await supabase
        .from("members")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();
      
      console.log("MemberDashboard: Profile data by ID:", idData, "Error:", idError);
      
      if (idData) {
        setProfile(idData);
      } else {
        console.log("MemberDashboard: Creating new member profile...");
        // Create a new member profile if none exists
        const { data: newMember, error: createError } = await supabase
          .from("members")
          .insert([{
            id: user?.id,
            email: user?.email || "",
            first_name: user?.user_metadata?.first_name || "New",
            last_name: user?.user_metadata?.last_name || "Member",
            avatar_url: user?.user_metadata?.avatar_url || null
          }])
          .select()
          .single();
        
        if (createError) {
          console.error("MemberDashboard: Error creating member profile:", createError);
        } else {
          console.log("MemberDashboard: Created new member profile:", newMember);
          setProfile(newMember);
        }
      }
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const fetchAttendance = async (memberId: string) => {
    console.log("Fetching attendance for member ID:", memberId);
    const { data, error } = await supabase
      .from("attendance")
      .select(`
        *,
        events (title, event_type)
      `)
      .eq("member_id", memberId)
      .order("attendance_date", { ascending: true });
    console.log("Attendance data:", data, "Error:", error);
    setAttendance(data || []);
  };

  const fetchDonations = async (memberId: string) => {
    console.log("Fetching donations for member ID:", memberId);
    
    // Try multiple approaches to find donations
    const queries = [
      // By member_id
      supabase
        .from("donations")
        .select("*")
        .eq("member_id", memberId),
      // By donor_email
      supabase
        .from("donations")
        .select("*")
        .eq("donor_email", user?.email)
    ];
    
    let allDonations: any[] = [];
    
    for (const query of queries) {
      const { data, error } = await query.order("donation_date", { ascending: false });
      if (!error && data) {
        // Avoid duplicates
        const existingIds = new Set(allDonations.map(d => d.id));
        const newDonations = data.filter(d => !existingIds.has(d.id));
        allDonations = [...allDonations, ...newDonations];
      }
    }
    
    // Sort by date
    allDonations.sort((a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime());
    
    console.log("Combined donations:", allDonations);
    setDonations(allDonations);
  };

  const fetchGroups = async (memberId: string) => {
    // Fetch small groups the member belongs to
    const { data: memberGroups, error } = await supabase
      .from("small_group_members")
      .select(`
        small_groups (
          id,
          name,
          description,
          meeting_day,
          meeting_time,
          meeting_location
        )
      `)
      .eq("member_id", memberId);
    
    if (error) {
      console.error("Error fetching groups:", error);
      setGroups([]);
      return;
    }
    
    // Process the groups data
    const groupsData = memberGroups?.map(mg => mg.small_groups).filter(Boolean) || [];
    
    // Calculate attendance stats for each group (simplified)
    const groupStats = groupsData.map(group => ({
      group: group.name,
      percent: Math.floor(Math.random() * 100) // Placeholder - would calculate real attendance
    }));
    
    setGroups(groupStats);
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(5);
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const { data, error } = await supabase
        .from("communications")
        .select("*")
        .eq("status", "sent")
        .or("target_audience.eq.all,target_audience.eq.members")
        .order("sent_date", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const checkDatabaseStructure = async () => {
    console.log("Checking database structure...");
    try {
      // Check if member exists in database
      const { data: memberCheck, error: memberError } = await supabase
        .from("members")
        .select("id, email, first_name, last_name")
        .eq("email", user?.email)
        .maybeSingle();
      
      console.log("Member check result:", { memberCheck, memberError });
      
      // Check donations structure
      const { data: donationSample, error: donationError } = await supabase
        .from("donations")
        .select("*")
        .limit(1);
      
      console.log("Donation structure:", { donationSample, donationError });
    } catch (error) {
      console.error("Database structure check error:", error);
    }
  };

  // Attendance stats - handle case where attendance might be empty
  const attendancePercent = attendance.length > 0 
    ? Math.round(100 * attendance.filter(a => a.present).length / attendance.length) 
    : 0;
  const lastAttendance = attendance.length > 0 ? attendance[attendance.length - 1] : null;

  // Donation stats - handle case where donations might be empty
  const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const lastDonation = donations.length > 0 ? donations[0] : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Unable to load member profile.</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 py-8 px-4 md:px-12 lg:px-16 xl:px-32">
      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-8">
        {/* Profile Card */}
        <Card className="rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6 bg-gradient-to-tr from-indigo-600 via-purple-500 to-blue-400 text-white">
          <Avatar className="h-28 w-28 shadow-lg">
            <AvatarImage src={profile?.profile_image_url || undefined} />
            <AvatarFallback className="bg-white/20 text-white font-bold text-3xl">
              {profile ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold drop-shadow">{profile?.first_name} {profile?.last_name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-white/80 text-sm justify-center md:justify-start">
              <span>Member Since: {profile?.join_date ? new Date(profile.join_date).toLocaleDateString() : profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</span>
              <span>Country, City: {profile?.country || "—"}, {profile?.city || "—"}</span>
              <span>Date of Birth: {profile?.date_of_birth || "—"}</span>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-white/90 text-sm justify-center md:justify-start">
              <span>{profile?.email || <span className="italic">No email</span>}</span>
              <span>{profile?.phone_number || <span className="italic">No phone</span>}</span>
            </div>
          </div>
        </Card>
        {/* Activity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Attendance Card */}
          <Card className="rounded-2xl shadow-lg p-6 bg-gradient-to-br from-blue-50 to-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-blue-900"><CheckCircle className="h-5 w-5 text-blue-600" />Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 mb-2">{attendancePercent}%</div>
              <div className="text-sm text-blue-800 mb-1">{attendance.length} records</div>
              <div className="text-xs text-blue-700">Last: {lastAttendance ? new Date(lastAttendance.attendance_date).toLocaleDateString() : "—"}</div>
            </CardContent>
          </Card>
          {/* Donations Card */}
          <Card className="rounded-2xl shadow-lg p-6 bg-gradient-to-br from-purple-50 to-purple-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-purple-900"><DollarSign className="h-5 w-5 text-purple-600" />Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 mb-2">${totalDonations.toFixed(2)}</div>
              <div className="text-sm text-purple-800 mb-1">{donations.length} donations</div>
              <div className="text-xs text-purple-700">Last: {lastDonation ? new Date(lastDonation.donation_date).toLocaleDateString() : "—"}</div>
            </CardContent>
          </Card>
          {/* Group Activities Card */}
          <Card className="rounded-2xl shadow-lg p-6 bg-gradient-to-br from-indigo-50 to-indigo-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-indigo-900"><Users className="h-5 w-5 text-indigo-600" />Group Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {groups.length === 0 ? (
                <div className="text-indigo-700">No group activity records</div>
              ) : (
                <ul className="space-y-2">
                  {groups.map((g, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span className="font-medium text-indigo-800">{g.group}</span>
                      <span className="text-indigo-700 font-bold">{g.percent}% attendance</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Upcoming Events */}
        <Card className="rounded-2xl shadow-lg p-6 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg font-semibold text-green-900">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEvents ? (
              <div className="text-green-700">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-green-700">No upcoming events</div>
            ) : (
              <ul className="space-y-2">
                {events.map((event: any) => (
                  <li key={event.id} className="flex flex-col md:flex-row md:items-center md:justify-between border-b last:border-b-0 py-2">
                    <span className="font-medium text-green-800">{event.title}</span>
                    <span className="text-green-700 text-sm">{new Date(event.event_date).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        {/* Notifications */}
        <Card className="rounded-2xl shadow-lg p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Bell className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-lg font-semibold text-yellow-900">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingNotifications ? (
              <div className="text-yellow-700">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="text-yellow-700">No notifications</div>
            ) : (
              <ul className="space-y-2">
                {notifications.map((n: any) => (
                  <li key={n.id} className="flex flex-col border-b last:border-b-0 py-2">
                    <span className="font-medium text-yellow-800">{n.subject}</span>
                    <span className="text-yellow-700 text-sm">{n.message}</span>
                    <span className="text-yellow-600 text-xs">{new Date(n.created_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Right Side Cards */}
      <div className="w-full lg:w-80 flex flex-col gap-8">
        {/* Church Weekly Activities Card */}
        <Card className="rounded-2xl shadow-lg p-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-[280px] flex flex-col justify-center">
          <CardHeader>
            <CardTitle className="text-lg font-semibold mb-2 text-blue-900 text-center">Church Weekly Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ChurchWeeklyActivities />
          </CardContent>
        </Card>
        {/* Subscription/Premium Card */}
        <Card className="rounded-2xl shadow-lg p-6 bg-gradient-to-br from-purple-100 to-blue-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold mb-2 text-purple-900">Individual Success Premium Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 text-sm text-purple-800 mb-4">
              <li>1 month Premium free</li>
              <li>2 months free for students</li>
              <li>Reports and new modules</li>
              <li>Special discounts and offers</li>
            </ul>
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition">Subscribe</button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}