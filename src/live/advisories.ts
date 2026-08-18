import { USER_AGENT } from './policy.js';

/**
 * The npm registry advisory lookup — the only outbound request that is not a
 * check of your own site, and the only one that is not GET/HEAD.
 *
 * It lives in live/ because that is where every socket in this tool lives. It
 * is a different lane from the site probe: it talks to registry.npmjs.org (the
 * same host `npm install` talks to), it sends package names and versions and
 * nothing else — never your code, never your URL — and any failure is silent.
 * `--offline` switches it off entirely.
 */

const BULK_ENDPOINT = 'https://registry.npmjs.org/-/npm/v1/security/advisories/bulk';
const TIMEOUT_MS = 10_000;
const MAX_PACKAGES = 500;

export interface Advisory {
  name: string;
  version: string;
  title: string;
  severity: string;
  url: string;
  vulnerableVersions: string;
}

interface BulkAdvisoryEntry {
  title?: string;
  severity?: string;
  url?: string;
  vulnerable_versions?: string;
}

/**
 * @returns advisories, or `undefined` when the registry could not be reached —
 * an unreachable registry is not a finding and must never look like one.
 */
export async function fetchCriticalAdvisories(
  installed: Map<string, string>,
): Promise<Advisory[] | undefined> {
  if (installed.size === 0) return [];

  const body: Record<string, string[]> = {};
  let count = 0;
  for (const [name, version] of installed) {
    if (count++ >= MAX_PACKAGES) break;
    body[name] = [version];
  }

  let payload: Record<string, BulkAdvisoryEntry[]>;
  try {
    const res = await fetch(BULK_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': USER_AGENT },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return undefined;
    payload = (await res.json()) as Record<string, BulkAdvisoryEntry[]>;
  } catch {
    return undefined;
  }

  const out: Advisory[] = [];
  for (const [name, entries] of Object.entries(payload)) {
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      if (entry.severity !== 'critical') continue;
      out.push({
        name,
        version: installed.get(name) ?? '',
        title: entry.title ?? 'security advisory',
        severity: entry.severity,
        url: entry.url ?? `https://www.npmjs.com/advisories?package=${encodeURIComponent(name)}`,
        vulnerableVersions: entry.vulnerable_versions ?? '',
      });
    }
  }
  return out;
}
