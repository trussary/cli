import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { parseConfig } from '../src/engine/config.js';
import { clampConfidence, meetsMinSeverity } from '../src/engine/severity.js';
import { knownRuleIds } from '../src/rules/registry.js';
import { scanDir } from './helpers/scan.js';

const temps: string[] = [];

function project(files: Record<string, string>): string {
  const root = mkdtempSync(path.join(tmpdir(), 'trussary-engine-'));
  temps.push(root);
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(root, rel);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, content, 'utf8');
  }
  return root;
}

afterEach(() => {
  for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const WEAK_SECRET_APP = {
  'package.json': JSON.stringify({ name: 'app', dependencies: { express: '4.19.2' } }),
  'package-lock.json': JSON.stringify({ lockfileVersion: 3, packages: {} }),
  'server/tokens.js': [
    "const jwt = require('jsonwebtoken');",
    "module.exports = () => jwt.sign({ sub: 1 }, 'supersecret');",
  ].join('\n'),
};

describe('inline suppression', () => {
  it('marks a finding suppressed without deleting it', async () => {
    const root = project({
      ...WEAK_SECRET_APP,
      'server/tokens.js': [
        "const jwt = require('jsonwebtoken');",
        '// trussary-ignore jwt-weak-secret rotating this next sprint',
        "module.exports = () => jwt.sign({ sub: 1 }, 'supersecret');",
      ].join('\n'),
    });
    const { findings } = await scanDir(root, { only: ['jwt-weak-secret'] });

    expect(findings).toHaveLength(1); // still reported, so silencing stays auditable
    expect(findings[0]?.suppressed).toEqual({
      by: 'inline',
      reason: 'rotating this next sprint',
    });
  });

  it('suppresses on the finding own line with the -line form', async () => {
    const root = project({
      ...WEAK_SECRET_APP,
      'server/tokens.js': [
        "const jwt = require('jsonwebtoken');",
        "module.exports = () => jwt.sign({ sub: 1 }, 'supersecret'); // trussary-ignore-line jwt-weak-secret",
      ].join('\n'),
    });
    const { findings } = await scanDir(root, { only: ['jwt-weak-secret'] });
    expect(findings[0]?.suppressed?.by).toBe('inline');
  });

  it('ignores a comment naming a different rule', async () => {
    const root = project({
      ...WEAK_SECRET_APP,
      'server/tokens.js': [
        "const jwt = require('jsonwebtoken');",
        '// trussary-ignore wildcard-cors',
        "module.exports = () => jwt.sign({ sub: 1 }, 'supersecret');",
      ].join('\n'),
    });
    const { findings } = await scanDir(root, { only: ['jwt-weak-secret'] });
    expect(findings[0]?.suppressed).toBeUndefined();
  });
});

describe('.trussaryrc', () => {
  it('disables a rule, overrides a severity, and warns about a typo', () => {
    const root = project({
      '.trussaryrc': JSON.stringify({
        ignore: ['legacy/**'],
        minSeverity: 'high',
        rules: {
          'wildcard-cors': false,
          'jwt-weak-secret': { severity: 'high' },
          'jwt-weak-secrets': { severity: 'low' },
          'no-rate-limit-auth': { minConfidence: 'likely' },
        },
      }),
    });
    const config = parseConfig(path.join(root, '.trussaryrc'), knownRuleIds);

    expect(config.ignore).toEqual(['legacy/**']);
    expect(config.minSeverity).toBe('high');
    expect(config.rules['wildcard-cors']).toBe(false);
    expect(config.rules['jwt-weak-secret']).toEqual({ severity: 'high' });
    expect(config.warnings.join(' ')).toContain('jwt-weak-secrets');
  });

  it('survives a malformed file with a warning instead of a crash', () => {
    const root = project({ '.trussaryrc': '{ not json' });
    const config = parseConfig(path.join(root, '.trussaryrc'), knownRuleIds);

    expect(config.warnings).toHaveLength(1);
    expect(config.rules).toEqual({});
  });

  it('applies a rule override to the finding it produces', async () => {
    const root = project(WEAK_SECRET_APP);
    const { findings } = await scanDir(root, {
      only: ['jwt-weak-secret'],
      config: {
        ignore: [],
        warnings: [],
        rules: { 'jwt-weak-secret': { severity: 'low' } },
      },
    });
    expect(findings[0]?.severity).toBe('low');
  });

  it('drops findings under a per-rule minConfidence', async () => {
    const root = project(WEAK_SECRET_APP);
    const { findings } = await scanDir(root, {
      only: ['jwt-weak-secret'],
      config: {
        ignore: [],
        warnings: [],
        rules: { 'jwt-weak-secret': { minConfidence: 'certain' } },
      },
    });
    expect(findings).toHaveLength(1); // certain clears a 'certain' floor

    const { findings: none } = await scanDir(root, {
      only: ['no-rate-limit-auth'],
      config: {
        ignore: [],
        warnings: [],
        rules: { 'no-rate-limit-auth': { minConfidence: 'likely' } },
      },
    });
    expect(none).toHaveLength(0); // a 'possible' finding is below a 'likely' floor
  });
});

describe('the confidence contract', () => {
  it('clamps a claimed confidence down to the rule cap', () => {
    expect(clampConfidence('certain', 'likely')).toBe('likely');
    expect(clampConfidence('possible', 'certain')).toBe('possible');
  });

  it('no rule can claim more than its own ceiling', async () => {
    const { findings } = await scanDir(path.join('test', 'fixtures', 'express-vulnerable'));
    const caps = new Map(
      (await import('../src/rules/registry.js')).rules.map((r) => [r.id, r.maxConfidence]),
    );
    const order = ['certain', 'likely', 'possible'];

    for (const f of findings) {
      const cap = caps.get(f.id);
      expect(order.indexOf(f.confidence)).toBeGreaterThanOrEqual(order.indexOf(cap as string));
    }
  });
});

describe('severity gating', () => {
  it('treats the gate as "this level or worse"', () => {
    expect(meetsMinSeverity('critical', 'high')).toBe(true);
    expect(meetsMinSeverity('medium', 'high')).toBe(false);
    expect(meetsMinSeverity('high', 'high')).toBe(true);
  });
});
