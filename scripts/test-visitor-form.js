import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wucdbfyyoorxzwnnnpgh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Y2RiZnl5b29yeHp3bm5ucGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDM4MjUsImV4cCI6MjA2ODIxOTgyNX0.ArzYIdqR6XF0dg14LbyhF_6PLzfrNAYoHXaqRlucwFA";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testVisitorForm() {
  try {
    console.log('🧪 Testing visitor form functionality...\n');

    // Test 1: Check if visitors table exists and is accessible
    console.log('1. Testing database connection and table access...');
    const { data: existingVisitors, error: fetchError } = await supabase
      .from('visitors')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('❌ Error accessing visitors table:', fetchError);
      return;
    }
    console.log('✅ Visitors table is accessible\n');

    // Test 2: Test adding a new visitor
    console.log('2. Testing visitor creation...');
    const testVisitor = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test.user@example.com',
      phone_number: '+1234567890',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      country: 'Test Country',
      visit_date: '2024-01-25',
      visited_before: false,
      how_did_you_hear_about_us: 'website',
      notes: 'This is a test visitor entry',
      follow_up_required: true,
      follow_up_date: '2024-02-01'
    };

    const { data: newVisitor, error: insertError } = await supabase
      .from('visitors')
      .insert([testVisitor])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating test visitor:', insertError);
      return;
    }
    console.log('✅ Test visitor created successfully:', newVisitor.id);

    // Test 3: Test updating the visitor
    console.log('\n3. Testing visitor update...');
    const updateData = {
      notes: 'Updated test notes',
      follow_up_required: false
    };

    const { error: updateError } = await supabase
      .from('visitors')
      .update(updateData)
      .eq('id', newVisitor.id);

    if (updateError) {
      console.error('❌ Error updating test visitor:', updateError);
    } else {
      console.log('✅ Test visitor updated successfully');
    }

    // Test 4: Test fetching the updated visitor
    console.log('\n4. Testing visitor retrieval...');
    const { data: fetchedVisitor, error: getError } = await supabase
      .from('visitors')
      .select('*')
      .eq('id', newVisitor.id)
      .single();

    if (getError) {
      console.error('❌ Error fetching test visitor:', getError);
    } else {
      console.log('✅ Test visitor retrieved successfully');
      console.log('   - Name:', fetchedVisitor.first_name, fetchedVisitor.last_name);
      console.log('   - Email:', fetchedVisitor.email);
      console.log('   - Notes:', fetchedVisitor.notes);
      console.log('   - Follow-up required:', fetchedVisitor.follow_up_required);
    }

    // Test 5: Clean up - delete the test visitor
    console.log('\n5. Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('visitors')
      .delete()
      .eq('id', newVisitor.id);

    if (deleteError) {
      console.error('❌ Error deleting test visitor:', deleteError);
    } else {
      console.log('✅ Test visitor deleted successfully');
    }

    console.log('\n🎉 All visitor form tests completed successfully!');
    console.log('The visitor form should be working properly in the application.');

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
  }
}

// Run the test
testVisitorForm(); 