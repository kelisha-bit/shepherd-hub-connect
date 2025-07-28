import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, Users, TrendingUp, CalendarCheck, CalendarDays } from "lucide-react";
import { useEventAnalytics } from "@/hooks/useEventAnalytics";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart } from "recharts";

export function EventAnalyticsReport() {
  const [timeRange, setTimeRange] = useState<string>("12m");
  const { periodData, eventTypeBreakdown, topEvents, summary, loading, error } = useEventAnalytics(timeRange);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];
  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading event data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Event Analytics Report</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Time Range Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Time Range</h2>
            <ToggleGroup type="single" value={timeRange} onValueChange={(value) => value && setTimeRange(value)}>
              <ToggleGroupItem value="3m">3 Months</ToggleGroupItem>
              <ToggleGroupItem value="6m">6 Months</ToggleGroupItem>
              <ToggleGroupItem value="12m">1 Year</ToggleGroupItem>
              <ToggleGroupItem value="24m">2 Years</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {summary.totalEvents}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {summary.totalAttendance}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {summary.averageAttendance}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Events and Attendance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Events and Attendance Trend</CardTitle>
          <CardDescription>Monthly breakdown of events and attendance</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart
                data={periodData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="events" name="Events" fill="#8884d8" />
                <Line yAxisId="right" type="monotone" dataKey="attendance" name="Attendance" stroke="#ff7300" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Event Type Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Events by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={eventTypeBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {eventTypeBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [value, props.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>


      </div>

      {/* Top Events */}
      <Card>
        <CardHeader>
          <CardTitle>Top Events by Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {topEvents.length > 0 ? (
                <div className="grid gap-4">
                  {topEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            <Badge variant="outline" className="mr-2">
                              <Calendar className="mr-1 h-3 w-3" />
                              {event.eventType}
                            </Badge>
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="font-semibold">
                        <Users className="inline mr-1 h-4 w-4" />
                        {event.attendanceCount}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No event data available for the selected period.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Event Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Most Popular Event Type:</span>
                  <Badge variant="outline" className="bg-primary/10">
                    <CalendarCheck className="mr-1 h-3 w-3" />
                    {summary.mostPopularEventType}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Most Popular Event Type:</span>
                  <Badge variant="outline" className="bg-primary/10">
                    <CalendarCheck className="mr-1 h-3 w-3" />
                    {summary.mostPopularEventType}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Highest Attendance:</span>
                  <span className="font-semibold">{summary.highestAttendanceCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Highest Attendance Date:</span>
                  <span className="font-semibold">
                    {summary.highestAttendanceDate ? new Date(summary.highestAttendanceDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Event Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Event Type Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {eventTypeBreakdown.map((type, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{type.name}</span>
                    <div>
                      <span className="text-primary font-semibold mr-2">{type.count} events</span>
                      <span className="text-muted-foreground">{type.attendanceCount} attendees</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${type.percent}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">{type.percent}% of total events</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}