import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardGroups() {
  const [groups, setGroups] = useState<{ group: string; percent: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGroups() {
      setLoading(true);
      setError(null);
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
        const { data, error } = await supabase
          .from('attendance')
          .select('group, present')
          .gte('attendance_date', monthStart)
          .lte('attendance_date', monthEnd);
        if (error) throw error;
        const groupMap: Record<string, { total: number; present: number }> = {};
        (data || []).forEach((a: any) => {
          const group = a.group || 'Other';
          if (!groupMap[group]) groupMap[group] = { total: 0, present: 0 };
          groupMap[group].total++;
          if (a.present) groupMap[group].present++;
        });
        const stats = Object.entries(groupMap).map(([group, { total, present }]) => ({
          group,
          percent: total ? Math.round((present / total) * 100) : 0
        }));
        setGroups(stats);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch group stats');
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, []);

  return { groups, loading, error };
} 