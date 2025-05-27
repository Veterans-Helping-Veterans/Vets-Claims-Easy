require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function setup() {
  try {
    console.log('Setting up Supabase database...');

    // Run the migration SQL
    const migrationSql = require('fs').readFileSync('./scripts/supabase-migration.sql', 'utf8');
    const { error } = await supabase.from('rest').rpc('exec', { query: migrationSql });
    
    if (error) throw error;

    // Create initial admin user
    console.log('\nCreating admin user...');
    try {
      const { data: auth, error: authError } = await supabase.auth.signUp({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });

      if (authError) throw authError;

      // Set admin role
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: auth.user.id,
          email: process.env.ADMIN_EMAIL,
          role: 'admin',
          created_at: new Date().toISOString()
        }]);

      if (userError) throw userError;

      console.log('✓ Admin user created');
    } catch (error) {
      if (error.message.includes('User already registered')) {
        console.log('✓ Admin user already exists');
      } else {
        throw error;
      }
    }

    console.log('\n✅ Database setup complete!');
  } catch (error) {
    console.error('\n❌ Error setting up database:', error);
    process.exit(1);
  }
}

setup();
