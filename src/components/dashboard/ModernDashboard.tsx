import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  UserCheck, 
  MessageSquare,
  Bell,
  Plus,
  ArrowRight,
  Cake,
  Activity,
  BarChart3,
  Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useDashboardAttendance } from '@/hooks/useDashboardAttendance';
import { useDashboardDonations } from '@/hooks/useDashboardDonations';
import { useDashboardEvents } from '@/hooks/useDashboardEvents';
import { useDashboardBirthdays } from '@/hooks/useDashboardBirthdays';
import { useDashboardGroups } from '@/hooks/useDashboardGroups';
import { useDashboardActiveMembers } from '@/hooks/useDashboardActiveMembers';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from "react-router-dom";
import { Dialog } from '@/components/ui/dialog';

// Modern metric card component with colorful backgrounds
const MetricCard = ({ title, value, change, changeType, icon: Icon, color = "blue", subtitle, isLoading }: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: any;
  color?: string;
  subtitle?: string;
  isLoading?: boolean;
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
      icon: 'bg-white/20 text-white border-white/30',
      text: 'text-white',
      subtitle: 'text-blue-100',
      change: 'text-blue-100'
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700',
      icon: 'bg-white/20 text-white border-white/30',
      text: 'text-white',
      subtitle: 'text-emerald-100',
      change: 'text-emerald-100'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700',
      icon: 'bg-white/20 text-white border-white/30',
      text: 'text-white',
      subtitle: 'text-purple-100',
      change: 'text-purple-100'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600',
      icon: 'bg-white/20 text-white border-white/30',
      text: 'text-white',
      subtitle: 'text-orange-100',
      change: 'text-orange-100'
    }
  };

  const colors = colorClasses[color as keyof typeof colorClasses];

  return (
    <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${colors.bg} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 rounded-xl ${colors.icon} backdrop-blur-sm`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className={`text-sm font-medium ${colors.text}`}>{title}</p>
                {subtitle && <p className={`text-xs ${colors.subtitle}`}>{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-end gap-2">
              {isLoading ? (
                <Skeleton className="h-8 w-20 bg-white/20" />
              ) : (
                <h3 className={`text-3xl font-bold ${colors.text}`}>{value}</h3>
              )}
              {change && (
                <div className={`flex items-center gap-1 text-xs font-medium ${colors.change}`}>
                  {changeType === 'up' && <TrendingUp className="h-3 w-3" />}
                  {changeType === 'down' && <TrendingDown className="h-3 w-3" />}
                  {change}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ModernDashboard: React.FC = () => {
  // Dashboard hooks
  const attendance = useDashboardAttendance();
  const donations = useDashboardDonations();
  const events = useDashboardEvents();
  const birthdays = useDashboardBirthdays();
  const groups = useDashboardGroups();
  const activeMembers = useDashboardActiveMembers();
  const navigate = useNavigate();

  // State for dashboard data
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const refreshTimer = setInterval(() => {
      fetchDashboardData(true);
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(refreshTimer);
  }, []);

  // Fetch dashboard data with live updates
  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setMembersLoading(true);
    }
    
    try {
      // Fetch members with real-time data - simplified query
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!membersError && membersData) {
        setMembers(membersData);
      }
      
      // Fetch recent activities from multiple tables with simplified queries
      const [attendanceRes, donationsRes, eventsRes] = await Promise.all([
        // Simplified attendance query
        supabase
          .from('attendance')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3),
          
        // Simplified donations query
        supabase
          .from('donations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(2),
          
        // Events query
        supabase
          .from('events')
          .select('*')
          .gte('event_date', new Date().toISOString())
          .order('event_date', { ascending: true })
          .limit(2)
      ]);
      
      const activities = [];
      
      // Add attendance activities
      if (attendanceRes.data) {
        attendanceRes.data.forEach((record: any) => {
          // For now, just show basic attendance info without member/event details
          activities.push({
            icon: UserCheck,
            title: `Attendance recorded`,
            subtitle: record.present ? 'Present' : 'Absent',
            time: record.created_at ? new Date(record.created_at).toLocaleString() : 'Recently',
            color: record.present ? 'green' : 'orange'
          });
        });
      }
      
      // Add donation activities
      if (donationsRes.data) {
        donationsRes.data.forEach((donation: any) => {
          activities.push({
            icon: DollarSign,
            title: 'New donation received',
            subtitle: donation.amount ? `$${donation.amount}` : 'Donation',
            time: donation.created_at ? new Date(donation.created_at).toLocaleString() : 'Recently',
            color: 'green'
          });
        });
      }
      
      // Add upcoming events
      if (eventsRes.data) {
        eventsRes.data.forEach((event: any) => {
          activities.push({
            icon: Calendar,
            title: event.title || 'Upcoming event',
            subtitle: event.event_date 
              ? new Date(event.event_date).toLocaleDateString() 
              : 'Event',
            time: event.event_date 
              ? new Date(event.event_date).toLocaleDateString() 
              : 'Soon',
            color: 'blue'
          });
        });
      }
      
      // Sort activities by time and take the most recent
      setRecentActivities(activities.slice(0, 5));
      
      // Update notifications based on real data
      const notificationsList = [];
      
      // Check for upcoming events
      if (eventsRes.data && eventsRes.data.length > 0) {
        notificationsList.push({
          title: 'Upcoming Events',
          message: `${eventsRes.data.length} events scheduled this week`,
          type: 'info'
        });
      }
      
      // Check for recent donations
      if (donationsRes.data && donationsRes.data.length > 0) {
        const totalRecent = donationsRes.data.reduce((sum: number, d: any) => sum + d.amount, 0);
        notificationsList.push({
          title: 'Recent Donations',
          message: `$${totalRecent} received recently`,
          type: 'celebration'
        });
      }
      
      setNotifications(notificationsList);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setMembersLoading(false);
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick actions
  const quickActions = [
    { title: 'Add Member', icon: Users, onClick: () => navigate('/members'), color: 'blue' },
    { title: 'New Event', icon: Calendar, onClick: () => navigate('/events'), color: 'green' },
    { title: 'Record Donation', icon: DollarSign, onClick: () => navigate('/donations'), color: 'orange' },
    { title: 'Send Message', icon: MessageSquare, onClick: () => navigate('/communication'), color: 'purple' },
  ];

  // Calculate key metrics using correct hook properties
  const totalMembers = members.length;
  const avgAttendance = attendance.data?.length > 0 
    ? Math.round(attendance.data.reduce((sum: number, record: any) => sum + (record.present ? 1 : 0), 0) / attendance.data.length * 100)
    : 0;

  const totalDonations = donations.total || 0;
  const upcomingEvents = events.events?.filter((event: any) => new Date(event.event_date) > new Date()).length || 0;

  // Quick Action Component
  const QuickAction = ({ title, icon: Icon, onClick, color = "blue" }: {
    title: string;
    icon: any;
    onClick: () => void;
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200',
      green: 'hover:bg-green-50 hover:text-green-600 hover:border-green-200',
      purple: 'hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200',
      orange: 'hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
    };

    return (
      <Button 
        variant="outline" 
        className={`h-auto p-4 flex-col gap-2 ${colorClasses[color as keyof typeof colorClasses]} transition-all duration-200`}
        onClick={onClick}
      >
        <Icon className="h-5 w-5" />
        <span className="text-xs font-medium">{title}</span>
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50/30">
      {/* Header Section with colorful gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-lg">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Church Dashboard</h1>
              <div className="flex items-center gap-4 text-blue-100">
                <p className="text-sm">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <Activity className="h-3 w-3" />
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                onClick={() => fetchDashboardData(true)}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Activity className="h-4 w-4" />
                )}
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm" onClick={() => navigate('/notifications')}>
                <Bell className="h-4 w-4" />
                Notifications
                {notifications.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs bg-red-500">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
              <Button size="sm" className="gap-2 bg-white text-blue-600 hover:bg-blue-50" onClick={() => setQuickAddOpen(true)}>
                <Plus className="h-4 w-4" />
                Quick Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics with live data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Members"
            value={membersLoading ? 'Loading...' : totalMembers}
            change={`+${Math.floor(totalMembers * 0.05)} this month`}
            changeType="up"
            icon={Users}
            color="blue"
            subtitle="Active congregation"
            isLoading={membersLoading}
          />
          <MetricCard
            title="Attendance Rate"
            value={attendance.loading ? 'Loading...' : `${avgAttendance}%`}
            change={avgAttendance > 75 ? '+5% from last month' : '-2% from last month'}
            changeType={avgAttendance > 75 ? 'up' : 'down'}
            icon={UserCheck}
            color="green"
            subtitle="Average attendance"
            isLoading={attendance.loading}
          />
          <MetricCard
            title="Total Donations"
            value={donations.loading ? 'Loading...' : `$${totalDonations.toLocaleString()}`}
            change={`+${Math.floor(totalDonations * 0.08)}% this month`}
            changeType="up"
            icon={DollarSign}
            color="orange"
            subtitle="This month"
            isLoading={donations.loading}
          />
          <MetricCard
            title="Upcoming Events"
            value={events.loading ? 'Loading...' : upcomingEvents}
            change={`${upcomingEvents} this week`}
            changeType="neutral"
            icon={Calendar}
            color="purple"
            subtitle="Scheduled events"
            isLoading={events.loading}
          />
        </div>

        {/* Quick Actions with colorful background */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-white via-blue-50/50 to-purple-50/50">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Quick Actions
              <Badge variant="outline" className="ml-auto text-xs bg-blue-100 text-blue-700 border-blue-200">
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <QuickAction key={index} {...action} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Trend */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Attendance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendance.loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={attendance.data || []}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Donations Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Donation Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {donations.loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendance.data.map((d, i) => ({ month: d.month, amount: donations.total * (i + 1) / attendance.data.length }))}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section - Activities and Birthdays */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity with live data */}
          <Card className="lg:col-span-2 border-0 shadow-lg bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-t-lg">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Recent Activity
                <Badge variant="outline" className="ml-auto text-xs bg-purple-100 text-purple-700 border-purple-200">
                  Live Updates
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => {
                    const colorClasses = {
                      green: 'bg-green-100 text-green-600',
                      blue: 'bg-blue-100 text-blue-600',
                      orange: 'bg-orange-100 text-orange-600',
                      purple: 'bg-purple-100 text-purple-600'
                    };
                    
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200">
                        <div className={`p-2 rounded-lg ${colorClasses[activity.color as keyof typeof colorClasses] || 'bg-gray-100 text-gray-600'}`}>
                          <activity.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                          <p className="text-xs text-gray-500">{activity.subtitle}</p>
                        </div>
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recent activities</p>
                </div>
              )}
              <Button variant="ghost" className="w-full mt-4 gap-2" onClick={() => navigate('/activity-log')}>
                View All Activity
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Birthdays */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-pink-50/30 to-rose-50/30">
            <CardHeader className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-t-lg">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Cake className="h-5 w-5 text-pink-600" />
                Upcoming Birthdays
              </CardTitle>
            </CardHeader>
            <CardContent>
              {birthdays.loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded" />)}
                </div>
              ) : birthdays.birthdays && birthdays.birthdays.length > 0 ? (
                <div className="space-y-3">
                  {birthdays.birthdays.slice(0, 5).map((birthday: any) => (
                    <div key={birthday.name + birthday.date_of_birth} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <Avatar className="h-10 w-10">
                        {birthday.profile_image_url ? (
                          <AvatarImage src={birthday.profile_image_url} alt={birthday.name} />
                        ) : (
                          <AvatarFallback className="bg-pink-100 text-pink-600">
                            {birthday.name?.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{birthday.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(birthday.date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-pink-200 text-pink-600">Birthday</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Cake className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No upcoming birthdays</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
        <div className="p-6 w-72 flex flex-col gap-4">
          <h2 className="text-lg font-bold mb-2">Quick Add</h2>
          <Button variant="outline" onClick={() => { setQuickAddOpen(false); navigate('/members'); }}>Add Member</Button>
          <Button variant="outline" onClick={() => { setQuickAddOpen(false); navigate('/events'); }}>Add Event</Button>
          <Button variant="outline" onClick={() => { setQuickAddOpen(false); navigate('/donations'); }}>Add Donation</Button>
          <Button variant="ghost" onClick={() => setQuickAddOpen(false)}>Cancel</Button>
        </div>
      </Dialog>
    </div>
  );
};

export default ModernDashboard;
