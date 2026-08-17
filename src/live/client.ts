import type { LiveBudget, SafeHttpClient, SafeHttpResponse } from '../rules/types.js';
import type { LiveCheckReceipt } from '../report/model.js';
import { isAllowedTarget, MAX_BODY_BYTES, USER_AGENT } from './policy.js';

export interface LiveSession {
  client: SafeHttpClient;
  receipt(): LiveCheckReceipt;
  networkFailed(): boolean;
  /** Rules may register the app's own Supabase project origin discovered in source. */
  allowExtraOrigin(origin: string): void;
}

class BudgetExceeded extends Error {
  constructor(what: string) {
    super(`live-check budget exceeded: ${what}`);
  }
}

export function createLiveSession(targetUrl: string, budget: LiveBudget): LiveSession {
  const assertedOrigin = new URL(targetUrl).origin;
  const extraOrigins = new Set<string>();
  const assertedAt = new Date().toISOString();
  const pathsProbed: string[] = [];
  const startedAt = Date.now();

  let requestsMade = 0;
  let lastRequestAt = 0;
  let consecutiveNetworkErrors = 0;
  let anySuccess = false;

  async function request(method: 'GET' | 'HEAD', rawUrl: string): Promise<SafeHttpResponse> {
    const url = new URL(rawUrl, assertedOrigin);
    if (!isAllowedTarget(url, assertedOrigin, extraOrigins)) {
      throw new Error(`live check refused off-target url ${url.origin}`);
    }
    if (requestsMade >= budget.maxTotalRequests) throw new BudgetExceeded('request cap');
    if (Date.now() - startedAt > budget.totalWallClockMs) throw new BudgetExceeded('wall clock');

    // Rate limit: single lane, min interval between requests.
    const minInterval = 1000 / budget.maxRequestsPerSecond;
    const wait = lastRequestAt + minInterval - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequestAt = Date.now();
    requestsMade++;
    pathsProbed.push(`${method} ${url.pathname}${url.search}`);

    try {
      const res = await fetch(url, {
        method,
        redirect: 'manual', // never follow redirects (they could leave the asserted origin)
        headers: { 'user-agent': USER_AGENT, accept: '*/*' },
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

      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        headers[k.toLowerCase()] = v;
      });

      anySuccess = true;
      consecutiveNetworkErrors = 0;
      return { url: url.toString(), status: res.status, headers, body, ok: res.ok };
    } catch (err) {
      consecutiveNetworkErrors++;
      throw err;
    }
  }

  return {
    client: {
      get: (u) => request('GET', u),
      head: (u) => request('HEAD', u),
    },
    receipt(): LiveCheckReceipt {
      return {
        url: targetUrl,
        ownershipAsserted: true,
        assertedAt,
        userAgent: USER_AGENT,
        requestsMade,
        pathsProbed,
        robotsRespected: true,
      };
    },
    networkFailed(): boolean {
      // "Network failed" (exit 3) = we tried and never reached the site at all.
      return requestsMade > 0 && !anySuccess && consecutiveNetworkErrors > 0;
    },
    allowExtraOrigin(origin: string): void {
      extraOrigins.add(origin);
    },
  };
}
