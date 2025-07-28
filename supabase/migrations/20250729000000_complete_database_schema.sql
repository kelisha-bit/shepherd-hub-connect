-- Complete Database Schema Migration
-- This migration creates all missing tables referenced in the application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (referenced in auth context and settings)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'staff', 'member', 'visitor')),
  avatar_url TEXT,
  phone_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  date_of_birth DATE,
  join_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create events table (referenced in multiple components)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  event_type TEXT DEFAULT 'service' CHECK (event_type IN ('service', 'meeting', 'social', 'outreach', 'youth', 'children', 'other')),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  image_url TEXT,
  created_by UUID REFERENCES public.members(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create donations table (referenced in multiple components)
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  amount NUMERIC(12,2) NOT NULL,
  donation_type TEXT DEFAULT 'tithe' CHECK (donation_type IN ('tithe', 'offering', 'special', 'building', 'mission', 'other')),
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'check', 'card', 'online', 'bank_transfer')),
  donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_number TEXT,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sermons table (referenced in sermon library)
CREATE TABLE IF NOT EXISTS public.sermons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  preacher TEXT NOT NULL,
  date DATE NOT NULL,
  scripture_reference TEXT,
  audio_url TEXT,
  video_url TEXT,
  notes_url TEXT,
  duration INTEGER, -- in seconds
  series TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create prayer_requests table (referenced in prayer requests)
CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requester_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'answered', 'archived')),
  is_private BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create small_groups table (referenced in small groups)
CREATE TABLE IF NOT EXISTS public.small_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID NOT NULL REFERENCES public.members(id),
  meeting_day TEXT,
  meeting_time TEXT,
  meeting_location TEXT,
  max_members INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create communications table (referenced in communication center)
CREATE TABLE IF NOT EXISTS public.communications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.members(id),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('all', 'members', 'staff', 'specific')),
  recipient_ids UUID[],
  communication_type TEXT NOT NULL CHECK (communication_type IN ('email', 'sms', 'announcement')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'scheduled', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create income_categories table (referenced in finance)
CREATE TABLE IF NOT EXISTS public.income_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create incomes table (referenced in finance)
CREATE TABLE IF NOT EXISTS public.incomes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  amount NUMERIC(12,2) NOT NULL,
  income_date DATE NOT NULL,
  category_id UUID REFERENCES public.income_categories(id),
  member_id UUID REFERENCES public.members(id),
  donation_id UUID REFERENCES public.donations(id),
  description TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create expense_categories table (referenced in finance)
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create expenses table (referenced in finance)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  amount NUMERIC(12,2) NOT NULL,
  expense_date DATE NOT NULL,
  category_id UUID REFERENCES public.expense_categories(id),
  description TEXT NOT NULL,
  vendor TEXT,
  receipt_url TEXT,
  approved_by UUID REFERENCES public.members(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create financial_goals table (referenced in finance)
CREATE TABLE IF NOT EXISTS public.financial_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC(12,2) NOT NULL,
  current_amount NUMERIC(12,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event_attendance_counts table (referenced in mobile app)
CREATE TABLE IF NOT EXISTS public.event_attendance_counts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  total_attendees INTEGER DEFAULT 0,
  adults_count INTEGER DEFAULT 0,
  children_count INTEGER DEFAULT 0,
  youth_count INTEGER DEFAULT 0,
  visitors_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, event_date)
);

-- Create storage buckets for file uploads
-- Note: These need to be created in Supabase Storage, not as database tables
-- But we'll create tables to track file metadata

-- Create profile_pictures table (referenced in member profile)
CREATE TABLE IF NOT EXISTS public.profile_pictures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event_images table (referenced in events)
CREATE TABLE IF NOT EXISTS public.event_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create hero_images table (referenced in dashboard)
CREATE TABLE IF NOT EXISTS public.hero_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_donations_date ON public.donations(donation_date);
CREATE INDEX IF NOT EXISTS idx_donations_member_id ON public.donations(member_id);
CREATE INDEX IF NOT EXISTS idx_sermons_date ON public.sermons(date);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_requester_id ON public.prayer_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_status ON public.prayer_requests(status);
CREATE INDEX IF NOT EXISTS idx_small_groups_leader_id ON public.small_groups(leader_id);
CREATE INDEX IF NOT EXISTS idx_communications_sender_id ON public.communications(sender_id);
CREATE INDEX IF NOT EXISTS idx_communications_status ON public.communications(status);
CREATE INDEX IF NOT EXISTS idx_incomes_date ON public.incomes(income_date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_event_attendance_counts_event_id ON public.event_attendance_counts(event_id);

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'profiles', 'events', 'donations', 'sermons', 'prayer_requests', 
      'small_groups', 'communications', 'income_categories', 'incomes',
      'expense_categories', 'expenses', 'financial_goals', 
      'event_attendance_counts', 'profile_pictures', 'event_images', 'hero_images'
    )
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END $$;

-- Insert default income categories
INSERT INTO public.income_categories (name, description) VALUES
  ('Tithes', 'Regular tithes from members'),
  ('General Offering', 'General offerings during services'),
  ('Prophetic seed', 'Prophetic seed offerings'),
  ('Thanksgiving', 'Thanksgiving offerings'),
  ('Pledge', 'Pledge payments'),
  ('Wednesday offering', 'Wednesday service offerings'),
  ('Others', 'Other income sources')
ON CONFLICT (name) DO NOTHING;

-- Insert default expense categories
INSERT INTO public.expense_categories (name, description) VALUES
  ('Utilities', 'Electricity, water, gas, internet'),
  ('Maintenance', 'Building and equipment maintenance'),
  ('Staff Salaries', 'Employee and staff compensation'),
  ('Office Supplies', 'Office and administrative supplies'),
  ('Outreach Programs', 'Community outreach and missions'),
  ('Events', 'Special events and celebrations'),
  ('Technology', 'Software, hardware, and IT services'),
  ('Insurance', 'Property and liability insurance'),
  ('Taxes', 'Property taxes and other taxes'),
  ('Other', 'Miscellaneous expenses')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security on all tables
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'profiles', 'events', 'donations', 'sermons', 'prayer_requests', 
      'small_groups', 'communications', 'income_categories', 'incomes',
      'expense_categories', 'expenses', 'financial_goals', 
      'event_attendance_counts', 'profile_pictures', 'event_images', 'hero_images'
    )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);
  END LOOP;
