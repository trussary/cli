import { createClient } from '@supabase/supabase-js';

// Anon key is public by design; every table behind it is protected by RLS.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
