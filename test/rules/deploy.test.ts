import { describe, expect, it } from 'vitest';
import { at, findingsFor, scanFixture } from '../helpers/scan.js';

describe('wildcard-cors', () => {
  it('flags origin:* with credentials as critical/certain', async () => {
    const { findings } = await scanFixture('express-vulnerable', { only: ['wildcard-cors'] });
    const hit = findingsFor(findings, 'wildcard-cors')[0];

    expect(hit).toBeDefined();
    expect(hit?.severity).toBe('critical');
    expect(hit?.confidence).toBe('certain');
    expect(at(hit!)).toBe('src/server.js:6');
  });

  it('says nothing about an app with no CORS config', async () => {
    const { findings } = await scanFixture('next-clean', { only: ['wildcard-cors'] });
    expect(findings).toHaveLength(0);
  });
});

describe('missing-security-headers', () => {
  it('reports absence evidence when no headers are configured anywhere', async () => {
    const { findings } = await scanFixture('vite-react-vulnerable', {
      only: ['missing-security-headers'],
    });
    const hit = findingsFor(findings, 'missing-security-headers')[0];

    expect(hit).toBeDefined();
    expect(hit?.confidence).toBe('likely');
    expect(hit?.evidence.kind).toBe('absence');
  });

  it('stays quiet when next.config sets headers', async () => {
    const { findings } = await scanFixture('next-clean', { only: ['missing-security-headers'] });
    expect(findings).toHaveLength(0);
  });
});

describe('debug-mode-exposed', () => {
  it('flags an error handler that returns err.stack to the caller', async () => {
    const { findings } = await scanFixture('express-vulnerable', { only: ['debug-mode-exposed'] });
    const hit = findingsFor(findings, 'debug-mode-exposed')[0];

    expect(hit).toBeDefined();
    expect(hit?.confidence).toBe('likely');
    expect(at(hit!)).toBe('src/server.js:12');
  });

  it('stays quiet on a clean app', async () => {
    const { findings } = await scanFixture('next-clean', { only: ['debug-mode-exposed'] });
    expect(findings).toHaveLength(0);
  });
});

describe('dep-known-advisories', () => {
  it('makes no network request and reports nothing when offline', async () => {
    const { findings, ruleErrors } = await scanFixture('next-supabase-vulnerable', {
      only: ['dep-known-advisories'],
      offline: true,
    });
    expect(findings).toHaveLength(0);
    expect(ruleErrors).toHaveLength(0);
  });
});
