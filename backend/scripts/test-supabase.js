const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('🔄 Testing Supabase connection...');
  console.log(`URL: ${supabaseUrl}`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test 1: Check if we can query (will fail if table doesn't exist yet)
  console.log('\n📋 Testing query to contracts table...');
  const { data, error } = await supabase.from('contracts').select('count');

  if (error) {
    if (error.message.includes('relation "contracts" does not exist')) {
      console.log('⚠️  Table "contracts" does not exist yet');
      console.log('✅ But Supabase connection is working!');
      console.log('\n📝 Next step: Run the SQL migration manually');
      console.log('\n1. Go to: https://supabase.com/dashboard/project/dsiosehcuddbwaukhekv/sql/new');
      console.log('2. Copy the SQL from: backend/src/database/migrations/001_create_contracts_table.sql');
      console.log('3. Paste and click "Run"');
    } else {
      console.log('❌ Error:', error.message);
    }
  } else {
    console.log('✅ Table exists! Connection working!');
    console.log(`📊 Row count:`, data);
  }
}

testSupabase().catch(console.error);
