'use client';
// Intentionally vulnerable fixture: the guard runs in the browser, after the fetch.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [rows, setRows] = useState<unknown[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) {
        router.push('/login');
        return;
      }
      supabase.from('messages').select('*').then((res) => setRows(res.data ?? []));
    });
  }, [router]);

  return <pre>{JSON.stringify(rows)}</pre>;
}
