import { 
  Users, 
  DollarSign, 
  Calendar, 
  UserPlus,
  TrendingUp,
  Church,
  Heart,
  Gift,
  Plus,
  Bell,
  Mail
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Total Members",
    value: "1,247",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "text-primary"
  },
  {
    title: "This Month's Giving",
    value: "$24,890",
    change: "+8.2%",
    trend: "up",
    icon: DollarSign,
    color: "text-success"
  },
  {
    title: "Sunday Attendance",
    value: "892",
    change: "+5.4%",
    trend: "up",
    icon: Church,
    color: "text-accent"
  },
  {
    title: "New Visitors",
    value: "34",
    change: "+23%",
    trend: "up",
    icon: UserPlus,
    color: "text-warning"
  }
];

const quickActions = [
  {
    title: "Add New Member",
    description: "Register a new church member",
    icon: UserPlus,
    color: "bg-primary text-primary-foreground"
  },
  {
    title: "Schedule Event",
    description: "Create a new church event",
    icon: Calendar,
    color: "bg-accent text-accent-foreground"
  },
  {
    title: "Send Announcement",
    description: "Notify members of updates",
    icon: Bell,
    color: "bg-success text-success-foreground"
  },
  {
    title: "Record Donation",
    description: "Log new donation or tithe",
    icon: Gift,
    color: "bg-warning text-warning-foreground"
  }
];

const recentActivities = [
  {
    type: "member",
    message: "Sarah Johnson joined the church",
    time: "2 hours ago",
    icon: Users
  },
  {
    type: "donation",
    message: "Weekly tithe collection: $3,240",
    time: "1 day ago",
    icon: DollarSign
  },
  {
    type: "event",
    message: "Youth Bible Study scheduled for Friday",
    time: "2 days ago",
    icon: Calendar
  },
  {
    type: "visitor",
    message: "5 new visitors registered",
    time: "3 days ago",
    icon: UserPlus
  }
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening at your church.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-success" />
                <span className="text-success">{stat.change}</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 text-left"
                >
                  <div className={`p-2 rounded-md mr-3 ${action.color}`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <activity.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Events Preview */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Sunday Service</h3>
                  <p className="text-sm text-muted-foreground">Main sanctuary</p>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Today</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">10:00 AM - 12:00 PM</p>
            </div>
            
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Youth Bible Study</h3>
                  <p className="text-sm text-muted-foreground">Youth room</p>
                </div>
                <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">Tomorrow</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">7:00 PM - 8:30 PM</p>
            </div>
            
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Prayer Meeting</h3>
                  <p className="text-sm text-muted-foreground">Prayer room</p>
                </div>
                <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded">Wed</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">6:00 PM - 7:00 PM</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}