// Intentionally vulnerable fixture — fake values throughout.
export const adminKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

export async function loadAll() {
  const res = await fetch('/api/items', { headers: { apikey: adminKey } });
  return res.json();
}
