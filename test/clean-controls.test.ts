import { describe, expect, it } from 'vitest';
import { scanFixture } from './helpers/scan.js';

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
