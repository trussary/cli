import { describe, expect, it } from 'vitest';
import { at, findingsFor, scanFixture } from '../helpers/scan.js';

describe('api-route-no-session', () => {
  it('flags a route handler that queries data with no session check', async () => {
    const { findings } = await scanFixture('next-supabase-vulnerable', {
      only: ['api-route-no-session'],
    });
    const hit = findingsFor(findings, 'api-route-no-session')[0];

    expect(hit).toBeDefined();
    expect(hit?.severity).toBe('high');
    expect(hit?.confidence).toBe('likely');
    expect(at(hit!)).toContain('app/api/notes/route.ts');
  });

  it('stays quiet on a project with no API routes', async () => {
    const { findings } = await scanFixture('next-clean', { only: ['api-route-no-session'] });
    expect(findings).toHaveLength(0);
  });
});

describe('admin-route-unprotected', () => {
  it('reports absence evidence for an admin page with no identity check', async () => {
    const { findings } = await scanFixture('next-supabase-vulnerable', {
      only: ['admin-route-unprotected'],
    });
    const hit = findingsFor(findings, 'admin-route-unprotected')[0];

    expect(hit).toBeDefined();
    expect(hit?.evidence.kind).toBe('absence');
    expect(hit?.title.vars?.['file']).toBe('app/admin/page.tsx');
  });
});

describe('client-side-only-auth', () => {
  it('flags a browser-side redirect guard at possible, never higher', async () => {
    const { findings } = await scanFixture('next-supabase-vulnerable', {
      only: ['client-side-only-auth'],
    });
    const hit = findingsFor(findings, 'client-side-only-auth')[0];

    expect(hit).toBeDefined();
    expect(hit?.confidence).toBe('possible');
    expect(at(hit!)).toContain('app/dashboard/page.tsx');
  });

  it('stays quiet on a project with no client guard', async () => {
    const { findings } = await scanFixture('vite-clean', { only: ['client-side-only-auth'] });
    expect(findings).toHaveLength(0);
  });
});
