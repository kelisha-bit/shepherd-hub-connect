export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  date_of_birth?: string;
  membership_status?: string;
  ministry_involvement?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MemberFormData {
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  date_of_birth?: string;
  membership_status?: string;
  ministry_involvement?: string;
  notes?: string;
}

export interface Donation {
  id: string;
  member_id?: string;
  amount: number;
  donation_type: string;
  payment_method: string;
  donor_name?: string;
  donor_email?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface AttendanceRecord {
  id: string;
  member_id: string;
  event_date: string;
  event_type: string;
  status: 'present' | 'absent' | 'excused';
  notes?: string;
  created_at: string;
}