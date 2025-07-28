import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  UserCheck, 
  Heart,
  MessageSquare,
  Bell,
  Plus,
  ArrowRight,
  Cake,
  MapPin,
  Clock,
  Star,
  Activity,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useDashboardAttendance } from '@/hooks/useDashboardAttendance';
import { useDashboardDonations } from '@/hooks/useDashboardDonations';
import { useDashboardEvents } from '@/hooks/useDashboardEvents';
import { useDashboardBirthdays } from '@/hooks/useDashboardBirthdays';
import { useDashboardGroups } from '@/hooks/useDashboardGroups';
import { useDashboardActiveMembers } from '@/hooks/useDashboardActiveMembers';
import { supabase } from '@/integrations/supabase/client';

// Modern metric card component
const MetricCard = ({ title, value, change, changeType, icon: Icon, color = "blue", subtitle }: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: any;
  color?: string;
  subtitle?: string;
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    pink: 'bg-pink-50 text-pink-600 border-pink-100'
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl ${colorClasses[color as keyof typeof colorClasses]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
              {change && (
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  changeType === 'up' ? 'text-green-600' : 
                  changeType === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
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

const Dashboard: React.FC = () => {
  // Dashboard hooks
  const attendance = useDashboardAttendance();
  const donations = useDashboardDonations();
  const events = useDashboardEvents();
  const birthdays = useDashboardBirthdays();
  const groups = useDashboardGroups();
  const activeMembers = useDashboardActiveMembers();

  // State for dashboard data
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState<any[]>([]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setMembersLoading(true);
      
      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*');
      if (!membersError && membersData) setMembers(membersData);
      
      // Fetch notifications (mock data for now)
      setNotifications([
        { title: 'Upcoming Event', message: 'Youth meeting tomorrow at 7 PM', type: 'info' },
        { title: 'Birthday Alert', message: '3 members have birthdays this week', type: 'celebration' },
        { title: 'Low Attendance', message: 'Last Sunday attendance was below average', type: 'warning' },
      ]);
      
      setMembersLoading(false);
    };
    
    fetchDashboardData();
  }, []);

  // Fetch hero image from Supabase storage
  // Fetch hero image from Supabase storage
  const fetchHeroImage = async () => {
      try {
        setHeroImageLoading(true);
        
        // First, check if the file exists in storage
        const { data: fileData, error: fileError } = await supabase.storage
          .from('hero-images')
          .list('', {
            limit: 100,
            search: 'church-event-poster'
          });
        
        // Check if we found any files matching our pattern
        const heroFile = fileData?.find(file => 
          file.name.startsWith('church-event-poster') && 
          (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.png'))
        );
        
        if (heroFile && !fileError) {
          // File exists, get the public URL
          const { data } = supabase.storage
            .from('hero-images')
            .getPublicUrl(heroFile.name);
          
          if (data?.publicUrl) {
            // Test if the image actually loads
            const img = new Image();
            img.onload = () => {
              setHeroImage(data.publicUrl);
            };
            img.onerror = () => {
              console.warn('Hero image failed to load, using placeholder');
              setHeroImage('/placeholder.svg');
            };
            img.src = data.publicUrl;
          } else {
            setHeroImage('/placeholder.svg');
          }
        } else {
          // File doesn't exist, use placeholder
          console.log('No hero image found in storage, using placeholder');
          setHeroImage('/placeholder.svg');
        }
      } catch (error) {
        console.error('Error fetching hero image:', error);
        // Fallback to placeholder
        setHeroImage('/placeholder.svg');
      } finally {
        setHeroImageLoading(false);
      }
    };

  // Call fetchHeroImage on mount
  React.useEffect(() => {
    fetchHeroImage();
  }, []);

  // Upload hero image function
  const uploadHeroImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `church-event-poster.${fileExt}`;
      // The filePath should be just the filename, not prefixed with the bucket name
      const filePath = fileName;
      
      const { error } = await supabase.storage
        .from('hero-images')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600',
          contentType: file.type,
        });
      
      if (error) throw error;
      // Refetch hero image to update UI and bust cache
      await fetchHeroImage();
      return true;
    } catch (error) {
      console.error('Error uploading hero image:', error);
      throw error;
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-2 sm:p-4 space-y-4 sm:space-y-8">
      {/* Hero Poster Container */}
      <div className="w-full h-48 sm:h-64 md:h-72 lg:h-80 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
        <div className="relative w-full h-full bg-gradient-to-br from-primary/20 to-primary/10">
          {/* Placeholder Image */}
          <img 
            src={heroImage} 
            alt="Church Event Poster" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Overlay with text */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300">
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Upcoming Church Event</h2>
              <p className="text-sm sm:text-base opacity-90">Join us for an inspiring service this Sunday</p>
            </div>
          </div>
          {/* Click indicator */}
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Hero Image Upload Interface */}
      <div className="bg-card border rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Upload Hero Image</h3>
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Show preview
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setHeroImage(e.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Recommended: 1200x400px, JPG/PNG, under 2MB
            </p>
          </div>
          <button
            onClick={async () => {
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
              const file = fileInput?.files?.[0];
              if (file) {
                try {
                  setHeroImageLoading(true);
                  await uploadHeroImage(file);
                  alert('Hero image uploaded successfully!');
                } catch (error) {
                  console.error('Upload failed:', error);
                  alert('Upload failed. Please try again.');
                } finally {
                  setHeroImageLoading(false);
                }
              } else {
                alert('Please select an image first.');
              }
            }}
            disabled={heroImageLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {heroImageLoading ? 'Uploading...' : 'Upload to Supabase'}
          </button>
        </div>
      </div>

      {/* Welcome Header */}
      <div className="animate-fade-in">
        <div className="text-center space-y-1 sm:space-y-2 mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Church Management Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 animate-scale-in">
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md hover:shadow-xl hover:scale-[1.03] hover:z-10 transition-all duration-300 focus-within:shadow-xl focus-within:scale-[1.03]">
          <CardContent className="p-3 sm:p-4 md:p-6">
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

        {/* Removed Total Donations Card */}

        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md hover:shadow-xl hover:scale-[1.03] hover:z-10 transition-all duration-300 focus-within:shadow-xl focus-within:scale-[1.03]">
          <CardContent className="p-3 sm:p-4 md:p-6">
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

        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md hover:shadow-xl hover:scale-[1.03] hover:z-10 transition-all duration-300 focus-within:shadow-xl focus-within:scale-[1.03]">
          <CardContent className="p-3 sm:p-4 md:p-6">
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

      {/* Demographics & Age Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Gender Distribution Panel */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Member Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <Skeleton className="h-32 w-full rounded-xl" />
            ) : (
              <ChartContainer className="h-40" config={{ gender: { color: 'hsl(var(--primary))', label: 'Gender' } }}>
                <ReBarChart
                  data={(() => {
                    const genderCounts = members.reduce((acc, m) => {
                      const gender = (m.gender || 'Other').toLowerCase();
                      acc[gender] = (acc[gender] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    return Object.entries(genderCounts).map(([gender, count]) => ({
                      gender: gender.charAt(0).toUpperCase() + gender.slice(1),
                      count
                    }));
                  })()}
                  layout="vertical"
                  width={320}
                  height={160}
                  margin={{ left: 24, right: 24, top: 8, bottom: 8 }}
                >
                  <XAxis type="number" className="text-xs" allowDecimals={false} />
                  <YAxis dataKey="gender" type="category" className="text-xs" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6,6,6,6]} barSize={24} />
                </ReBarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Age Distribution Panel */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Member Age Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <Skeleton className="h-40 w-full rounded-xl" />
            ) : (
              <ChartContainer className="h-40" config={{ age: { color: 'hsl(var(--accent))', label: 'Age Group' } }}>
                <ReBarChart
                  data={(() => {
                    // Helper to get age from date_of_birth
                    const getAge = (dob: string) => {
                      if (!dob) return null;
                      const birth = new Date(dob);
                      if (isNaN(birth.getTime())) return null;
                      const today = new Date();
                      let age = today.getFullYear() - birth.getFullYear();
                      const m = today.getMonth() - birth.getMonth();
                      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                      return age;
                    };
                    // Age brackets
                    const brackets = [
                      { label: '0–17', min: 0, max: 17 },
                      { label: '18–25', min: 18, max: 25 },
                      { label: '26–40', min: 26, max: 40 },
                      { label: '41–60', min: 41, max: 60 },
                      { label: '60+', min: 61, max: 200 },
                    ];
                    const counts = brackets.map(b => ({ ...b, count: 0 }));
                    members.forEach(m => {
                      const age = getAge(m.date_of_birth);
                      if (age === null || age < 0) return;
                      for (const b of counts) {
                        if (age >= b.min && age <= b.max) {
                          b.count++;
                          break;
                        }
                      }
                    });
                    return counts.map(b => ({ group: b.label, count: b.count }));
                  })()}
                  width={320}
                  height={160}
                  margin={{ left: 24, right: 24, top: 8, bottom: 8 }}
                >
                  <XAxis dataKey="group" className="text-xs" />
                  <YAxis className="text-xs" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[6,6,0,0]} barSize={24} />
                </ReBarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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