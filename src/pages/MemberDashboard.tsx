import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSign, Calendar, Users, CheckCircle, TrendingUp } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function MemberDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAttendance();
      fetchDonations();
      fetchGroups();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("members")
      .select("*")
      .eq("email", user?.email)
      .single();
    setProfile(data);
  };

  const fetchAttendance = async () => {
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("member_id", user?.id)
      .order("attendance_date", { ascending: true });
    setAttendance(data || []);
  };

  const fetchDonations = async () => {
    const { data } = await supabase
      .from("donations")
      .select("*")
      .eq("member_id", user?.id)
      .order("donation_date", { ascending: false });
    setDonations(data || []);
  };

  const fetchGroups = async () => {
    // Example: fetch group attendance for this member
    const { data } = await supabase
      .from("attendance")
      .select("group, present")
      .eq("member_id", user?.id);
    // Group by group name
    const groupMap: Record<string, { total: number; present: number }> = {};
    (data || []).forEach((a: any) => {
      const group = a.group || "Other";
      if (!groupMap[group]) groupMap[group] = { total: 0, present: 0 };
      groupMap[group].total++;
      if (a.present) groupMap[group].present++;
    });
    const stats = Object.entries(groupMap).map(([group, { total, present }]) => ({
      group,
      percent: total ? Math.round((present / total) * 100) : 0
    }));
    setGroups(stats);
  };

  // Attendance stats
  const attendancePercent = attendance.length > 0 ? Math.round(100 * attendance.filter(a => a.present).length / attendance.length) : 0;
  const lastAttendance = attendance.length > 0 ? attendance[attendance.length - 1] : null;

  // Donation stats
  const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const lastDonation = donations.length > 0 ? donations[0] : null;

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
              <span>Registration Date: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</span>
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
      </div>
      {/* Right Side Cards */}
      <div className="w-full lg:w-80 flex flex-col gap-8">
        {/* Payment Details Card */}
        <Card className="rounded-2xl shadow-lg p-6 bg-gradient-to-br from-purple-200 to-blue-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold mb-2 text-blue-900">Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-800">Card Number:</span>
                <span className="bg-white px-2 py-1 rounded text-sm text-blue-900">2366 2366 2366 2366</span>
              </div>
              <div className="flex gap-2 mt-2">
                <img src="/public/placeholder.svg" alt="Western Union" className="h-6" />
                <img src="/public/placeholder.svg" alt="GPay" className="h-6" />
                <img src="/public/placeholder.svg" alt="Mastercard" className="h-6" />
                <img src="/public/placeholder.svg" alt="Visa" className="h-6" />
              </div>
            </div>
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