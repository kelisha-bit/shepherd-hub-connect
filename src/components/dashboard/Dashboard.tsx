import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { BarChart3, DollarSign, Calendar, UserCheck, Cake, PartyPopper, Users, TrendingUp, Gift, Clock } from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart as ReBarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useDashboardAttendance } from '@/hooks/useDashboardAttendance';
import { useDashboardDonations } from '@/hooks/useDashboardDonations';
import { useDashboardEvents } from '@/hooks/useDashboardEvents';
import { useDashboardBirthdays } from '@/hooks/useDashboardBirthdays';
import { useDashboardGroups } from '@/hooks/useDashboardGroups';
import { useDashboardActiveMembers } from '@/hooks/useDashboardActiveMembers';

// Inline ProgressRing component (SVG-based)
const ProgressRing = ({ percent, size = 80, stroke = 8, color = '#22c55e', bg = '#e5e7eb' }) => {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="block mx-auto">
      <circle cx={size/2} cy={size/2} r={radius} stroke={bg} strokeWidth={stroke} fill="none" />
      <circle
        cx={size/2}
        cy={size/2}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.3em" fontSize="1.2em" className="fill-green-600 font-bold">{percent}%</text>
    </svg>
  );
};

const Dashboard: React.FC = () => {
  const [analyticsRange, setAnalyticsRange] = useState('6m');

  // Dashboard hooks
  const attendance = useDashboardAttendance();
  const donations = useDashboardDonations();
  const events = useDashboardEvents();
  const birthdays = useDashboardBirthdays();
  const groups = useDashboardGroups();
  const activeMembers = useDashboardActiveMembers();

  // Metrics data
  const metrics = [
    {
      label: 'Attendance',
      value: attendance.loading ? <Skeleton className="h-6 w-16" /> : attendance.error ? '—' : `${attendance.percent}%`,
      icon: UserCheck,
      color: 'from-blue-400 to-blue-600',
      bg: 'bg-gradient-to-tr',
      accent: 'text-blue-700',
    },
    {
      label: 'Last Donation',
      value: donations.loading ? <Skeleton className="h-6 w-20" /> : donations.error ? '—' : donations.last ? `Ghc${Number(donations.last.amount).toLocaleString()}` : '—',
      icon: DollarSign,
      color: 'from-green-400 to-green-600',
      bg: 'bg-gradient-to-tr',
      accent: 'text-green-700',
    },
    {
      label: 'Upcoming Events',
      value: events.loading ? <Skeleton className="h-6 w-8" /> : events.error ? '—' : events.events.length,
      icon: Calendar,
      color: 'from-purple-400 to-purple-600',
      bg: 'bg-gradient-to-tr',
      accent: 'text-purple-700',
    },
    {
      label: 'Total Donations',
      value: donations.loading ? <Skeleton className="h-6 w-20" /> : donations.error ? '—' : `Ghc${Number(donations.total).toLocaleString()}`,
      icon: BarChart3,
      color: 'from-emerald-400 to-emerald-600',
      bg: 'bg-gradient-to-tr',
      accent: 'text-emerald-700',
    },
    {
      label: 'Upcoming Birthday',
      value: birthdays.loading ? <Skeleton className="h-6 w-32" /> : birthdays.error ? '—' : birthdays.birthdays[0] ? `${birthdays.birthdays[0].name} (${new Date(birthdays.birthdays[0].date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` : '—',
      icon: Cake,
      color: 'from-pink-400 to-pink-600',
      bg: 'bg-gradient-to-tr',
      accent: 'text-pink-700',
    },
    {
      label: 'Upcoming Event',
      value: events.loading ? <Skeleton className="h-6 w-40" /> : events.error ? '—' : events.events[0] ? `${events.events[0].title} (${new Date(events.events[0].event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` : '—',
      icon: PartyPopper,
      color: 'from-yellow-400 to-yellow-600',
      bg: 'bg-gradient-to-tr',
      accent: 'text-yellow-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-4 space-y-8">
      {/* Welcome Header */}
      <div className="animate-fade-in">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Church Management Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-scale-in">
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-blue-100 text-sm font-medium">Today's Attendance</p>
                <p className="text-3xl font-bold">
                  {attendance.loading ? <Skeleton className="h-8 w-16 bg-white/20" /> : attendance.error ? '—' : `${attendance.percent}%`}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-20">
              <Users className="h-24 w-24" />
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-green-100 text-sm font-medium">Total Donations</p>
                <p className="text-3xl font-bold">
                  {donations.loading ? <Skeleton className="h-8 w-20 bg-white/20" /> : donations.error ? '—' : `GH₵${Number(donations.total).toLocaleString()}`}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <Gift className="h-6 w-6" />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-20">
              <Gift className="h-24 w-24" />
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-purple-100 text-sm font-medium">Upcoming Events</p>
                <p className="text-3xl font-bold">
                  {events.loading ? <Skeleton className="h-8 w-8 bg-white/20" /> : events.error ? '—' : events.events.length}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-20">
              <Calendar className="h-24 w-24" />
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-orange-100 text-sm font-medium">Growth Rate</p>
                <p className="text-3xl font-bold">+12.5%</p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-20">
              <TrendingUp className="h-24 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Analytics */}
        <Card className="lg:col-span-2 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Attendance Analytics
            </CardTitle>
            <ToggleGroup type="single" value={analyticsRange} onValueChange={v => v && setAnalyticsRange(v)} className="bg-muted rounded-lg">
              <ToggleGroupItem value="1m" className="text-xs">This Month</ToggleGroupItem>
              <ToggleGroupItem value="6m" className="text-xs">6 Months</ToggleGroupItem>
              <ToggleGroupItem value="ytd" className="text-xs">YTD</ToggleGroupItem>
            </ToggleGroup>
          </CardHeader>
          <CardContent>
            {attendance.loading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : attendance.error ? (
              <div className="text-destructive">{attendance.error}</div>
            ) : (
              <ChartContainer config={{ attendance: { color: 'hsl(var(--primary))', label: 'Attendance' } }} className="h-64">
                <ReBarChart data={attendance.data} width={400} height={250}>
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6,6,0,0]} />
                </ReBarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Attendance Goal */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-center flex items-center justify-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Monthly Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            {attendance.loading ? (
              <Skeleton className="h-24 w-24 rounded-full" />
            ) : attendance.error ? (
              <div className="text-destructive">{attendance.error}</div>
            ) : (
              <div className="relative">
                <ProgressRing percent={attendance.percent} size={96} stroke={8} color="hsl(var(--primary))" bg="hsl(var(--muted))" />
              </div>
            )}
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{attendance.percent || 0}%</p>
              <p className="text-sm text-muted-foreground">of monthly goal reached</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events & Birthdays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : events.error ? (
              <div className="text-destructive">{events.error}</div>
            ) : events.events.length > 0 ? (
              <div className="space-y-3">
                {events.events.slice(0, 3).map((event, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.event_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <Badge variant="secondary">Event</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No upcoming events</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Birthdays */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Cake className="h-5 w-5 text-primary" />
              Upcoming Birthdays
            </CardTitle>
          </CardHeader>
          <CardContent>
            {birthdays.loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : birthdays.error ? (
              <div className="text-destructive">{birthdays.error}</div>
            ) : birthdays.birthdays.length > 0 ? (
              <div className="space-y-3">
                {birthdays.birthdays.slice(0, 3).map((birthday, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="rounded-full bg-pink-100 p-2">
                      <Cake className="h-4 w-4 text-pink-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{birthday.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(birthday.date_of_birth).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-pink-200 text-pink-600">Birthday</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Cake className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No upcoming birthdays</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Group Performance & Active Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Group Performance */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Group Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groups.loading ? (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
              </div>
            ) : groups.error ? (
              <div className="text-destructive">{groups.error}</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {groups.groups.map(g => (
                  <div key={g.group} className="flex flex-col items-center p-4 bg-gradient-to-br from-background to-muted/30 rounded-xl border hover:shadow-md transition-shadow">
                    <div className="text-sm font-semibold mb-2 text-center">{g.group}</div>
                    <ProgressRing percent={g.percent} size={48} stroke={6} color="hsl(var(--primary))" bg="hsl(var(--muted))" />
                    <div className="mt-2 text-xs text-primary font-bold">{g.percent}%</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Active Members */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Most Active Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeMembers.loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded" />)}
              </div>
            ) : activeMembers.error ? (
              <div className="text-destructive">{activeMembers.error}</div>
            ) : (
              <div className="space-y-3">
                {activeMembers.members.map((member, index) => (
                  <div key={member.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <UserCheck className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.group}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-bold">{member.attendance}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;