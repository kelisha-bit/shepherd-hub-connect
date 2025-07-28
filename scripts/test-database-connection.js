// Test Database Connection and Tables
// Run this in your browser console to verify everything is working

const testDatabaseConnection = async () => {
  console.log('🧪 Testing Database Connection...');
  
  try {
    // Test basic connection
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('✅ Auth connection:', user ? 'Connected' : 'Not authenticated');
    
    // Test all tables
    const tables = [
      'profiles',
      'members', 
      'events',
      'donations',
      'sermons',
      'prayer_requests',
      'small_groups',
      'communications',
      'income_categories',
      'incomes',
      'expense_categories',
      'expenses',
      'financial_goals',
      'event_attendance_counts',
      'attendance',
      'church_settings',
      'notification_preferences',
      'message_templates',
      'message_logs'
    ];
    
    const results = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          results[table] = { status: '❌ Error', message: error.message };
        } else {
          results[table] = { status: '✅ Working', count: data?.length || 0 };
        }
      } catch (err) {
        results[table] = { status: '❌ Exception', message: err.message };
      }
    }
    
    console.log('📊 Database Table Status:');
    Object.entries(results).forEach(([table, result]) => {
      console.log(`   ${result.status} ${table}${result.count ? ` (${result.count} records)` : ''}`);
      if (result.message) {
        console.log(`      Error: ${result.message}`);
      }
    });
    
    // Test views
    console.log('\n📈 Testing Views:');
    try {
      const { data: memberStats, error: memberStatsError } = await supabase
        .from('member_statistics')
        .select('*');
      
      if (memberStatsError) {
        console.log('❌ member_statistics view:', memberStatsError.message);
      } else {
        console.log('✅ member_statistics view working');
      }
      
      const { data: donationStats, error: donationStatsError } = await supabase
        .from('donation_statistics')
        .select('*');
      
      if (donationStatsError) {
        console.log('❌ donation_statistics view:', donationStatsError.message);
      } else {
        console.log('✅ donation_statistics view working');
      }
    } catch (err) {
      console.log('❌ Views test failed:', err.message);
    }
    
    // Summary
    const workingTables = Object.values(results).filter(r => r.status === '✅ Working').length;
    const totalTables = tables.length;
    
    console.log(`\n🎯 Summary: ${workingTables}/${totalTables} tables working`);
    
    if (workingTables === totalTables) {
      console.log('🎉 All database tables are working perfectly!');
    } else {
      console.log('⚠️ Some tables may need attention. Check the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
};

// Run the test
testDatabaseConnection(); 