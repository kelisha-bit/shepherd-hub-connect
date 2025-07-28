-- Fix for "column sender_id does not exist" error
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the communications table if it exists
DROP TABLE IF EXISTS public.communications CASCADE;

-- Step 2: Create the communications table with correct structure
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

-- Step 3: Create indexes
CREATE INDEX idx_communications_sender_id ON public.communications(sender_id);
CREATE INDEX idx_communications_status ON public.communications(status);

-- Step 4: Enable RLS
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
CREATE POLICY "Authenticated users can view communications" ON public.communications 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage communications" ON public.communications 
FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Step 6: Create trigger for updated_at
CREATE TRIGGER update_communications_updated_at
  BEFORE UPDATE ON public.communications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 7: Grant permissions
GRANT ALL ON public.communications TO authenticated;

-- Step 8: Verify the table was created correctly
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'communications' 
AND table_schema = 'public'
ORDER BY ordinal_position; 