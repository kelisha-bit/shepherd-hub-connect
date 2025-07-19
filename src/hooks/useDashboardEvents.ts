import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardEvents() {
  const [events, setEvents] = useState<{ title: string; event_date: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError(null);
      try {
        const today = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabase
          .from('events')
          .select('title, event_date')
          .gte('event_date', today)
          .order('event_date', { ascending: true });
        if (error) throw error;
        setEvents(data || []);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return { events, loading, error };
} 