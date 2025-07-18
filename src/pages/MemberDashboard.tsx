import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, DollarSign, Bell } from "lucide-react";

export default function MemberDashboard() {
  return (
    <div className="py-8 px-4 md:px-12 lg:px-32">
      <h1 className="text-2xl font-bold mb-6">Welcome to your Member Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/member/profile">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile</CardTitle>
            </CardHeader>
            <CardContent>View and update your personal information.</CardContent>
          </Card>
        </Link>
        <Link to="/member/attendance">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Attendance</CardTitle>
            </CardHeader>
            <CardContent>Check your attendance history and trends.</CardContent>
          </Card>
        </Link>
        <Link to="/member/donations">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Donations</CardTitle>
            </CardHeader>
            <CardContent>View your donation records and download receipts.</CardContent>
          </Card>
        </Link>
        <Link to="/member/events">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Events</CardTitle>
            </CardHeader>
            <CardContent>See upcoming events and service schedules.</CardContent>
          </Card>
        </Link>
        <Link to="/member/notifications">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle>
            </CardHeader>
            <CardContent>View messages from church administrators.</CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
} 