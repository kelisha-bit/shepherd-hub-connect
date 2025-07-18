import { supabase } from './client';
import type { Database } from './types';

// Types for convenience
export type AttendanceRow = Database['public']['Tables']['attendance']['Row'];
export type AttendanceInsert = Database['public']['Tables']['attendance']['Insert'];
export type AttendanceUpdate = Database['public']['Tables']['attendance']['Update'];

// Fetch attendance records with optional filters
export async function fetchAttendance({
  date,
  service_type,
  member_id,
  group,
  from,
  to,
  limit = 100,
  offset = 0,
}: {
  date?: string;
  service_type?: string;
  member_id?: string;
  group?: string;
  from?: string; // start date
  to?: string;   // end date
  limit?: number;
  offset?: number;
} = {}) {
  let query = supabase
    .from('attendance')
    .select('*')
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (date) query = query.eq('date', date);
  if (service_type) query = query.eq('service_type', service_type);
  if (member_id) query = query.eq('member_id', member_id);
  if (group) query = query.eq('group', group);
  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);

  const { data, error } = await query;
  if (error) throw error;
  return data as AttendanceRow[];
}

// Add a new attendance record
export async function addAttendance(record: AttendanceInsert) {
  const { data, error } = await supabase
    .from('attendance')
    .insert([record])
    .select()
    .single();
  if (error) throw error;
  return data as AttendanceRow;
}

// Update an attendance record
export async function updateAttendance(id: string, updates: AttendanceUpdate) {
  const { data, error } = await supabase
    .from('attendance')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as AttendanceRow;
}

// Delete an attendance record
export async function deleteAttendance(id: string) {
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
} 