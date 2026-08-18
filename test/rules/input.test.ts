import { describe, expect, it } from 'vitest';
import { at, findingsFor, scanFixture } from '../helpers/scan.js';

describe('sql-string-interpolation', () => {
  it('flags a query built by concatenation', async () => {
    const { findings } = await scanFixture('express-vulnerable', {
      only: ['sql-string-interpolation'],
    });
    const hits = findingsFor(findings, 'sql-string-interpolation');

    expect(hits).toHaveLength(1);
    expect(hits[0]?.confidence).toBe('likely');
    expect(at(hits[0]!)).toBe('src/routes/items.js:6');
  });

  it('leaves parameterised queries alone', async () => {
    const { findings } = await scanFixture('express-vulnerable', {
      only: ['sql-string-interpolation'],
    });
    expect(findings.map((f) => at(f))).not.toContain('src/auth.js:6');
  });
});

describe('write-endpoint-no-validation', () => {
  it('flags a body written straight to the database', async () => {
    const { findings } = await scanFixture('express-vulnerable', {
      only: ['write-endpoint-no-validation'],
    });
    const hits = findingsFor(findings, 'write-endpoint-no-validation');

    expect(hits).toHaveLength(1);
    expect(hits[0]?.confidence).toBe('possible');
    expect(at(hits[0]!)).toBe('src/routes/items.js:11');
  });

  it('does not treat a model completion call as a database write', async () => {
    const { findings } = await scanFixture('express-vulnerable', {
      only: ['write-endpoint-no-validation'],
    });
    expect(findings.map((f) => at(f))).not.toContain('src/routes/chat.js:9');
  });
});

describe('lockfile-missing', () => {
  it('reports a project with no lockfile as certain', async () => {
    const { findings } = await scanFixture('express-vulnerable', { only: ['lockfile-missing'] });
    const hit = findingsFor(findings, 'lockfile-missing')[0];

    expect(hit).toBeDefined();
    expect(hit?.confidence).toBe('certain');
    expect(hit?.severity).toBe('medium');
  });

  it('stays quiet when a lockfile is committed', async () => {
    const { findings } = await scanFixture('next-clean', { only: ['lockfile-missing'] });
    expect(findings).toHaveLength(0);
  });
});
