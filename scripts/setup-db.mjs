import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://wucdbfyyoorxzwnnnpgh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Y2RiZnl5b29yeHp3bm5ucGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDM4MjUsImV4cCI6MjA2ODIxOTgyNX0.ArzYIdqR6XF0dg14LbyhF_6PLzfrNAYoHXaqRlucwFA";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function setupDatabase() {
  console.log('Setting up database tables...');
  
  try {
    // Check if small_groups table exists
    const { data: smallGroupsData, error: smallGroupsError } = await supabase
      .from('small_groups')
      .select('*')
      .limit(1);
      
    if (smallGroupsError) {
      console.log('Creating small_groups table...');
      // SQL to create the small_groups table
      const { error: createError } = await supabase.rpc('create_small_groups_table');
      
      if (createError) {
        console.error('Error creating small_groups table:', createError);
      } else {
        console.log('small_groups table created successfully!');
        
        // Insert sample data
        const { error: insertError } = await supabase
          .from('small_groups')
          .insert([
            {
              name: 'Youth Group',
              description: 'Youth Impact Movement (YIM) is the dynamic and vibrant youth ministry of Greater Works City Church.',
              leader_id: null,
              meeting_day: 'Sunday',
              meeting_time: '6:30PM',
              location: 'Church Auditorium',
              max_members: 100,
              is_active: true
            },
            {
              name: 'Women\'s Fellowship',
              description: 'A supportive community for women to grow in faith and fellowship.',
              leader_id: null,
              meeting_day: 'Saturday',
              meeting_time: '4:00PM',
              location: 'Fellowship Hall',
              max_members: 50,
              is_active: true
            }
          ]);
          
        if (insertError) {
          console.error('Error inserting sample data:', insertError);
        } else {
          console.log('Sample data inserted successfully!');
        }
      }
    } else {
      console.log('small_groups table already exists');
    }
    
    // Check if small_group_members table exists
    const { data: membersData, error: membersError } = await supabase
      .from('small_group_members')
      .select('*')
      .limit(1);
      
    if (membersError) {
      console.log('Creating small_group_members table...');
      // SQL to create the small_group_members table
      const { error: createError } = await supabase.rpc('create_small_group_members_table');
      
      if (createError) {
        console.error('Error creating small_group_members table:', createError);
      } else {
        console.log('small_group_members table created successfully!');
      }
    } else {
      console.log('small_group_members table already exists');
    }
    
    console.log('Database setup complete!');
    
  } catch (error) {
    console.error('Unexpected error during database setup:', error);
  }
}

setupDatabase();
