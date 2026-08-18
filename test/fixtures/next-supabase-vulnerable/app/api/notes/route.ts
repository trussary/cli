// Intentionally vulnerable fixture: no session check before touching data.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function GET() {
  const { data } = await supabase.from('messages').select('*');
  return Response.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { data } = await supabase.from('messages').insert(body).select();
  return Response.json(data);
}
