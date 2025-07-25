// Script to check database schema
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wucdbfyyoorxzwnnnpgh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Y2RiZnl5b29yeHp3bm5ucGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDM4MjUsImV4cCI6MjA2ODIxOTgyNX0.ArzYIdqR6XF0dg14LbyhF_6PLzfrNAYoHXaqRlucwFA";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkSchema() {
  console.log('Checking database schema...');
  
  try {
    // List all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
      
    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      
      // Try an alternative approach
      console.log('Trying alternative approach to list tables...');
      
      // Try to query some known tables to see what's available
      const knownTables = ['members', 'small_groups', 'small_group_members', 'attendance', 'donations', 'events'];
      
      for (const table of knownTables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
            
          if (error) {
            console.log(`Table ${table}: NOT FOUND or ERROR`);
          } else {
            console.log(`Table ${table}: EXISTS`);
            if (data && data.length > 0) {
              console.log(`  Columns: ${Object.keys(data[0]).join(', ')}`);
            }
          }
        } catch (err) {
          console.error(`Error checking table ${table}:`, err);
        }
      }
      
      return;
    }
    
    console.log('Tables in database:', tables.map(t => t.tablename));
    
    // For each table, get its columns
    for (const { tablename } of tables) {
      try {
        const { data, error } = await supabase
          .from(tablename)
          .select('*')
          .limit(1);
          
        if (error) {
          console.error(`Error fetching columns for table ${tablename}:`, error);
        } else {
          if (data && data.length > 0) {
            console.log(`Table ${tablename} columns:`, Object.keys(data[0]));
          } else {
            console.log(`Table ${tablename} is empty`);
          }
        }
      } catch (err) {
        console.error(`Error processing table ${tablename}:`, err);
      }
    }
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkSchema(); 