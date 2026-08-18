/**
 * Ownership is self-asserted, and that assertion is a record, not a mood:
 * it is stamped with a time, carried into every output format, and it is the
 * only thing that can unlock a socket pointed at a site.
 *
 * There is exactly one way to obtain a LiveConsent — passing --url together
 * with --i-own-this-site — and nothing downstream can forge one, because the
 * live session will not start without it.
 */

export interface LiveConsent {
  url: string;
  origin: string;
  ownershipAsserted: true;
  assertedAt: string;
}

export type ConsentResult =
  | { ok: true; consent: LiveConsent }
  | { ok: false; reason: 'no-url' | 'not-asserted' | 'bad-url' };

export function requestConsent(url: string | undefined, flagPassed: boolean): ConsentResult {
  if (!url) return { ok: false, reason: 'no-url' };
  if (!flagPassed) return { ok: false, reason: 'not-asserted' };

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, reason: 'bad-url' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'bad-url' };
  }

  return {
    ok: true,
    consent: {
      url: parsed.toString(),
      origin: parsed.origin,
      ownershipAsserted: true,
      assertedAt: new Date().toISOString(),
    },
  };
}
