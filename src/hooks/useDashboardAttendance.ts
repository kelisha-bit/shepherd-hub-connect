import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardAttendance() {
  const [data, setData] = useState<{ month: string; value: number }[]>([]);
  const [percent, setPercent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAttendance() {
      setLoading(true);
      setError(null);
      try {
        const { data: attendance, error } = await supabase
          .from('attendance')
          .select('attendance_date, present')
          .order('attendance_date');
        if (error) throw error;
        // Group by month
        const monthly: Record<string, { total: number; present: number }> = {};
        attendance?.forEach((a: any) => {
          const date = new Date(a.attendance_date);
          const month = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          if (!monthly[month]) monthly[month] = { total: 0, present: 0 };
          monthly[month].total++;
          if (a.present) monthly[month].present++;
        });
        const chartData = Object.entries(monthly).map(([month, { present }]) => ({ month, value: present }));
        setData(chartData);
        // Calculate percent for the latest month
        const months = Object.keys(monthly);
        if (months.length > 0) {
          const lastMonth = months[months.length - 1];
          const { total, present } = monthly[lastMonth];
          setPercent(total ? Math.round((present / total) * 100) : 0);
        } else {
          setPercent(0);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to fetch attendance');
      } finally {
        setLoading(false);
      }
    }
    fetchAttendance();
  }, []);

  return { data, percent, loading, error };
} 