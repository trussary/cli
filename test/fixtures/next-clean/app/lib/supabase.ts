import { createClient } from '@supabase/supabase-js';

// Correct: anon key (public by design), URL from public env — nothing to flag.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
