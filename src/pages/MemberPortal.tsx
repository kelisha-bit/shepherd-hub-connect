import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { User, Calendar, DollarSign, MessageSquare, BookOpen, HandHeart, Users, Bookmark, Home, Bell, Mail, Phone, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function MemberPortal() {
  const { user } = useAuth();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (user?.email) {
      fetchProfileImage();
    }
  }, [user]);

  const fetchProfileImage = async () => {
    try {
      console.log("MemberPortal: Fetching profile image for user:", user?.email);
      
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .select("profile_image_url")
        .eq("email", user?.email)
        .maybeSingle();
      
      if (!memberError && memberData) {
        const imageUrl = memberData.profile_image_url || null;
        console.log("MemberPortal: Setting profile image URL:", imageUrl);
        setProfileImageUrl(imageUrl);
      } else {
        console.log("MemberPortal: No profile data found");
        setProfileImageUrl(null);
      }
    } catch (error) {
      console.error("MemberPortal: Error fetching profile image:", error);
      setProfileImageUrl(null);
    }
  };
  
  const userInitials = user?.user_metadata?.first_name && user?.user_metadata?.last_name
    ? `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`
    : user?.email?.[0]?.toUpperCase() || "U";

  const userName = user?.user_metadata?.first_name && user?.user_metadata?.last_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    : user?.email || "Member";

  // Determine the best avatar URL to use
  const avatarUrl = profileImageUrl || 
                   user?.user_metadata?.avatar_url || 
                   user?.user_metadata?.picture;

  // Add debugging for avatar URL
  useEffect(() => {
    console.log("MemberPortal: Avatar URL analysis:");
    console.log("  profileImageUrl:", profileImageUrl);
    console.log("  user?.user_metadata?.avatar_url:", user?.user_metadata?.avatar_url);
    console.log("  user?.user_metadata?.picture:", user?.user_metadata?.picture);
    console.log("  Final avatarUrl:", avatarUrl);
  }, [profileImageUrl, user, avatarUrl]);

  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      {/* Profile Section */}
      <div className="w-full max-w-6xl bg-card rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage 
                src={avatarUrl} 
                alt={userName} 
              />
              <AvatarFallback className="text-2xl bg-primary/10">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
              title="Update profile picture"
              asChild
            >
              <Link to="/member/profile">
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <h1 className="text-2xl font-bold">Welcome back, {userName}!</h1>
              <Button variant="outline" size="sm" asChild>
                <Link to="/member/profile">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="h-4 w-4" />
                {user?.email || "No email provided"}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="h-4 w-4" />
                {user?.phone || "No phone number"}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="h-4 w-4" />
                {user?.user_metadata?.address || "No address provided"}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-8 self-start max-w-6xl w-full">Member Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        <Link to="/member">
          <Card className="group hover:shadow-lg transition-all cursor-pointer h-full border-0 overflow-hidden relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-blue-200 dark:bg-blue-700/30 rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-2 relative z-10">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <Home className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <CardTitle className="text-blue-800 dark:text-blue-100">Dashboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 text-blue-700/90 dark:text-blue-200/80">
              Your personalized member dashboard overview.
            </CardContent>
          </Card>
        </Link>
        <Link to="/member/notifications">
          <Card className="group hover:shadow-lg transition-all cursor-pointer h-full border-0 overflow-hidden relative bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20">
            <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center z-20">
              3
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-amber-200 dark:bg-amber-700/30 rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-2 relative z-10">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <Bell className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                </div>
                <CardTitle className="text-amber-800 dark:text-amber-100">Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 text-amber-700/90 dark:text-amber-200/80">
              View your latest notifications and updates.
            </CardContent>
          </Card>
        </Link>
        <Link to="/member/profile">
          <Card className="group hover:shadow-lg transition-all cursor-pointer h-full border-0 overflow-hidden relative bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-emerald-200 dark:bg-emerald-700/30 rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-2 relative z-10">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                  <User className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                </div>
                <CardTitle className="text-emerald-800 dark:text-emerald-100">Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 text-emerald-700/90 dark:text-emerald-200/80">
              View and edit your personal information.
            </CardContent>
          </Card>
        </Link>
        <Link to="/member/attendance">
          <Card className="group hover:shadow-lg transition-all cursor-pointer h-full border-0 overflow-hidden relative bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-purple-200 dark:bg-purple-700/30 rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-2 relative z-10">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                  <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                </div>
                <CardTitle className="text-purple-800 dark:text-purple-100">Attendance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 text-purple-700/90 dark:text-purple-200/80">
              See your attendance records and participation.
            </CardContent>
          </Card>
        </Link>
        <Link to="/member/donations">
          <Card className="group hover:shadow-lg transition-all cursor-pointer h-full border-0 overflow-hidden relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-green-200 dark:bg-green-700/30 rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-2 relative z-10">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
                <CardTitle className="text-green-800 dark:text-green-100">Donations</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 text-green-700/90 dark:text-green-200/80">
              View your donation history and download receipts.
            </CardContent>
          </Card>
        </Link>
        <Link to="/member/events">
          <Card className="group hover:shadow-lg transition-all cursor-pointer h-full border-0 overflow-hidden relative bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/20">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-rose-200 dark:bg-rose-700/30 rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-2 relative z-10">
                <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/50">
                  <Calendar className="h-5 w-5 text-rose-600 dark:text-rose-300" />
                </div>
                <CardTitle className="text-rose-800 dark:text-rose-100">Events</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 text-rose-700/90 dark:text-rose-200/80">
              See upcoming and past events you participated in.
            </CardContent>
          </Card>
        </Link>
        <Link to="/member/communications">
          <Card className="group hover:shadow-lg transition-all cursor-pointer h-full border-0 overflow-hidden relative bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-indigo-200 dark:bg-indigo-700/30 rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-2 relative z-10">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                  <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                </div>
                <CardTitle className="text-indigo-800 dark:text-indigo-100">Communication Center</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 text-indigo-700/90 dark:text-indigo-200/80">
              Access church communications and messaging.
            </CardContent>
          </Card>
        </Link>
        <Link to="/member/resources">
          <Card className="group hover:shadow-lg transition-all cursor-pointer h-full border-0 overflow-hidden relative bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/20">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-cyan-200 dark:bg-cyan-700/30 rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-2 relative z-10">
                <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/50">
                  <Bookmark className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
                </div>
                <CardTitle className="text-cyan-800 dark:text-cyan-100">Resource Booking</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 text-cyan-700/90 dark:text-cyan-200/80">
              Book church facilities and equipment.
            </CardContent>
          </Card>
        </Link>
        <Link to="/member/sermons">
          <Card className="group hover:shadow-lg transition-all cursor-pointer h-full border-0 overflow-hidden relative bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/30 dark:to-violet-800/20">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-violet-200 dark:bg-violet-700/30 rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-2 relative z-10">
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/50">
                  <BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-300" />
                </div>
                <CardTitle className="text-violet-800 dark:text-violet-100">Sermon Library</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 text-violet-700/90 dark:text-violet-200/80">
              Access and download sermon recordings and notes.
            </CardContent>
          </Card>
        </Link>
        <Link to="/member/prayer-requests">
          <Card className="group hover:shadow-lg transition-all cursor-pointer h-full border-0 overflow-hidden relative bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/20">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-pink-200 dark:bg-pink-700/30 rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-2 relative z-10">
                <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/50">
                  <HandHeart className="h-5 w-5 text-pink-600 dark:text-pink-300" />
                </div>
                <CardTitle className="text-pink-800 dark:text-pink-100">Prayer Requests</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 text-pink-700/90 dark:text-pink-200/80">
              Submit and track prayer requests.
            </CardContent>
          </Card>
        </Link>
        <Link to="/member/small-groups">
          <Card className="group hover:shadow-lg transition-all cursor-pointer h-full border-0 overflow-hidden relative bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-teal-200 dark:bg-teal-700/30 rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />
            <CardHeader>
              <div className="flex items-center gap-2 relative z-10">
                <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/50">
                  <Users className="h-5 w-5 text-teal-600 dark:text-teal-300" />
                </div>
                <CardTitle className="text-teal-800 dark:text-teal-100">Small Groups</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 text-teal-700/90 dark:text-teal-200/80">
              Join and manage small group participation.
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}