import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://wucdbfyyoorxzwnnnpgh.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Y2RiZnl5b29yeHp3bm5ucGdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjY0MzgyNSwiZXhwIjoyMDY4MjE5ODI1fQ.Ey8Ql7Eo8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8";

// Create admin client for DDL operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createSettingsTables() {
  console.log('Creating settings tables...');
  
  try {
    // First, let's check if the tables already exist
    console.log('Checking existing tables...');
    
    // Check church_settings
    const { data: churchCheck, error: churchCheckError } = await supabase
      .from('church_settings')
      .select('*')
      .limit(1);
    
    if (!churchCheckError) {
      console.log('✅ church_settings table already exists');
    } else {
      console.log('❌ church_settings table does not exist, will create it');
    }
    
    // Check notification_preferences
    const { data: notificationCheck, error: notificationCheckError } = await supabase
      .from('notification_preferences')
      .select('*')
      .limit(1);
    
    if (!notificationCheckError) {
      console.log('✅ notification_preferences table already exists');
    } else {
      console.log('❌ notification_preferences table does not exist, will create it');
    }
    
    // If both tables exist, we're done
    if (!churchCheckError && !notificationCheckError) {
      console.log('All tables already exist. Migration not needed.');
      return;
    }
    
    console.log('\n⚠️  Tables need to be created manually in Supabase Dashboard');
    console.log('Please go to: https://supabase.com/dashboard/project/wucdbfyyoorxzwnnnpgh/editor');
    console.log('\nRun the following SQL in the SQL Editor:');
    console.log('\n' + '='.repeat(80));
    
    const sqlScript = `
-- Create church_settings table
CREATE TABLE IF NOT EXISTS public.church_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_name TEXT NOT NULL DEFAULT 'Your Church Name',
  church_address TEXT,
  church_phone TEXT,
  church_email TEXT,
  church_website TEXT,
  service_times TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  event_reminders BOOLEAN DEFAULT true,
  donation_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.church_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Church settings policies (admin only for updates, everyone can view)
CREATE POLICY "Anyone can view church settings" 
ON public.church_settings 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Only admins can update church settings" 
ON public.church_settings 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can insert church settings" 
ON public.church_settings 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Notification preferences policies (users can manage their own)
CREATE POLICY "Users can view their own notification preferences" 
ON public.notification_preferences 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" 
ON public.notification_preferences 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences" 
ON public.notification_preferences 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_church_settings_updated_at
  BEFORE UPDATE ON public.church_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default church settings if none exist
INSERT INTO public.church_settings (church_name, church_address, church_phone, church_email, church_website, service_times)
SELECT 'Your Church Name', '', '', '', '', 'Sunday 10:00 AM'
WHERE NOT EXISTS (SELECT 1 FROM public.church_settings);

-- Create function to handle new user notification preferences
CREATE OR REPLACE FUNCTION public.handle_new_user_notifications()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create notification preferences when user signs up
CREATE TRIGGER on_auth_user_created_notifications
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_notifications();
`;
    
    console.log(sqlScript);
    console.log('='.repeat(80));
    console.log('\nAfter running the SQL, the settings page should work correctly.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createSettingsTables();
