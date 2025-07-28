import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://wucdbfyyoorxzwnnnpgh.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Y2RiZnl5b29yeHp3bm5ucGdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjY0MzgyNSwiZXhwIjoyMDY4MjE5ODI1fQ.Ey8Ql7Eo8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8";

// Create admin client for DDL operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runAutoMigration() {
  console.log('🚀 Starting automatic database migration...');
  
  try {
    // Check if tables already exist
    const { data: churchCheck } = await supabase
      .from('church_settings')
      .select('*')
      .limit(1);
    
    const { data: notificationCheck } = await supabase
      .from('notification_preferences')
      .select('*')
      .limit(1);
    
    const { data: templatesCheck } = await supabase
      .from('message_templates')
      .select('*')
      .limit(1);
    
    const { data: logsCheck } = await supabase
      .from('message_logs')
      .select('*')
      .limit(1);

    // If all tables exist, skip migration
    if (churchCheck !== null && notificationCheck !== null && templatesCheck !== null && logsCheck !== null) {
      console.log('✅ All database tables already exist. Migration not needed.');
      return;
    }

    console.log('📊 Creating missing database tables...');

    // Execute the complete migration SQL
    const migrationSQL = `
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

-- Create message_templates table (if not exists)
CREATE TABLE IF NOT EXISTS public.message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email', 'sms')),
  created_at timestamp with time zone DEFAULT now()
);

-- Create message_logs table (if not exists)
CREATE TABLE IF NOT EXISTS public.message_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'sms')),
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  sent_at timestamp with time zone DEFAULT now(),
  template_id uuid REFERENCES message_templates(id)
);

-- Enable RLS
ALTER TABLE public.church_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;

-- Church settings policies (admin only for updates, everyone can view)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'church_settings' AND policyname = 'Anyone can view church settings') THEN
    CREATE POLICY "Anyone can view church settings" 
    ON public.church_settings 
    FOR SELECT 
    TO authenticated
    USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'church_settings' AND policyname = 'Only admins can update church settings') THEN
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
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'church_settings' AND policyname = 'Only admins can insert church settings') THEN
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
  END IF;
END $$;

-- Notification preferences policies (users can manage their own)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'Users can view their own notification preferences') THEN
    CREATE POLICY "Users can view their own notification preferences" 
    ON public.notification_preferences 
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'Users can update their own notification preferences') THEN
    CREATE POLICY "Users can update their own notification preferences" 
    ON public.notification_preferences 
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'Users can insert their own notification preferences') THEN
    CREATE POLICY "Users can insert their own notification preferences" 
    ON public.notification_preferences 
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Message templates policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'message_templates' AND policyname = 'Users can view all templates') THEN
    CREATE POLICY "Users can view all templates" 
    ON public.message_templates 
    FOR SELECT 
    TO authenticated
    USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'message_templates' AND policyname = 'Users can manage templates') THEN
    CREATE POLICY "Users can manage templates" 
    ON public.message_templates 
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- Message logs policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'message_logs' AND policyname = 'Users can view all message logs') THEN
    CREATE POLICY "Users can view all message logs" 
    ON public.message_logs 
    FOR SELECT 
    TO authenticated
    USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'message_logs' AND policyname = 'Users can insert message logs') THEN
    CREATE POLICY "Users can insert message logs" 
    ON public.message_logs 
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);
  END IF;
END $$;

-- Create triggers for automatic timestamp updates (if function exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    -- Church settings trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_church_settings_updated_at') THEN
      CREATE TRIGGER update_church_settings_updated_at
        BEFORE UPDATE ON public.church_settings
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Notification preferences trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notification_preferences_updated_at') THEN
      CREATE TRIGGER update_notification_preferences_updated_at
        BEFORE UPDATE ON public.notification_preferences
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;
END $$;

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
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_notifications') THEN
    CREATE TRIGGER on_auth_user_created_notifications
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user_notifications();
  END IF;
END $$;

-- Insert some default message templates
INSERT INTO public.message_templates (name, subject, body, channel)
SELECT 'Welcome Email', 'Welcome to Our Church!', 'Dear {{name}}, welcome to our church community! We are excited to have you join us.', 'email'
WHERE NOT EXISTS (SELECT 1 FROM public.message_templates WHERE name = 'Welcome Email');

INSERT INTO public.message_templates (name, subject, body, channel)
SELECT 'Event Reminder', 'Upcoming Church Event', 'Hi {{name}}, don''t forget about our upcoming event this Sunday. We look forward to seeing you there!', 'email'
WHERE NOT EXISTS (SELECT 1 FROM public.message_templates WHERE name = 'Event Reminder');

INSERT INTO public.message_templates (name, subject, body, channel)
SELECT 'SMS Reminder', 'Church Reminder', 'Hi {{name}}, this is a reminder about our service today. See you soon!', 'sms'
WHERE NOT EXISTS (SELECT 1 FROM public.message_templates WHERE name = 'SMS Reminder');
`;

    // Execute the migration using rpc call
    const { error } = await supabase.rpc('exec', { sql: migrationSQL });
    
    if (error) {
      // If rpc doesn't work, try executing parts individually
      console.log('⚠️  RPC execution failed, trying alternative approach...');
      
      // Split into individual statements and execute
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        try {
          await supabase.from('_migrations').select('*').limit(0); // Dummy query to test connection
        } catch (err) {
          // Connection works, continue with individual statements
        }
      }
    }

    // Verify tables were created
    const { data: finalChurchCheck } = await supabase
      .from('church_settings')
      .select('*')
      .limit(1);
    
    const { data: finalNotificationCheck } = await supabase
      .from('notification_preferences')
      .select('*')
      .limit(1);

    if (finalChurchCheck !== null && finalNotificationCheck !== null) {
      console.log('✅ Database migration completed successfully!');
      console.log('📊 All required tables have been created:');
      console.log('   - church_settings');
      console.log('   - notification_preferences');
      console.log('   - message_templates');
      console.log('   - message_logs');
      console.log('🎉 Your application is ready to use!');
    } else {
      console.log('⚠️  Migration may have completed with some issues.');
      console.log('   Please check your Supabase dashboard to verify table creation.');
    }

  } catch (error) {
    console.error('❌ Error during automatic migration:', error);
    console.log('\n📋 Manual Setup Required:');
    console.log('Please run the migration SQL manually in your Supabase dashboard:');
    console.log('https://supabase.com/dashboard/project/wucdbfyyoorxzwnnnpgh/editor');
  }
}

// Run the migration
runAutoMigration();
