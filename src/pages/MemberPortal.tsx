import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { User, Calendar, DollarSign, MessageSquare, BookOpen, HandHeart, Users, Bookmark, Home, Bell } from "lucide-react";

export default function MemberPortal() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Member Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        <Link to="/member">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                <CardTitle>Dashboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent>Your personalized member dashboard overview.</CardContent>
          </Card>
        </Link>
        <Link to="/member/notifications">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full relative">
            <div className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </div>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent>View your latest notifications and updates.</CardContent>
          </Card>
        </Link>
        <Link to="/member/profile">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent>View and edit your personal information.</CardContent>
          </Card>
        </Link>
        <Link to="/member/attendance">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Attendance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>See your attendance records and participation.</CardContent>
          </Card>
        </Link>
        <Link to="/member/donations">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle>Donations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>View your donation history and download receipts.</CardContent>
          </Card>
        </Link>
        <Link to="/member/events">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Events</CardTitle>
              </div>
            </CardHeader>
            <CardContent>See upcoming and past events you participated in.</CardContent>
          </Card>
        </Link>
        <Link to="/member/communications">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>Communication Center</CardTitle>
              </div>
            </CardHeader>
            <CardContent>Access church communications and messaging.</CardContent>
          </Card>
        </Link>
        <Link to="/member/resources">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-primary" />
                <CardTitle>Resource Booking</CardTitle>
              </div>
            </CardHeader>
            <CardContent>Book church facilities and equipment.</CardContent>
          </Card>
        </Link>
        <Link to="/member/sermons">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Sermon Library</CardTitle>
              </div>
            </CardHeader>
            <CardContent>Access and download sermon recordings and notes.</CardContent>
          </Card>
        </Link>
        <Link to="/member/prayer-requests">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HandHeart className="h-5 w-5 text-primary" />
                <CardTitle>Prayer Requests</CardTitle>
              </div>
            </CardHeader>
            <CardContent>Submit and track prayer requests.</CardContent>
          </Card>
        </Link>
        <Link to="/member/small-groups">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Small Groups</CardTitle>
              </div>
            </CardHeader>
            <CardContent>Join and manage small group participation.</CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}