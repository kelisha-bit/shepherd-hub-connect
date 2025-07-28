-- Comprehensive Table Fixes
-- This script fixes all potential column mismatches

-- Fix prayer_requests table
DROP TABLE IF EXISTS public.prayer_requests CASCADE;
CREATE TABLE public.prayer_requests (
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

-- Fix communications table
DROP TABLE IF EXISTS public.communications CASCADE;
CREATE TABLE public.communications (
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

-- Fix small_groups table
DROP TABLE IF EXISTS public.small_groups CASCADE;
CREATE TABLE public.small_groups (
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

-- Create indexes
CREATE INDEX idx_prayer_requests_requester_id ON public.prayer_requests(requester_id);
CREATE INDEX idx_prayer_requests_status ON public.prayer_requests(status);
CREATE INDEX idx_communications_sender_id ON public.communications(sender_id);
CREATE INDEX idx_communications_status ON public.communications(status);
CREATE INDEX idx_small_groups_leader_id ON public.small_groups(leader_id);

-- Enable RLS
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.small_groups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view public prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can view their own prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can manage their own prayer requests" ON public.prayer_requests;

DROP POLICY IF EXISTS "Authenticated users can view communications" ON public.communications;
DROP POLICY IF EXISTS "Admins can manage communications" ON public.communications;

DROP POLICY IF EXISTS "Authenticated users can view small groups" ON public.small_groups;
DROP POLICY IF EXISTS "Admins can manage small groups" ON public.small_groups;

-- Create RLS policies for prayer_requests
CREATE POLICY "Users can view public prayer requests" ON public.prayer_requests 
FOR SELECT TO authenticated USING (is_public = true);

CREATE POLICY "Users can view their own prayer requests" ON public.prayer_requests 
FOR SELECT TO authenticated USING (requester_id = auth.uid());

CREATE POLICY "Users can manage their own prayer requests" ON public.prayer_requests 
FOR ALL TO authenticated USING (requester_id = auth.uid());

-- Create RLS policies for communications
CREATE POLICY "Authenticated users can view communications" ON public.communications 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage communications" ON public.communications 
FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create RLS policies for small_groups
CREATE POLICY "Authenticated users can view small groups" ON public.small_groups 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage small groups" ON public.small_groups 
FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create triggers
CREATE TRIGGER update_prayer_requests_updated_at
  BEFORE UPDATE ON public.prayer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_communications_updated_at
  BEFORE UPDATE ON public.communications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_small_groups_updated_at
  BEFORE UPDATE ON public.small_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.prayer_requests TO authenticated;
GRANT ALL ON public.communications TO authenticated;
GRANT ALL ON public.small_groups TO authenticated;

-- Verify table structures
SELECT 'prayer_requests' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'prayer_requests' AND table_schema = 'public'
UNION ALL
SELECT 'communications' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'communications' AND table_schema = 'public'
UNION ALL
SELECT 'small_groups' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'small_groups' AND table_schema = 'public'
ORDER BY table_name, column_name; 