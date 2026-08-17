'use client';
// Intentionally vulnerable fixture — the key below is fake.
const OPENAI_KEY = 'sk-FAKEFIXTUREaaaaBBBBccccDDDDeeeeFFFFgggg0011';

export async function askModel(prompt: string) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] }),
  });
  return res.json();
}
