
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kpwyioltbpjtqzxnzvpw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwd3lpb2x0YnBqdHF6eG56dnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODgwMDIsImV4cCI6MjA3MDA2NDAwMn0.Fk79kPT_xO2ulbUnaXICniM9-JmjUdRNSh0WhWoHFqg";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
