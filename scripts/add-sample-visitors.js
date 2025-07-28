import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wucdbfyyoorxzwnnnpgh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Y2RiZnl5b29yeHp3bm5ucGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDM4MjUsImV4cCI6MjA2ODIxOTgyNX0.ArzYIdqR6XF0dg14LbyhF_6PLzfrNAYoHXaqRlucwFA";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const sampleVisitors = [
  {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone_number: '+1234567890',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    visit_date: '2024-01-15',
    visited_before: false,
    how_did_you_hear_about_us: 'friend_family',
    notes: 'First time visitor, seemed very interested in our youth programs.',
    follow_up_required: true,
    follow_up_date: '2024-01-22'
  },
  {
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone_number: '+1987654321',
    address: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    visit_date: '2024-01-10',
    visited_before: true,
    how_did_you_hear_about_us: 'website',
    notes: 'Returning visitor, attended our Christmas service last year.',
    follow_up_required: false,
    follow_up_date: null
  },
  {
    first_name: 'Michael',
    last_name: 'Johnson',
    email: 'michael.johnson@example.com',
    phone_number: '+1555123456',
    address: '789 Pine Rd',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    visit_date: '2024-01-20',
    visited_before: false,
    how_did_you_hear_about_us: 'social_media',
    notes: 'Found us through Facebook. Interested in community outreach programs.',
    follow_up_required: true,
    follow_up_date: '2024-01-27'
  },
  {
    first_name: 'Sarah',
    last_name: 'Williams',
    email: 'sarah.williams@example.com',
    phone_number: '+1444567890',
    address: '321 Elm St',
    city: 'Houston',
    state: 'TX',
    country: 'USA',
    visit_date: '2024-01-18',
    visited_before: false,
    how_did_you_hear_about_us: 'advertisement',
    notes: 'Saw our ad in the local newspaper. Has young children.',
    follow_up_required: true,
    follow_up_date: '2024-01-25'
  },
  {
    first_name: 'David',
    last_name: 'Brown',
    email: 'david.brown@example.com',
    phone_number: '+1333567890',
    address: '654 Maple Dr',
    city: 'Phoenix',
    state: 'AZ',
    country: 'USA',
    visit_date: '2024-01-12',
    visited_before: true,
    how_did_you_hear_about_us: 'walk_in',
    notes: 'Returning visitor, attended our summer camp last year.',
    follow_up_required: false,
    follow_up_date: null
  }
];

async function addSampleVisitors() {
  try {
    console.log('🚀 Adding sample visitors to the database...');
    
    const { data, error } = await supabase
      .from('visitors')
      .insert(sampleVisitors)
      .select();

    if (error) {
      console.error('❌ Error adding sample visitors:', error);
      return;
    }

    console.log('✅ Successfully added sample visitors:');
    data.forEach(visitor => {
      console.log(`  - ${visitor.first_name} ${visitor.last_name} (${visitor.email})`);
    });
    
    console.log(`\n📊 Total visitors in database: ${data.length}`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
addSampleVisitors(); 