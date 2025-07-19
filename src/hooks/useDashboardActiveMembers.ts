import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardActiveMembers() {
  const [members, setMembers] = useState<{ name: string; group: string; attendance: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActiveMembers() {
      setLoading(true);
      setError(null);
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
        // Fetch all attendance for this month
        const { data: attendance, error } = await supabase
          .from('attendance')
          .select('member_id, present')
          .gte('attendance_date', monthStart)
          .lte('attendance_date', monthEnd);
        if (error) throw error;
        // Fetch member info
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('id, first_name, last_name, group');
        if (membersError) throw membersError;
        // Calculate attendance percent per member
        const memberMap: Record<string, { total: number; present: number }> = {};
        (attendance || []).forEach((a: any) => {
          if (!a.member_id) return;
          if (!memberMap[a.member_id]) memberMap[a.member_id] = { total: 0, present: 0 };
          memberMap[a.member_id].total++;
          if (a.present) memberMap[a.member_id].present++;
        });
        const result = (membersData || []).map((m: any) => {
          const stats = memberMap[m.id] || { total: 0, present: 0 };
          return {
            name: `${m.first_name} ${m.last_name}`,
            group: m.group || 'Other',
            attendance: stats.total ? `${Math.round((stats.present / stats.total) * 100)}%` : '0%'
          };
        }).sort((a, b) => parseInt(b.attendance) - parseInt(a.attendance)).slice(0, 5);
        setMembers(result);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch active members');
      } finally {
        setLoading(false);
      }
    }
    fetchActiveMembers();
  }, []);

  return { members, loading, error };
} 