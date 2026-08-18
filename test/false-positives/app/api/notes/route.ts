// A route handler that does everything right.
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const NoteInput = z.object({ title: z.string().max(200), body: z.string().max(5000) });

async function client() {
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: await cookies(),
  });
}

export async function POST(request: Request) {
  const supabase = await client();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response('unauthorised', { status: 401 });

  const input = NoteInput.parse(await request.json());
  const { data } = await supabase.from('notes').insert({ ...input, owner: auth.user.id }).select();
  return Response.json(data);
}
