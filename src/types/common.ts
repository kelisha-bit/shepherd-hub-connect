export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

export interface Event extends BaseEntity {
  title: string;
  description?: string;
  event_date: string;
  event_type: string;
  location?: string;
  max_attendees?: number;
}

export interface Communication extends BaseEntity {
  title: string;
  message: string;
  type: 'email' | 'sms' | 'announcement';
  status: 'draft' | 'sent' | 'scheduled';
  scheduled_date?: string;
  recipient_count?: number;
}

export interface PrayerRequest extends BaseEntity {
  title: string;
  description: string;
  requester_name: string;
  requester_email?: string;
  status: 'active' | 'answered' | 'archived';
  is_anonymous: boolean;
}

export interface SmallGroup extends BaseEntity {
  name: string;
  description?: string;
  leader_id: string;
  meeting_day: string;
  meeting_time: string;
  location?: string;
  max_members?: number;
  current_members?: number;
}

export interface Sermon extends BaseEntity {
  title: string;
  speaker: string;
  date: string;
  scripture_reference?: string;
  audio_url?: string;
  video_url?: string;
  transcript?: string;
  series?: string;
}

export type ApiResponse<T> = {
  data: T;
  error: null;
} | {
  data: null;
  error: Error;
};

export interface FormError {
  field: string;
  message: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}