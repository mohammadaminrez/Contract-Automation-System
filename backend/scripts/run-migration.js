const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Read the SQL migration file
  const sqlPath = path.join(
    __dirname,
    '../src/database/migrations/001_create_contracts_table.sql',
  );
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('🔄 Running migration: 001_create_contracts_table.sql');

  // Execute the SQL
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    // Try direct query if rpc doesn't work
    console.log('📝 Attempting to run SQL commands...');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.includes('CREATE') || statement.includes('COMMENT')) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
      }
    }

    console.log('\n⚠️  Cannot run SQL via Supabase JS client.');
    console.log('📋 Please run the SQL manually in Supabase SQL Editor:');
    console.log('\n1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy and paste the SQL from:');
    console.log(`   ${sqlPath}`);
    console.log('5. Click "Run"\n');

    // Print the SQL for easy copying
    console.log('📄 SQL to run:');
    console.log('─'.repeat(80));
    console.log(sql);
    console.log('─'.repeat(80));

    process.exit(1);
  }

  console.log('✅ Migration completed successfully!');
}

runMigration().catch(console.error);
