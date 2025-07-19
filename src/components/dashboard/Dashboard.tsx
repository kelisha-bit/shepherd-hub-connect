import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { BarChart3, DollarSign, Calendar, UserCheck, Cake, PartyPopper } from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart as ReBarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
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
    <div className="space-y-8">
      {/* Header Tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg">
          <TabsTrigger value="dashboard" className="text-base font-semibold">Dashboard</TabsTrigger>
          <TabsTrigger value="attendance" className="text-base font-semibold">Attendance</TabsTrigger>
          <TabsTrigger value="donations" className="text-base font-semibold">Donations</TabsTrigger>
          <TabsTrigger value="events" className="text-base font-semibold">Events</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          {/* Summary Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {metrics.map((m) => (
              <Card key={m.label} className={`rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ${m.bg} ${m.color} text-white relative overflow-hidden`}>
                <div className="flex items-center gap-4 p-6">
                  <div className={`rounded-full bg-white/20 p-3 ${m.accent}`}><m.icon className="h-7 w-7" /></div>
                  <div>
                    <div className="text-2xl font-bold drop-shadow-sm">{m.value}</div>
                    <div className="text-white/80 text-sm font-medium">{m.label}</div>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 text-8xl pointer-events-none select-none"><m.icon /></div>
              </Card>
            ))}
          </div>

          {/* Analytics & Goal Tracker */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Attendance Analytics */}
            <Card className="rounded-2xl shadow-lg col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Attendance Analytics</CardTitle>
                <ToggleGroup type="single" value={analyticsRange} onValueChange={v => v && setAnalyticsRange(v)} className="bg-muted rounded-md">
                  <ToggleGroupItem value="1m">This Month</ToggleGroupItem>
                  <ToggleGroupItem value="6m">Last 6 Months</ToggleGroupItem>
                  <ToggleGroupItem value="ytd">YTD</ToggleGroupItem>
                </ToggleGroup>
              </CardHeader>
              <CardContent>
                {attendance.loading ? (
                  <Skeleton className="h-48 w-full rounded-xl" />
                ) : attendance.error ? (
                  <div className="text-red-500">{attendance.error}</div>
                ) : (
                  <ChartContainer config={{ attendance: { color: '#2563eb', label: 'Attendance' } }}>
                    <ReBarChart data={attendance.data} width={400} height={200} style={{ width: '100%', height: '100%' }}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#2563eb" radius={[8,8,0,0]} />
                    </ReBarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
            {/* Goal Tracker */}
            <Card className="rounded-2xl shadow-lg flex flex-col items-center justify-center">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg font-semibold">Attendance Goal</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {attendance.loading ? <Skeleton className="h-20 w-20 rounded-full" /> : attendance.error ? <div className="text-red-500">{attendance.error}</div> : <ProgressRing percent={attendance.percent} />}
                <div className="mt-2 text-sm text-muted-foreground">{attendance.loading ? <Skeleton className="h-4 w-32" /> : attendance.error ? '—' : `${attendance.percent}% of monthly goal reached`}</div>
              </CardContent>
            </Card>
          </div>

          {/* Group Performance & Most Active Members */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Group Performance */}
            <Card className="rounded-2xl shadow-lg">
              <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold">Group Performance</CardTitle></CardHeader>
              <CardContent>
                {groups.loading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
                  </div>
                ) : groups.error ? (
                  <div className="text-red-500">{groups.error}</div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {groups.groups.map(g => (
                      <div key={g.group} className="flex flex-col items-center p-4 bg-gradient-to-tr from-white to-blue-50 rounded-xl shadow-sm">
                        <div className="text-base font-semibold mb-1">{g.group}</div>
                        <ProgressRing percent={g.percent} size={48} stroke={6} color="#2563eb" bg="#e0e7ff" />
                        <div className="mt-1 text-xs text-blue-700 font-bold">{g.percent}%</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Most Active Members */}
            <Card className="rounded-2xl shadow-lg">
              <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold">Most Active Members</CardTitle></CardHeader>
              <CardContent>
                {activeMembers.loading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded" />)}
                  </div>
                ) : activeMembers.error ? (
                  <div className="text-red-500">{activeMembers.error}</div>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Group</th>
                        <th className="text-left py-2">Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeMembers.members.map(m => (
                        <tr key={m.name} className="hover:bg-blue-50 transition">
                          <td className="py-2 font-medium">{m.name}</td>
                          <td className="py-2">{m.group}</td>
                          <td className="py-2 text-green-600 font-bold">{m.attendance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* Other tabs can be filled in as needed */}
        <TabsContent value="attendance">
          <div className="text-center text-muted-foreground py-12">[Attendance details coming soon]</div>
        </TabsContent>
        <TabsContent value="donations">
          <div className="text-center text-muted-foreground py-12">[Donations details coming soon]</div>
        </TabsContent>
        <TabsContent value="events">
          <div className="text-center text-muted-foreground py-12">[Events details coming soon]</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;