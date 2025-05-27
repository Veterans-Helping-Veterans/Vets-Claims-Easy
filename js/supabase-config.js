import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://hxpacjqjbxuxfpmdizqn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cGFjanFqYnh1eGZwbWRpenFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTc1NTMsImV4cCI6MjA2MzkzMzU1M30.ycvWrNpjkzWTaEvlpLslahZ4ujClH1G1LJpac7O1BMw';

// Create Supabase client with options
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: 'vets-claims-auth'
  }
});

export { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };
