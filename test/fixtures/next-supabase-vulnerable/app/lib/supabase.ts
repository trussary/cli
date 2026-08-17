// Intentionally vulnerable fixture — every value below is fake.
import { createClient } from '@supabase/supabase-js';

// Service-role key wired to a client-side create — the classic scaffold trap.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
);
