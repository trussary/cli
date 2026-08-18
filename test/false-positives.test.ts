import { describe, expect, it } from 'vitest';
import { scanDir, FALSE_POSITIVES } from './helpers/scan.js';

/**
 * The regression suite for trust. Everything in test/false-positives/ is code
 * that is safe but tempting to flag: public-by-design keys, hashes, data URIs,
 * guarded routes, parameterised queries, verified webhooks, stated limits.
 *
 * When a real-world false positive is reported, it gets added here first — the
 * test goes red — and only then is the rule defanged.
 */
describe('false positives', () => {
  it('the whole corpus produces zero findings', async () => {
    const { findings, ruleErrors } = await scanDir(FALSE_POSITIVES);
    expect(
      findings.map((f) => {
        const where = f.evidence.kind === 'file' ? `${f.evidence.path}:${f.evidence.line}` : 'absence';
        return `${f.id} at ${where}`;
      }),
    ).toEqual([]);
    expect(ruleErrors).toEqual([]);
  });
});
