// Script to add is_active column to small_groups table
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wucdbfyyoorxzwnnnpgh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Y2RiZnl5b29yeHp3bm5ucGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDM4MjUsImV4cCI6MjA2ODIxOTgyNX0.ArzYIdqR6XF0dg14LbyhF_6PLzfrNAYoHXaqRlucwFA";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function addIsActiveColumn() {
  console.log('Adding is_active column to small_groups table...');
  
  try {
    // First, check if the column already exists
    const { data, error } = await supabase
      .from('small_groups')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('Error checking small_groups table:', error);
      return;
    }
    
    if (data && data.length > 0 && 'is_active' in data[0]) {
      console.log('is_active column already exists');
      return;
    }
    
    // Since we can't directly alter the table with Supabase JS client,
    // we'll update all existing records to have is_active=true
    
    // First, get all group IDs
    const { data: groups, error: groupsError } = await supabase
      .from('small_groups')
      .select('id');
      
    if (groupsError) {
      console.error('Error fetching group IDs:', groupsError);
      return;
    }
    
    console.log(`Found ${groups.length} groups to update`);
    
    // Update each group to have is_active=true
    for (const group of groups) {
      const { error: updateError } = await supabase
        .from('small_groups')
        .update({ is_active: true })
        .eq('id', group.id);
        
      if (updateError) {
        console.error(`Error updating group ${group.id}:`, updateError);
      } else {
        console.log(`Updated group ${group.id}`);
      }
    }
    
    console.log('All groups updated with is_active=true');
    
    // Verify the column was added
    const { data: verifyData, error: verifyError } = await supabase
      .from('small_groups')
      .select('*')
      .limit(1);
      
    if (verifyError) {
      console.error('Error verifying column addition:', verifyError);
      return;
    }
    
    if (verifyData && verifyData.length > 0 && 'is_active' in verifyData[0]) {
      console.log('is_active column successfully added and verified');
    } else {
      console.error('Failed to add is_active column');
    }
    
  } catch (error) {
    console.error('Error adding is_active column:', error);
  }
}

addIsActiveColumn(); 