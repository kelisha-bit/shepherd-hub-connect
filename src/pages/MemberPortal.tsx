import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function MemberPortal() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Member Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        <Link to="/member/profile">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>View and edit your personal information.</CardContent>
          </Card>
        </Link>
        <Link to="/member/attendance">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent>See your attendance records and participation.</CardContent>
          </Card>
        </Link>
        <Link to="/member/donations">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Donations</CardTitle>
            </CardHeader>
            <CardContent>View your donation history and download receipts.</CardContent>
          </Card>
        </Link>
        <Link to="/member/events">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Events</CardTitle>
            </CardHeader>
            <CardContent>See upcoming and past events you participated in.</CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
} 