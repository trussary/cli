/**
 * Curated provider secret patterns for the stacks this tool targets.
 * A match in client-shipped code is a 'certain' finding.
 *
 * Deliberately small and hand-maintained — not a general secret scanner.
 */

export interface SecretPattern {
  provider: string;
  regex: RegExp;
}

export const SECRET_PATTERNS: SecretPattern[] = [
  { provider: 'Stripe (live secret)', regex: /\bsk_live_[A-Za-z0-9]{10,}/ },
  { provider: 'Stripe (test secret)', regex: /\bsk_test_[A-Za-z0-9]{10,}/ },
  { provider: 'Stripe (restricted)', regex: /\brk_live_[A-Za-z0-9]{10,}/ },
  { provider: 'Stripe (webhook secret)', regex: /\bwhsec_[A-Za-z0-9]{10,}/ },
  { provider: 'OpenAI', regex: /\bsk-proj-[A-Za-z0-9_-]{20,}/ },
  // Generic OpenAI key — require length so plain "sk-..." prose doesn't match.
  { provider: 'OpenAI', regex: /\bsk-[A-Za-z0-9]{40,}\b/ },
  { provider: 'Anthropic', regex: /\bsk-ant-[A-Za-z0-9_-]{20,}/ },
  { provider: 'AWS (access key id)', regex: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { provider: 'GitHub (token)', regex: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/ },
  { provider: 'Supabase (service role JWT)', regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]*c2VydmljZV9yb2xl[A-Za-z0-9_-]*\.[A-Za-z0-9_-]{10,}/ },
  { provider: 'Google (API key)', regex: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { provider: 'Resend', regex: /\bre_[A-Za-z0-9]{8}_[A-Za-z0-9]{16,}/ },
  { provider: 'SendGrid', regex: /\bSG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}\b/ },
  { provider: 'Twilio (auth token context)', regex: /\bSK[0-9a-f]{32}\b/ },
  { provider: 'Slack (bot token)', regex: /\bxox[bpoas]-[A-Za-z0-9-]{10,}/ },
];

/**
 * Values that LOOK secret but are meant to be public. Never flagged.
 * The Supabase anon key is designed to ship to the browser; publishable
 * Stripe keys are designed to ship to the browser.
 */
export const KNOWN_PUBLIC_PREFIXES: RegExp[] = [
  /\bpk_live_[A-Za-z0-9]+/,
  /\bpk_test_[A-Za-z0-9]+/,
];

export const KNOWN_PUBLIC_ENV_NAMES = new Set([
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
]);

/** Supabase anon-role JWT (contains base64url "anon" role claim) — public by design. */
export const SUPABASE_ANON_JWT = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]*YW5vbi[A-Za-z0-9_-]*\.[A-Za-z0-9_-]{10,}/;

/**
 * Values shaped like a key but filled in with instructions to the reader.
 * Template files are full of these, and flagging them teaches people that the
 * tool does not read what it is looking at.
 */
export const PLACEHOLDER_VALUE =
  /(replace[_-]?me|your[_-]?(?:key|secret|token|value|project)|placeholder|example|change[_-]?me|xxxx+|todo|dummy|<[^>]+>|\.\.\.|_here$)/i;

export function isPlaceholderSecret(value: string): boolean {
  return PLACEHOLDER_VALUE.test(value);
}
