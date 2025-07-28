-- Fix for prayer_requests table missing is_public column
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the prayer_requests table if it exists
DROP TABLE IF EXISTS public.prayer_requests CASCADE;

-- Step 2: Recreate the prayer_requests table with correct structure
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

-- Step 3: Create indexes
CREATE INDEX idx_prayer_requests_requester_id ON public.prayer_requests(requester_id);
CREATE INDEX idx_prayer_requests_status ON public.prayer_requests(status);

-- Step 4: Enable RLS
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view public prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can view their own prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can manage their own prayer requests" ON public.prayer_requests;

-- Step 6: Create RLS policies
CREATE POLICY "Users can view public prayer requests" ON public.prayer_requests 
FOR SELECT TO authenticated USING (is_public = true);

CREATE POLICY "Users can view their own prayer requests" ON public.prayer_requests 
FOR SELECT TO authenticated USING (requester_id = auth.uid());

CREATE POLICY "Users can manage their own prayer requests" ON public.prayer_requests 
FOR ALL TO authenticated USING (requester_id = auth.uid());

-- Step 7: Create trigger for updated_at
CREATE TRIGGER update_prayer_requests_updated_at
  BEFORE UPDATE ON public.prayer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 8: Grant permissions
GRANT ALL ON public.prayer_requests TO authenticated;

-- Step 9: Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'prayer_requests' 
AND table_schema = 'public'
ORDER BY ordinal_position; 