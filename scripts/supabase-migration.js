require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;

async function migrate() {
  // Initialize Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    console.log('Starting database migration...');

    // Read migration SQL
    const sql = await fs.readFile('./scripts/supabase-migration.sql', 'utf8');
    console.log('Read migration SQL file');

    // Execute migration
    const { error } = await supabase.from('rest').rpc('exec', { query: sql });
    if (error) throw error;

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

migrate();
