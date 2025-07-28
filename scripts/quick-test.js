// Quick Database Test - Copy and paste this into your browser console
console.log('🧪 Testing Church Management App Database...');

// Test basic tables
const testTables = async () => {
  const tables = ['members', 'events', 'donations', 'sermons', 'prayer_requests'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        results[table] = '❌ ' + error.message;
      } else {
        results[table] = '✅ Working';
      }
    } catch (err) {
      results[table] = '❌ ' + err.message;
    }
  }
  
  console.log('📊 Table Status:');
  Object.entries(results).forEach(([table, status]) => {
    console.log(`   ${status} ${table}`);
  });
  
  const workingCount = Object.values(results).filter(r => r.includes('✅')).length;
  console.log(`\n🎯 ${workingCount}/${tables.length} tables working`);
  
  if (workingCount === tables.length) {
    console.log('🎉 All core tables are working! Your app is ready!');
  } else {
    console.log('⚠️ Some tables need attention. Check the errors above.');
  }
};

// Run the test
testTables(); 