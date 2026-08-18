import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { buildScanContext } from '../src/engine/context.js';
import { FIXTURES, scanFixture } from './helpers/scan.js';
import type { Stack } from '../src/rules/types.js';

async function scanCtx(fixture: string): Promise<Set<Stack>> {
  return buildScanContext({ root: path.join(FIXTURES, fixture), locale: 'en', offline: true }).stacks;
}

/**
 * The negative controls. A rule that lights up on a correctly-built app is a
 * rule that costs the user trust — these two fixtures must stay at zero.
 */
describe('clean fixtures', () => {
  for (const fixture of ['next-clean', 'vite-clean']) {
    it(`${fixture} produces no findings at all`, async () => {
      const { findings, ruleErrors } = await scanFixture(fixture);
      expect(
        findings.map((f) => `${f.id} (${f.severity}/${f.confidence})`),
      ).toEqual([]);
      expect(ruleErrors).toEqual([]);
    });
  }
});

describe('stack detection', () => {
  it('recognises the stacks the clean fixtures declare', async () => {
    const next = await scanCtx('next-clean');
    const vite = await scanCtx('vite-clean');

    expect([...next].sort()).toEqual(['next', 'supabase']);
    expect([...vite].sort()).toEqual(['supabase', 'vercel', 'vite-react']);
  });
});
