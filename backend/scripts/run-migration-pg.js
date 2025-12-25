const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  // Use pooler with user format that includes .session suffix for DDL
  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: 5432, // Try port 5432 for session mode
    user: process.env.DATABASE_USER + '.session',
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  console.log(`Connecting to: ${process.env.DATABASE_HOST}:5432`);

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Read the SQL migration file
    const sqlPath = path.join(
      __dirname,
      '../src/database/migrations/001_create_contracts_table.sql',
    );
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🔄 Running migration: 001_create_contracts_table.sql');

    // Execute the SQL
    await client.query(sql);

    console.log('✅ Migration completed successfully!');
    console.log('✅ Table "contracts" has been created');

    // Verify the table was created
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'contracts'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Table structure:');
    result.rows.forEach((row) => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration().catch(console.error);
