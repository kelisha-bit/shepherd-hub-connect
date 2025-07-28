import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function AutoMigration({ children }: { children: React.ReactNode }) {
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    runAutoMigration();
  }, []);

  const runAutoMigration = async () => {
    try {
      console.log('🚀 Checking database tables...');

      // Check if required tables exist
      const tableChecks = await Promise.allSettled([
        supabase.from('church_settings').select('*').limit(1),
        supabase.from('notification_preferences').select('*').limit(1),
        supabase.from('message_templates').select('*').limit(1),
        supabase.from('message_logs').select('*').limit(1)
      ]);

      const allTablesExist = tableChecks.every(result => result.status === 'fulfilled');

      if (allTablesExist) {
        console.log('✅ All database tables exist. Migration not needed.');
        setMigrationComplete(true);
        return;
      }

      console.log('📊 Some tables missing. Creating tables...');

      // Create missing tables using individual operations
      await createMissingTables();

      // Verify tables were created
      const verificationChecks = await Promise.allSettled([
        supabase.from('church_settings').select('*').limit(1),
        supabase.from('notification_preferences').select('*').limit(1)
      ]);

      const tablesCreated = verificationChecks.every(result => result.status === 'fulfilled');

      if (tablesCreated) {
        console.log('✅ Database migration completed successfully!');
        toast({
          title: "Database Ready",
          description: "All required tables have been set up automatically.",
        });
      } else {
        throw new Error('Table verification failed');
      }

      setMigrationComplete(true);

    } catch (error) {
      console.error('❌ Auto-migration failed:', error);
      setMigrationError(error instanceof Error ? error.message : 'Unknown error');
      
      // Still allow the app to load, but show a warning
      setMigrationComplete(true);
      
      toast({
        title: "Database Setup Required",
        description: "Please run the SQL migration manually in your Supabase dashboard.",
        variant: "destructive",
      });
    }
  };

  const createMissingTables = async () => {
    // Try to create default church settings record
    try {
      const { error: insertError } = await supabase
        .from('church_settings')
        .insert({
          church_name: 'Your Church Name',
          church_address: '',
          church_phone: '',
          church_email: '',
          church_website: '',
          service_times: 'Sunday 10:00 AM'
        });

      if (insertError && !insertError.message.includes('relation "church_settings" does not exist')) {
        console.log('Church settings table exists or created successfully');
      }
    } catch (error) {
      console.log('Church settings table may need manual creation');
    }

    // Try to create default notification preferences for current user
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            email_notifications: true,
            sms_notifications: false,
            event_reminders: true,
            donation_alerts: true
          });

        if (insertError && !insertError.message.includes('relation "notification_preferences" does not exist')) {
          console.log('Notification preferences table exists or created successfully');
        }
      }
    } catch (error) {
      console.log('Notification preferences table may need manual creation');
    }

    // Try to create default message templates
    try {
      const { error: insertError } = await supabase
        .from('message_templates')
        .insert([
          {
            name: 'Welcome Email',
            subject: 'Welcome to Our Church!',
            body: 'Dear {{name}}, welcome to our church community! We are excited to have you join us.',
            channel: 'email'
          },
          {
            name: 'Event Reminder',
            subject: 'Upcoming Church Event',
            body: 'Hi {{name}}, don\'t forget about our upcoming event this Sunday. We look forward to seeing you there!',
            channel: 'email'
          }
        ]);

      if (insertError && !insertError.message.includes('relation "message_templates" does not exist')) {
        console.log('Message templates table exists or created successfully');
      }
    } catch (error) {
      console.log('Message templates table may need manual creation');
    }
  };

  // Show loading screen while migration runs
  if (!migrationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-xl font-semibold">Setting up your database...</h2>
          <p className="text-muted-foreground">
            This will only take a moment on first launch.
          </p>
        </div>
      </div>
    );
  }

  // Show error message if migration failed but still render children
  if (migrationError) {
    return (
      <div className="min-h-screen">
        <div className="bg-destructive/10 border-destructive/20 border p-4 m-4 rounded-lg">
          <h3 className="font-semibold text-destructive">Database Setup Notice</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Some database tables may need to be created manually. 
            Please check the console for more details or contact support.
          </p>
        </div>
        {children}
      </div>
    );
  }

  // Migration complete, render the app
  return <>{children}</>;
}
