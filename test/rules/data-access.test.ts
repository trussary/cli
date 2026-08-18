import { describe, expect, it } from 'vitest';
import { at, findingsFor, scanFixture } from '../helpers/scan.js';

describe('supabase-rls-missing', () => {
  it('reports one critical finding when no migration turns RLS on', async () => {
    const { findings } = await scanFixture('next-supabase-vulnerable', {
      only: ['supabase-rls-missing'],
    });
    const hits = findingsFor(findings, 'supabase-rls-missing');

    expect(hits).toHaveLength(1);
    expect(hits[0]?.severity).toBe('critical');
    expect(hits[0]?.confidence).toBe('likely'); // dashboard policies are invisible to a file scan
    expect(at(hits[0]!)).toBe('supabase/migrations/0001_init.sql:2');
  });

  it('names the tables it found so the reader can check them', async () => {
    const { findings } = await scanFixture('next-supabase-vulnerable', {
      only: ['supabase-rls-missing'],
    });
    expect(findings[0]?.title.vars?.['tables']).toBe('users, messages');
  });

  it('stays quiet when every table has RLS and a policy', async () => {
    const { findings } = await scanFixture('next-clean', { only: ['supabase-rls-missing'] });
    expect(findings).toHaveLength(0);
  });
});

describe('public-storage-bucket', () => {
  it('flags a bucket inserted with public = true', async () => {
    const { findings } = await scanFixture('next-supabase-vulnerable', {
      only: ['public-storage-bucket'],
    });
    const hit = findingsFor(findings, 'public-storage-bucket')[0];

    expect(hit).toBeDefined();
    expect(hit?.severity).toBe('high');
    expect(hit?.title.vars?.['bucket']).toBe('user-uploads');
  });

  it('stays quiet in a project with no buckets', async () => {
    const { findings } = await scanFixture('next-clean', { only: ['public-storage-bucket'] });
    expect(findings).toHaveLength(0);
  });
});