END $$;

-- Create basic RLS policies (these can be enhanced later)
-- Profiles: Users can view all, update their own
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Events: Authenticated users can view, admins can manage
CREATE POLICY "Authenticated users can view events" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Donations: Authenticated users can view, admins can manage
CREATE POLICY "Authenticated users can view donations" ON public.donations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage donations" ON public.donations FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Sermons: Everyone can view, admins can manage
CREATE POLICY "Everyone can view sermons" ON public.sermons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage sermons" ON public.sermons FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Prayer requests: Users can view public ones, manage their own
CREATE POLICY "Users can view public prayer requests" ON public.prayer_requests FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "Users can view their own prayer requests" ON public.prayer_requests FOR SELECT TO authenticated USING (requester_id = auth.uid());
CREATE POLICY "Users can manage their own prayer requests" ON public.prayer_requests FOR ALL TO authenticated USING (requester_id = auth.uid());

-- Small groups: Authenticated users can view, admins can manage
CREATE POLICY "Authenticated users can view small groups" ON public.small_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage small groups" ON public.small_groups FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Communications: Authenticated users can view, admins can manage
CREATE POLICY "Authenticated users can view communications" ON public.communications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage communications" ON public.communications FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Finance tables: Admins only
CREATE POLICY "Admins can manage income categories" ON public.income_categories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage incomes" ON public.incomes FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage expense categories" ON public.expense_categories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage expenses" ON public.expenses FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage financial goals" ON public.financial_goals FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Event attendance counts: Authenticated users can view, admins can manage
CREATE POLICY "Authenticated users can view attendance counts" ON public.event_attendance_counts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage attendance counts" ON public.event_attendance_counts FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- File tables: Users can view, admins can manage
CREATE POLICY "Users can view profile pictures" ON public.profile_pictures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their own profile pictures" ON public.profile_pictures FOR ALL TO authenticated USING (member_id = auth.uid());

CREATE POLICY "Users can view event images" ON public.event_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage event images" ON public.event_images FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view hero images" ON public.hero_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage hero images" ON public.hero_images FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Create function to sync member data with profile
CREATE OR REPLACE FUNCTION public.sync_member_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile when member is updated
  UPDATE public.profiles 
  SET 
    email = NEW.email,
    first_name = NEW.first_name,
    last_name = NEW.last_name,
    phone_number = NEW.phone_number,
    address = NEW.address,
    city = NEW.city,
    state = NEW.state,
    postal_code = NEW.postal_code,
    country = NEW.country,
    date_of_birth = NEW.date_of_birth,
    updated_at = now()
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync member data with profile
DROP TRIGGER IF EXISTS sync_member_profile_trigger ON public.members;
CREATE TRIGGER sync_member_profile_trigger
  AFTER UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_member_profile();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create a view for member statistics
CREATE OR REPLACE VIEW public.member_statistics AS
SELECT 
  COUNT(*) as total_members,
  COUNT(CASE WHEN member_status = 'active' THEN 1 END) as active_members,
  COUNT(CASE WHEN member_status = 'inactive' THEN 1 END) as inactive_members,
  COUNT(CASE WHEN join_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_members_30_days,
  COUNT(CASE WHEN join_date >= CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as new_members_90_days
FROM public.members;

-- Grant access to the view
GRANT SELECT ON public.member_statistics TO authenticated;

-- Create a view for donation statistics
CREATE OR REPLACE VIEW public.donation_statistics AS
SELECT 
  COUNT(*) as total_donations,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount,
  COUNT(CASE WHEN donation_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as donations_30_days,
  SUM(CASE WHEN donation_date >= CURRENT_DATE - INTERVAL '30 days' THEN amount ELSE 0 END) as amount_30_days
FROM public.donations;

-- Grant access to the view
GRANT SELECT ON public.donation_statistics TO authenticated; 