import { describe, expect, it } from 'vitest';
import { at, findingsFor, scanFixture } from '../helpers/scan.js';

describe('secrets-in-client-bundle', () => {
  it('flags a provider key literal in client code as certain', async () => {
    const { findings } = await scanFixture('next-supabase-vulnerable', {
      only: ['secrets-in-client-bundle'],
    });
    const literal = findingsFor(findings, 'secrets-in-client-bundle').find((f) =>
      at(f).startsWith('app/components/Chat.tsx'),
    );

    expect(literal).toBeDefined();
    expect(literal?.severity).toBe('critical');
    expect(literal?.confidence).toBe('certain');
    expect(at(literal!)).toBe('app/components/Chat.tsx:3');
  });

  it('never puts a usable secret in the evidence excerpt', async () => {
    const { findings } = await scanFixture('next-supabase-vulnerable', {
      only: ['secrets-in-client-bundle'],
    });
    for (const f of findings) {
      if (f.evidence.kind !== 'file') continue;
      expect(f.evidence.excerpt).not.toContain('FAKEFIXTUREaaaaBBBBccccDDDDeeeeFFFFgggg0011');
      expect(f.evidence.excerpt).toContain('redacted');
    }
  });

  it('flags a NEXT_PUBLIC_ env var whose name says SERVICE_ROLE', async () => {
    const { findings } = await scanFixture('next-supabase-vulnerable', {
      only: ['secrets-in-client-bundle'],
    });
    const envName = findingsFor(findings, 'secrets-in-client-bundle').find((f) =>
      at(f).startsWith('app/lib/supabase.ts'),
    );

    expect(envName).toBeDefined();
    expect(envName?.confidence).toBe('likely');
  });

  it('leaves the anon key and public URL alone', async () => {
    const { findings } = await scanFixture('next-clean', { only: ['secrets-in-client-bundle'] });
    expect(findings).toHaveLength(0);
  });

  it('flags a VITE_ service-role variable in a vite app', async () => {
    const { findings } = await scanFixture('vite-react-vulnerable', {
      only: ['secrets-in-client-bundle'],
    });
    expect(findingsFor(findings, 'secrets-in-client-bundle').length).toBeGreaterThan(0);
  });
});

describe('env-committed-to-git', () => {
  it('flags a committed .env as certain', async () => {
    const { findings } = await scanFixture('next-supabase-vulnerable', {
      only: ['env-committed-to-git'],
    });
    const hit = findingsFor(findings, 'env-committed-to-git')[0];

    expect(hit).toBeDefined();
    expect(hit?.confidence).toBe('certain');
    expect(hit?.severity).toBe('critical');
    expect(at(hit!)).toBe('.env:1');
  });

  it('says nothing about a project with no .env', async () => {
    const { findings } = await scanFixture('next-clean', { only: ['env-committed-to-git'] });
    expect(findings).toHaveLength(0);
  });
});

describe('source-maps-in-prod', () => {
  it('flags .map files in build output at likely', async () => {
    const { findings } = await scanFixture('vite-react-vulnerable', {
      only: ['source-maps-in-prod'],
    });
    const hit = findingsFor(findings, 'source-maps-in-prod')[0];

    expect(hit).toBeDefined();
    expect(hit?.confidence).toBe('likely');
    expect(hit?.severity).toBe('medium');
    expect(at(hit!)).toContain('dist/assets/');
  });

  it('says nothing when there is no build output', async () => {
    const { findings } = await scanFixture('next-clean', { only: ['source-maps-in-prod'] });
    expect(findings).toHaveLength(0);
  });
});
