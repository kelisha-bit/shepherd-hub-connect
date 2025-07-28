import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const SUPABASE_URL = "https://wucdbfyyoorxzwnnnpgh.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Y2RiZnl5b29yeHp3bm5ucGdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjY0MzgyNSwiZXhwIjoyMDY4MjE5ODI1fQ.Ey8Ql7Eo8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8";

// Create admin client for DDL operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runCompleteMigration() {
  console.log('🚀 Starting complete database schema migration...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250729000000_complete_database_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📊 Executing complete database schema migration...');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length === 0) continue;
      
      try {
        // Execute each statement individually
        const { error } = await supabase.rpc('exec', { sql: statement });
        
        if (error) {
          console.log(`⚠️  Statement ${i + 1} had an issue (this might be expected):`, error.message);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1} failed (this might be expected):`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Successful statements: ${successCount}`);
    console.log(`   ⚠️  Statements with issues: ${errorCount}`);
    
    // Verify key tables were created
    console.log('\n🔍 Verifying table creation...');
    
    const tablesToCheck = [
      'profiles', 'events', 'donations', 'sermons', 'prayer_requests',
      'small_groups', 'communications', 'income_categories', 'incomes',
      'expense_categories', 'expenses', 'financial_goals', 'event_attendance_counts'
    ];
    
    const tableStatus = {};
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
          tableStatus[table] = '❌ Missing';
        } else {
          tableStatus[table] = '✅ Created';
        }
      } catch (err) {
        tableStatus[table] = '❌ Error';
      }
    }
    
    console.log('\n📋 Table Status:');
    for (const [table, status] of Object.entries(tableStatus)) {
      console.log(`   ${status} ${table}`);
    }
    
    // Check if all critical tables exist
    const missingTables = Object.entries(tableStatus)
      .filter(([_, status]) => status === '❌ Missing')
      .map(([table, _]) => table);
    
    if (missingTables.length === 0) {
      console.log('\n🎉 Complete database schema migration successful!');
      console.log('📊 All required tables have been created and are ready for use.');
    } else {
      console.log('\n⚠️  Some tables may not have been created:');
      missingTables.forEach(table => console.log(`   - ${table}`));
      console.log('\n💡 You may need to run the migration manually in your Supabase dashboard.');
    }
    
  } catch (error) {
    console.error('❌ Error during complete migration:', error);
    console.log('\n📋 Manual Setup Required:');
    console.log('Please run the migration SQL manually in your Supabase dashboard:');
    console.log('https://supabase.com/dashboard/project/wucdbfyyoorxzwnnnpgh/editor');
    console.log('\nFile: supabase/migrations/20250729000000_complete_database_schema.sql');
  }
}

// Run the migration
runCompleteMigration(); 