import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type MemberGrowthData = {
  period: string;
  newMembers: number;
  totalMembers: number;
  growthRate?: number;
};

export function useMemberGrowth(timeRange: string = '12m') {
  const [growthData, setGrowthData] = useState<MemberGrowthData[]>([]);
  const [membersByType, setMembersByType] = useState<{name: string; value: number}[]>([]);
  const [membersByStatus, setMembersByStatus] = useState<{name: string; value: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMemberGrowth() {
      setLoading(true);
      setError(null);
      try {
        // Get current date and calculate start date based on timeRange
        const endDate = new Date();
        let startDate = new Date();
        const months = parseInt(timeRange.replace('m', ''));
        startDate.setMonth(startDate.getMonth() - months);
        
        // Fetch all members with join dates
        const { data: members, error } = await supabase
          .from('members')
          .select('join_date')
          .gte('join_date', startDate.toISOString().slice(0, 10));

        if (error) throw error;

        // Process data for growth over time
        const monthlyData: Record<string, {newMembers: number; totalMembers: number}> = {};
        
        // Initialize all months in the range
        for (let i = 0; i <= months; i++) {
          const date = new Date(startDate);
          date.setMonth(startDate.getMonth() + i);
          const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          monthlyData[monthKey] = { newMembers: 0, totalMembers: 0 };
        }
        
        // Count new members by month
        let runningTotal = 0;
        members?.forEach(member => {
          if (member.join_date) {
            const joinDate = new Date(member.join_date);
            const monthKey = joinDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            
            if (monthlyData[monthKey]) {
              monthlyData[monthKey].newMembers++;
            }
          }
        });
        
        // Calculate running totals and growth rates
        const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
          return new Date(a).getTime() - new Date(b).getTime();
        });
        
        // Get total members before the start date
        const { count: initialCount } = await supabase
          .from('members')
          .select('*', { count: 'exact' })
          .lt('join_date', startDate.toISOString().slice(0, 10));
        
        runningTotal = initialCount || 0;
        
        const growthDataArray = sortedMonths.map(month => {
          runningTotal += monthlyData[month].newMembers;
          const prevTotal = runningTotal - monthlyData[month].newMembers;
          const growthRate = prevTotal > 0 ? ((monthlyData[month].newMembers / prevTotal) * 100) : 0;
          
          return {
            period: month,
            newMembers: monthlyData[month].newMembers,
            totalMembers: runningTotal,
            growthRate: parseFloat(growthRate.toFixed(2))
          };
        });
        
        setGrowthData(growthDataArray);
        
        // Process data for membership types (with fallback for missing columns)
        const typeCount: Record<string, number> = {};
        const statusCount: Record<string, number> = {};
        
        // Try to fetch membership data separately to handle missing columns gracefully
        try {
          const { data: membershipData, error: membershipError } = await supabase
            .from('members')
            .select('membership_type, member_status')
            .gte('join_date', startDate.toISOString().slice(0, 10));
          
          if (membershipError) {
            throw membershipError;
          }
          
          membershipData?.forEach(member => {
            // Count by membership type
            const type = member.membership_type || 'Regular';
            typeCount[type] = (typeCount[type] || 0) + 1;
            
            // Count by status
            const status = member.member_status || 'Active';
            statusCount[status] = (statusCount[status] || 0) + 1;
          });
        } catch (membershipError) {
          // If membership columns don't exist, use default values
          console.warn('Membership columns not available, using defaults:', membershipError);
          typeCount['Regular'] = members?.length || 0;
          statusCount['Active'] = members?.length || 0;
        }
        
        setMembersByType(Object.entries(typeCount).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
          value
        })));
        
        setMembersByStatus(Object.entries(statusCount).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
          value
        })));
        
      } catch (e: any) {
        setError(e.message || 'Failed to fetch member growth data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMemberGrowth();
  }, [timeRange]);

  return { growthData, membersByType, membersByStatus, loading, error };
}