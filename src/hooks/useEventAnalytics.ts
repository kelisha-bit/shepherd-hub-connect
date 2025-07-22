import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type EventAttendanceData = {
  period: string;
  attendanceCount: number;
  eventCount: number;
  averageAttendance: number;
};

type EventTypeBreakdown = {
  name: string;
  count: number;
  attendanceCount: number;
  averageAttendance: number;
  percent: number;
};

type TopEvent = {
  id: string;
  title: string;
  date: string;
  attendanceCount: number;
  eventType: string;
};

export function useEventAnalytics(timeRange: string = '12m') {
  const [periodData, setPeriodData] = useState<EventAttendanceData[]>([]);
  const [eventTypeBreakdown, setEventTypeBreakdown] = useState<EventTypeBreakdown[]>([]);
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [summary, setSummary] = useState({
    totalEvents: 0,
    totalAttendance: 0,
    averageAttendance: 0,
    mostPopularEventType: '',
    highestAttendanceDate: '',
    highestAttendanceCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEventData() {
      setLoading(true);
      setError(null);
      try {
        // Get current date and calculate start date based on timeRange
        const endDate = new Date();
        let startDate = new Date();
        const months = parseInt(timeRange.replace('m', ''));
        startDate.setMonth(startDate.getMonth() - months);
        
        // Fetch events
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('id, title, event_date, event_type')
          .gte('event_date', startDate.toISOString().slice(0, 10))
          .order('event_date');

        if (eventsError) throw eventsError;

        // Fetch attendance records
        const { data: attendance, error: attendanceError } = await supabase
          .from('attendance')
          .select('id, event_id, attendance_date, present')
          .gte('attendance_date', startDate.toISOString().slice(0, 10));

        if (attendanceError) throw attendanceError;

        // Process data by period (month)
        const monthlyData: Record<string, {attendanceCount: number; eventCount: number}> = {};
        
        // Initialize all months in the range
        for (let i = 0; i <= months; i++) {
          const date = new Date(startDate);
          date.setMonth(startDate.getMonth() + i);
          const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          monthlyData[monthKey] = { attendanceCount: 0, eventCount: 0 };
        }
        
        // Count events by month
        events?.forEach(event => {
          const date = new Date(event.event_date);
          const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].eventCount++;
          }
        });
        
        // Count attendance by month
        attendance?.forEach(record => {
          if (record.present) {
            const date = new Date(record.attendance_date);
            const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            
            if (monthlyData[monthKey]) {
              monthlyData[monthKey].attendanceCount++;
            }
          }
        });
        
        // Convert to array and calculate averages
        const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
          return new Date(a).getTime() - new Date(b).getTime();
        });
        
        const eventData = sortedMonths.map(month => ({
          period: month,
          attendanceCount: monthlyData[month].attendanceCount,
          eventCount: monthlyData[month].eventCount,
          averageAttendance: monthlyData[month].eventCount > 0 
            ? parseFloat((monthlyData[month].attendanceCount / monthlyData[month].eventCount).toFixed(2))
            : 0
        }));
        
        setPeriodData(eventData);
        
        // Process events by type
        const eventTypes: Record<string, {count: number; attendanceCount: number}> = {};
        let totalEvents = 0;
        
        // Create a map of event IDs to their types
        const eventTypeMap: Record<string, string> = {};
        events?.forEach(event => {
          eventTypeMap[event.id] = event.event_type || 'Uncategorized';
          const eventType = event.event_type || 'Uncategorized';
          
          if (!eventTypes[eventType]) {
            eventTypes[eventType] = { count: 0, attendanceCount: 0 };
          }
          
          eventTypes[eventType].count++;
          totalEvents++;
        });
        
        // Count attendance by event type
        attendance?.forEach(record => {
          if (record.present && record.event_id && eventTypeMap[record.event_id]) {
            const eventType = eventTypeMap[record.event_id];
            eventTypes[eventType].attendanceCount++;
          }
        });
        
        // Calculate percentages and format event type data
        const eventTypeData = Object.entries(eventTypes).map(([name, data]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
          count: data.count,
          attendanceCount: data.attendanceCount,
          averageAttendance: data.count > 0 
            ? parseFloat((data.attendanceCount / data.count).toFixed(2))
            : 0,
          percent: parseFloat(((data.count / totalEvents) * 100).toFixed(2))
        })).sort((a, b) => b.attendanceCount - a.attendanceCount);
        
        setEventTypeBreakdown(eventTypeData);
        
        // Process attendance by event to find top events
        const eventAttendance: Record<string, number> = {};
        
        attendance?.forEach(record => {
          if (record.present && record.event_id) {
            eventAttendance[record.event_id] = (eventAttendance[record.event_id] || 0) + 1;
          }
        });
        
        // Map event IDs to event details and get top events by attendance
        const eventMap: Record<string, {title: string; date: string; type: string}> = {};
        events?.forEach(event => {
          eventMap[event.id] = {
            title: event.title,
            date: event.event_date,
            type: event.event_type || 'Uncategorized'
          };
        });
        
        const topEventsList = Object.entries(eventAttendance)
          .map(([id, count]) => ({
            id,
            title: eventMap[id]?.title || 'Unknown Event',
            date: eventMap[id]?.date || '',
            attendanceCount: count,
            eventType: eventMap[id]?.type || 'Uncategorized'
          }))
          .sort((a, b) => b.attendanceCount - a.attendanceCount)
          .slice(0, 5);
        
        setTopEvents(topEventsList);
        
        // Calculate summary statistics
        const totalAttendance = attendance?.filter(a => a.present).length || 0;
        const avgAttendance = totalEvents > 0 ? totalAttendance / totalEvents : 0;
        
        const mostPopularType = eventTypeData.length > 0 ? eventTypeData[0].name : 'None';
        
        let highestAttendanceEvent = { date: '', count: 0 };
        if (topEventsList.length > 0) {
          highestAttendanceEvent = {
            date: topEventsList[0].date,
            count: topEventsList[0].attendanceCount
          };
        }
        
        setSummary({
          totalEvents,
          totalAttendance,
          averageAttendance: parseFloat(avgAttendance.toFixed(2)),
          mostPopularEventType: mostPopularType,
          highestAttendanceDate: highestAttendanceEvent.date,
          highestAttendanceCount: highestAttendanceEvent.count
        });
        
      } catch (e: any) {
        setError(e.message || 'Failed to fetch event analytics data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchEventData();
  }, [timeRange]);

  return { 
    periodData, 
    eventTypeBreakdown, 
    topEvents,
    summary,
    loading, 
    error 
  };
}