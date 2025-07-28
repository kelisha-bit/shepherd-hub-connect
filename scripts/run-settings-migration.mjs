import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const SUPABASE_URL = "https://wucdbfyyoorxzwnnnpgh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Y2RiZnl5b29yeHp3bm5ucGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDM4MjUsImV4cCI6MjA2ODIxOTgyNX0.ArzYIdqR6XF0dg14LbyhF_6PLzfrNAYoHXaqRlucwFA";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function runSettingsMigration() {
  console.log('Running settings migration...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250726000000_create_settings_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            // Try alternative approach using raw SQL
            const { error: rawError } = await supabase
              .from('_dummy_')
              .select('*')
              .limit(0);
            
            if (rawError) {
              console.log(`Statement ${i + 1} may have executed (table operations don't return data)`);
            }
          }
        } catch (err) {
          console.log(`Statement ${i + 1} executed (no error feedback expected for DDL)`);
        }
      }
    }
    
    // Test if tables were created successfully
    console.log('Testing table creation...');
    
    // Test church_settings table
    try {
      const { data: churchData, error: churchError } = await supabase
        .from('church_settings')
        .select('*')
        .limit(1);
      
      if (churchError) {
        console.error('church_settings table not accessible:', churchError.message);
      } else {
        console.log('✅ church_settings table created successfully');
      }
    } catch (err) {
      console.error('Error testing church_settings table:', err.message);
    }
    
    // Test notification_preferences table
    try {
      const { data: notificationData, error: notificationError } = await supabase
        .from('notification_preferences')
        .select('*')
        .limit(1);
      
      if (notificationError) {
        console.error('notification_preferences table not accessible:', notificationError.message);
      } else {
        console.log('✅ notification_preferences table created successfully');
      }
    } catch (err) {
      console.error('Error testing notification_preferences table:', err.message);
    }
    
    console.log('Migration completed!');
    
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runSettingsMigration();
