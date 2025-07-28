-- Fix Communications Table Error
-- This migration fixes the "column sender_id does not exist" error

-- First, drop the communications table if it exists with wrong structure
DROP TABLE IF EXISTS public.communications CASCADE;

-- Recreate the communications table with correct structure
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

-- Create index for sender_id
CREATE INDEX IF NOT EXISTS idx_communications_sender_id ON public.communications(sender_id);
CREATE INDEX IF NOT EXISTS idx_communications_status ON public.communications(status);

-- Enable RLS
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

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

-- Create trigger for updated_at
CREATE TRIGGER update_communications_updated_at
  BEFORE UPDATE ON public.communications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.communications TO authenticated; 