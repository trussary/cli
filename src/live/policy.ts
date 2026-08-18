/**
 * The live-check safety policy. This module and client.ts are the only code
 * allowed to open a socket, and only with --url plus --i-own-this-site.
 *
 * Hard rules, not defaults:
 *  - GET and HEAD only. Never a write, never an auth attempt, never a payload.
 *  - Only the asserted origin (plus the app's own Supabase project URL
 *    discovered in source). Off-origin redirects are not followed.
 *  - Fixed path allowlist — no fuzzing, no crawling.
 *  - Budgets: 2 req/s, ≤ 25 requests, 5 s per request, 20 s wall clock.
 */

import { VERSION } from '../version.js';

export const USER_AGENT = `trussary/${VERSION} (+https://trussary.com/cli; self-scan)`;

/** Diagnostic paths equivalent to a browser visiting the owner's own site. */
export const FIXED_PATHS = [
  '/',
  '/.env',
  '/.git/HEAD',
  '/robots.txt',
  '/security.txt',
  '/.well-known/security.txt',
] as const;

export const MAX_BODY_BYTES = 256 * 1024;

/** True for the fixed diagnostic paths, which are exempt from robots.txt. */
export function isFixedPath(pathname: string): boolean {
  return (FIXED_PATHS as readonly string[]).includes(pathname);
}

/** True when `url` stays on the asserted origin or an explicitly allowed extra origin. */
export function isAllowedTarget(url: URL, assertedOrigin: string, extraOrigins: Set<string>): boolean {
  return url.origin === assertedOrigin || extraOrigins.has(url.origin);
}
