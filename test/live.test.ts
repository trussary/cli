import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'node:path';
import { EMPTY_CONFIG } from '../src/engine/config.js';
import { buildScanContext } from '../src/engine/context.js';
import { runScan } from '../src/engine/scan.js';
import { createLiveSession } from '../src/live/client.js';
import { requestConsent } from '../src/live/consent.js';
import { discoverSupabaseProject } from '../src/live/discovery.js';
import { parseRobots } from '../src/live/robots.js';
import { rules } from '../src/rules/registry.js';
import { FIXTURES } from './helpers/scan.js';

interface Hit {
  method: string;
  url: string;
  at: number;
}

const hits: Hit[] = [];
let server: Server;
let origin: string;

/** A deliberately careless site: no security headers, and it serves .env and .git. */
beforeAll(async () => {
  server = createServer((req, res) => {
    hits.push({ method: req.method ?? '', url: req.url ?? '', at: Date.now() });
    if (req.url === '/.env') {
      res.writeHead(200, { 'content-type': 'text/plain' });
      res.end('STRIPE_SECRET_KEY=sk_live_FIXTURE00112233\n');
      return;
    }
    if (req.url === '/.git/HEAD') {
      res.writeHead(200, { 'content-type': 'text/plain' });
      res.end('ref: refs/heads/main\n');
      return;
    }
    if (req.url === '/robots.txt') {
      res.writeHead(200, { 'content-type': 'text/plain' });
      res.end('User-agent: *\nDisallow: /private\n');
      return;
    }
    // Careless all the way down: this is a development build, deployed.
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<!doctype html><title>careless</title><script src="/@vite/client"></script>');
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (typeof address === 'object' && address) origin = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

const LIVE_IDS = ['git-exposed', 'env-exposed', 'security-headers', 'supabase-anon-readable'];

async function runLive(authorized: boolean) {
  const consent = requestConsent(origin, authorized);
  const ctx = buildScanContext({
    root: path.join(FIXTURES, 'next-clean'),
    locale: 'en',
    offline: true,
    liveCheckAuthorized: consent.ok,
    ...(consent.ok ? { targetUrl: consent.consent.url } : {}),
  });
  const session = consent.ok ? createLiveSession(consent.consent, ctx.budget) : undefined;
  if (session) await session.primeRobots();

  const result = await runScan({
    ctx,
    rules: rules.filter((r) => LIVE_IDS.includes(r.id)),
    config: EMPTY_CONFIG,
    ...(session ? { liveClient: session.client } : {}),
  });
  return { ...result, session };
}

describe('live checks without the ownership flag', () => {
  it('sends no requests at all and produces no live findings', async () => {
    hits.length = 0;
    const { findings, ruleErrors } = await runLive(false);

    expect(hits).toEqual([]);
    expect(findings).toEqual([]);
    expect(ruleErrors).toEqual([]);
  });
});

describe('live checks with --i-own-this-site', () => {
  it('finds the exposed .env, the exposed .git and the missing headers', async () => {
    hits.length = 0;
    const { findings } = await runLive(true);
    const ids = findings.map((f) => f.id).sort();

    expect(ids).toEqual(['env-exposed', 'git-exposed', 'security-headers']);
    for (const f of findings) {
      expect(f.confidence).toBe('certain'); // observed, not inferred
      expect(f.evidence.kind).toBe('http');
      expect(f.live).toBe(true);
    }
  });

  it('never leaves the secret value in the evidence', async () => {
    hits.length = 0;
    const { findings } = await runLive(true);
    const env = findings.find((f) => f.id === 'env-exposed');

    expect(env?.evidence.kind === 'http' && env.evidence.snippet).toContain('redacted');
    expect(JSON.stringify(env)).not.toContain('FIXTURE00112233');
  });

  it('uses only GET and HEAD, only on the fixed allowlist', async () => {
    hits.length = 0;
    await runLive(true);

    expect(hits.every((h) => h.method === 'GET' || h.method === 'HEAD')).toBe(true);
    expect([...new Set(hits.map((h) => h.url))].sort()).toEqual([
      '/',
      '/.env',
      '/.git/HEAD',
      '/robots.txt',
    ]);
  });

  it('stays inside the request budget and the rate limit', async () => {
    hits.length = 0;
    const { session } = await runLive(true);
    const receipt = session?.receipt();

    expect(hits.length).toBeLessThanOrEqual(25);
    expect(receipt?.requestsMade).toBe(hits.length);
    expect(receipt?.ownershipAsserted).toBe(true);

    // 2 requests per second means at least ~500ms between any two.
    const gaps = hits.slice(1).map((h, i) => h.at - (hits[i] as Hit).at);
    for (const gap of gaps) expect(gap).toBeGreaterThanOrEqual(400);
  });

  it('records every path it touched in the receipt', async () => {
    hits.length = 0;
    const { session } = await runLive(true);

    expect(session?.receipt().pathsProbed).toContain('GET /.env');
    expect(session?.receipt().userAgent).toContain('trussary/');
  });
});

describe('a rule that is live-optional', () => {
  it('runs statically with no authorisation, and never touches the network', async () => {
    hits.length = 0;
    const consent = requestConsent(origin, false);
    const ctx = buildScanContext({
      root: path.join(FIXTURES, 'express-vulnerable'),
      locale: 'en',
      offline: true,
      liveCheckAuthorized: consent.ok,
    });
    const { findings } = await runScan({
      ctx,
      rules: rules.filter((r) => r.id === 'debug-mode-exposed'),
      config: EMPTY_CONFIG,
    });

    expect(hits).toEqual([]);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.every((f) => f.evidence.kind === 'file')).toBe(true);
    expect(findings.every((f) => f.confidence === 'likely')).toBe(true);
  });

  it('adds an observed finding when the live site serves a development build', async () => {
    hits.length = 0;
    const consent = requestConsent(origin, true);
    if (!consent.ok) throw new Error('consent should have been granted');
    const ctx = buildScanContext({
      root: path.join(FIXTURES, 'express-vulnerable'),
      locale: 'en',
      offline: true,
      liveCheckAuthorized: true,
      targetUrl: consent.consent.url,
    });
    const session = createLiveSession(consent.consent, ctx.budget);
    const { findings } = await runScan({
      ctx,
      rules: rules.filter((r) => r.id === 'debug-mode-exposed'),
      config: EMPTY_CONFIG,
      liveClient: session.client,
    });

    const observed = findings.find((f) => f.evidence.kind === 'http');
    expect(observed).toBeDefined();
    expect(observed?.confidence).toBe('certain');
    expect(observed?.live).toBe(true);
    expect(hits.map((h) => h.url)).toEqual(['/']);
  });
});

describe('consent', () => {
  it('refuses a url with no ownership assertion', () => {
    expect(requestConsent('https://example.com', false)).toEqual({
      ok: false,
      reason: 'not-asserted',
    });
  });

  it('refuses a non-http scheme even with the flag', () => {
    expect(requestConsent('file:///etc/passwd', true)).toEqual({ ok: false, reason: 'bad-url' });
  });

  it('stamps the assertion with a time when granted', () => {
    const result = requestConsent('https://example.com/app', true);
    expect(result.ok && result.consent.origin).toBe('https://example.com');
    expect(result.ok && Date.parse(result.consent.assertedAt)).toBeGreaterThan(0);
  });
});

describe('off-target requests', () => {
  it('refuses an origin the user did not assert', async () => {
    const consent = requestConsent(origin, true);
    if (!consent.ok) throw new Error('consent should have been granted');
    const session = createLiveSession(consent.consent, {
      maxRequestsPerSecond: 2,
      maxTotalRequests: 25,
      perRequestTimeoutMs: 5_000,
      totalWallClockMs: 20_000,
    });

    await expect(session.client.get('https://example.com/')).rejects.toThrow(/off-target/);
  });
});

describe('robots.txt', () => {
  it('honours a disallow for everyone', () => {
    const robots = parseRobots('User-agent: *\nDisallow: /private\n');
    expect(robots.allows('/private/thing')).toBe(false);
    expect(robots.allows('/public')).toBe(true);
  });

  it('lets a more specific allow win', () => {
    const robots = parseRobots('User-agent: *\nDisallow: /a\nAllow: /a/b\n');
    expect(robots.allows('/a/b/c')).toBe(true);
    expect(robots.allows('/a/x')).toBe(false);
  });

  it('ignores rules addressed to a different crawler', () => {
    const robots = parseRobots('User-agent: googlebot\nDisallow: /\n');
    expect(robots.allows('/anything')).toBe(true);
  });
});

describe('supabase discovery', () => {
  it('finds nothing to allow when the source names no project', () => {
    const ctx = buildScanContext({
      root: path.join(FIXTURES, 'next-clean'),
      locale: 'en',
      offline: true,
    });
    expect(discoverSupabaseProject(ctx.files)).toBeUndefined();
  });
});
