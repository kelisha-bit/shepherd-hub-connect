import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

function getNextBirthday(dateOfBirth: string) {
  const now = new Date();
  const dob = new Date(dateOfBirth);
  const thisYear = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
  if (thisYear >= now) return thisYear;
  return new Date(now.getFullYear() + 1, dob.getMonth(), dob.getDate());
}

export function useDashboardBirthdays() {
  const [birthdays, setBirthdays] = useState<{ name: string; date_of_birth: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBirthdays() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('members')
          .select('first_name, last_name, date_of_birth');
        if (error) throw error;
        const now = new Date();
        const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const upcoming = (data || [])
          .filter((m: any) => m.date_of_birth)
          .map((m: any) => ({
            name: `${m.first_name} ${m.last_name}`,
            date_of_birth: m.date_of_birth,
            nextBirthday: getNextBirthday(m.date_of_birth)
          }))
          .filter(m => m.nextBirthday >= now && m.nextBirthday <= in30)
          .sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime())
          .map(m => ({ name: m.name, date_of_birth: m.date_of_birth }));
        setBirthdays(upcoming);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch birthdays');
      } finally {
        setLoading(false);
      }
    }
    fetchBirthdays();
  }, []);

  return { birthdays, loading, error };
} 