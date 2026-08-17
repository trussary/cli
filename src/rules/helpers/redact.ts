/**
 * Evidence excerpts must never carry a usable secret. Keep the first few
 * characters (enough to recognise the key type) and redact the rest.
 */
export function redactSecret(secret: string): string {
  const keep = Math.min(8, Math.floor(secret.length / 3));
  return `${secret.slice(0, keep)}…redacted`;
}

/** Redact `secret` inside `line` and trim the line for display. */
export function redactLine(line: string, secret: string, maxLen = 120): string {
  const redacted = line.replace(secret, redactSecret(secret)).trim();
  return redacted.length > maxLen ? `${redacted.slice(0, maxLen)}…` : redacted;
}

export function trimExcerpt(line: string, maxLen = 120): string {
  const t = line.trim();
  return t.length > maxLen ? `${t.slice(0, maxLen)}…` : t;
}
