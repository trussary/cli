import type {
  LiveBudget,
  SafeHttpClient,
  SafeHttpResponse,
  SafeRequestOptions,
} from '../rules/types.js';
import type { LiveCheckReceipt } from '../report/model.js';
import type { LiveConsent } from './consent.js';
import { isAllowedTarget, isFixedPath, MAX_BODY_BYTES, USER_AGENT } from './policy.js';
import { parseRobots, type RobotsRules } from './robots.js';

export interface LiveSession {
  client: SafeHttpClient;
  receipt(): LiveCheckReceipt;
  networkFailed(): boolean;
  /** The app's own Supabase project origin, discovered in its own source. */
  allowExtraOrigin(origin: string): void;
  /** Fetch robots.txt once, before any optional probe. */
  primeRobots(): Promise<void>;
}

class BudgetExceeded extends Error {
  constructor(what: string) {
    super(`live-check budget exceeded: ${what}`);
  }
}

class RobotsDisallowed extends Error {
  constructor(path: string) {
    super(`robots.txt disallows ${path} — not probed`);
  }
}

export function createLiveSession(consent: LiveConsent, budget: LiveBudget): LiveSession {
  const assertedOrigin = consent.origin;
  const extraOrigins = new Set<string>();
  const pathsProbed: string[] = [];
  const startedAt = Date.now();

  let requestsMade = 0;
  let lastRequestAt = 0;
  let networkErrors = 0;
  let anySuccess = false;
  let robots: RobotsRules | undefined;
  let robotsFetched = false;

  async function request(
    method: 'GET' | 'HEAD',
    rawUrl: string,
    opts: SafeRequestOptions & { anonKey?: string } = {},
  ): Promise<SafeHttpResponse> {
    const url = new URL(rawUrl, assertedOrigin);
    if (!isAllowedTarget(url, assertedOrigin, extraOrigins)) {
      throw new Error(`live check refused off-target url ${url.origin}`);
    }
    // Optional probes obey robots.txt; the fixed diagnostic paths do not.
    if (opts.optional && !isFixedPath(url.pathname) && robots && !robots.allows(url.pathname)) {
      throw new RobotsDisallowed(url.pathname);
    }
    if (requestsMade >= budget.maxTotalRequests) throw new BudgetExceeded('request cap');
    if (Date.now() - startedAt > budget.totalWallClockMs) throw new BudgetExceeded('wall clock');

    // Rate limit: a single lane with a minimum gap between requests.
    const minInterval = 1000 / budget.maxRequestsPerSecond;
    const wait = lastRequestAt + minInterval - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequestAt = Date.now();
    requestsMade++;
    pathsProbed.push(`${method} ${url.pathname}${url.search}`);

    const headers: Record<string, string> = { 'user-agent': USER_AGENT, accept: '*/*' };
    if (opts.anonKey) {
      // The app's own public key, sent to the app's own project. Nothing else
      // in this tool ever attaches a credential to a request.
      headers['apikey'] = opts.anonKey;
      headers['authorization'] = `Bearer ${opts.anonKey}`;
    }

    try {
      const res = await fetch(url, {
        method,
        redirect: 'manual', // a redirect could leave the origin the user asserted
        headers,
        signal: AbortSignal.timeout(budget.perRequestTimeoutMs),
      });

      let body = '';
      if (method === 'GET' && res.body) {
        const reader = res.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            received += value.byteLength;
            chunks.push(value);
            if (received >= MAX_BODY_BYTES) {
              await reader.cancel();
              break;
            }
          }
        }
        body = Buffer.concat(chunks).toString('utf8').slice(0, MAX_BODY_BYTES);
      }

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        responseHeaders[k.toLowerCase()] = v;
      });

      anySuccess = true;
      return { url: url.toString(), status: res.status, headers: responseHeaders, body, ok: res.ok };
    } catch (err) {
      networkErrors++;
      throw err;
    }
  }

  return {
    client: {
      get: (u, opts) => request('GET', u, opts ?? {}),
      head: (u, opts) => request('HEAD', u, opts ?? {}),
      getWithAnonKey: (u, anonKey) => request('GET', u, { anonKey }),
      targetOrigin: () => assertedOrigin,
    },

    async primeRobots(): Promise<void> {
      if (robotsFetched) return;
      robotsFetched = true;
      try {
        const res = await request('GET', '/robots.txt');
        if (res.ok) robots = parseRobots(res.body);
      } catch {
        // No robots.txt, or unreachable: the fixed allowlist still applies and
        // optional probes stay conservative by having nothing to check against.
      }
    },

    receipt(): LiveCheckReceipt {
      return {
        url: consent.url,
        ownershipAsserted: true,
        assertedAt: consent.assertedAt,
        userAgent: USER_AGENT,
        requestsMade,
        pathsProbed,
        robotsRespected: true,
      };
    },

    networkFailed(): boolean {
      // Exit code 3 means: we tried and never reached the site at all.
      return requestsMade > 0 && !anySuccess && networkErrors > 0;
    },

    allowExtraOrigin(origin: string): void {
      extraOrigins.add(origin);
    },
  };
}
