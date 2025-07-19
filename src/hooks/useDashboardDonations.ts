import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardDonations() {
  const [total, setTotal] = useState<number>(0);
  const [last, setLast] = useState<{ amount: number; date: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDonations() {
      setLoading(true);
      setError(null);
      try {
        const { data: donations, error } = await supabase
          .from('donations')
          .select('amount, donation_date')
          .order('donation_date', { ascending: false });
        if (error) throw error;
        setTotal(donations?.reduce((sum: number, d: any) => sum + Number(d.amount), 0) || 0);
        if (donations && donations.length > 0) {
          setLast({ amount: donations[0].amount, date: donations[0].donation_date });
        } else {
          setLast(null);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to fetch donations');
      } finally {
        setLoading(false);
      }
    }
    fetchDonations();
  }, []);

  return { total, last, loading, error };
} 