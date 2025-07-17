-- Create visitors table
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visited_before BOOLEAN DEFAULT false,
  how_did_you_hear_about_us TEXT,
  notes TEXT,
  follow_up_required BOOLEAN DEFAULT true,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  donor_phone TEXT,
  amount DECIMAL(10,2) NOT NULL,
  donation_type TEXT DEFAULT 'tithe',
  payment_method TEXT DEFAULT 'cash',
  donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_number TEXT,
  notes TEXT,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  event_type TEXT DEFAULT 'service',
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  registration_required BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  present BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(member_id, event_id, attendance_date)
);

-- Create communications table
CREATE TABLE public.communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  communication_type TEXT DEFAULT 'email',
  target_audience TEXT DEFAULT 'all_members',
  status TEXT DEFAULT 'draft',
  sent_date TIMESTAMP WITH TIME ZONE,
  sent_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for visitors
CREATE POLICY "Users can view all visitors" ON public.visitors FOR SELECT USING (true);
CREATE POLICY "Users can insert visitors" ON public.visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update visitors" ON public.visitors FOR UPDATE USING (true);
CREATE POLICY "Users can delete visitors" ON public.visitors FOR DELETE USING (true);

-- Create RLS policies for donations
CREATE POLICY "Users can view all donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Users can insert donations" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update donations" ON public.donations FOR UPDATE USING (true);
CREATE POLICY "Users can delete donations" ON public.donations FOR DELETE USING (true);

-- Create RLS policies for events
CREATE POLICY "Users can view all events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Users can insert events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update events" ON public.events FOR UPDATE USING (true);
CREATE POLICY "Users can delete events" ON public.events FOR DELETE USING (true);

-- Create RLS policies for attendance
CREATE POLICY "Users can view all attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Users can insert attendance" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update attendance" ON public.attendance FOR UPDATE USING (true);
CREATE POLICY "Users can delete attendance" ON public.attendance FOR DELETE USING (true);

-- Create RLS policies for communications
CREATE POLICY "Users can view all communications" ON public.communications FOR SELECT USING (true);
CREATE POLICY "Users can insert communications" ON public.communications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update communications" ON public.communications FOR UPDATE USING (true);
CREATE POLICY "Users can delete communications" ON public.communications FOR DELETE USING (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON public.visitors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_communications_updated_at
  BEFORE UPDATE ON public.communications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();