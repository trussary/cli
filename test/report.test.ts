import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildScanContext } from '../src/engine/context.js';
import { EMPTY_CONFIG } from '../src/engine/config.js';
import { runScan } from '../src/engine/scan.js';
import { rules } from '../src/rules/registry.js';
import { countBySeverity, JSON_SCHEMA_VERSION, type ScanResult } from '../src/report/model.js';
import { exitCodeFor } from '../src/report/exit-code.js';
import { renderJson } from '../src/report/json.js';
import { renderMarkdown } from '../src/report/markdown.js';
import { renderTerminal } from '../src/report/terminal.js';
import { FIXTURES } from './helpers/scan.js';
import type { Locale } from '../src/i18n/types.js';

async function resultFor(fixture: string, locale: Locale = 'en'): Promise<ScanResult> {
  const ctx = buildScanContext({
    root: path.join(FIXTURES, fixture),
    locale,
    offline: true,
  });
  const { findings, ruleErrors } = await runScan({ ctx, rules, config: EMPTY_CONFIG });

  return {
    schemaVersion: JSON_SCHEMA_VERSION,
    tool: { name: 'trussary', version: '0.1.0' },
    scannedAt: '2026-01-01T00:00:00.000Z',
    root: `/fixtures/${fixture}`,
    stacks: [...ctx.stacks].sort(),
    locale,
    findings,
    counts: countBySeverity(findings),
    suppressedCount: 0,
    liveCheck: null,
    ruleErrors,
    configWarnings: [],
  };
}

describe('terminal report', () => {
  it('renders the fixture the same way every time', async () => {
    const result = await resultFor('express-vulnerable');
    const output = renderTerminal(result, { locale: 'en', verbose: false, showCta: true });
    expect(output).toMatchSnapshot();
  });

  it('renders Vietnamese end to end, with no untranslated keys left', async () => {
    const result = await resultFor('express-vulnerable', 'vi');
    const output = renderTerminal(result, { locale: 'vi', verbose: false, showCta: true });

    expect(output).not.toMatch(/\b[a-z-]+\.(title|why|how|check|fixedWhen)\b/); // raw key fallback
    expect(output).toContain('Vì sao quan trọng');
    expect(output).toMatchSnapshot();
  });

  it('hides the call to action on request', async () => {
    const result = await resultFor('next-clean');
    const output = renderTerminal(result, { locale: 'en', verbose: false, showCta: false });
    expect(output).not.toContain('trussary.com');
  });
});

describe('markdown report', () => {
  it('renders the fix-block structure', async () => {
    const result = await resultFor('express-vulnerable');
    const output = renderMarkdown(result, 'en');

    expect(output).toContain('| Severity | Count |');
    expect(output).toContain('**Why it matters**');
    expect(output).toContain('**Check whether this is you**');
    expect(output).toContain('**Fixed when**');
    expect(output).toContain('### How to fix');
    expect(output).toMatchSnapshot();
  });
});

describe('json report', () => {
  it('keeps the raw message keys alongside the rendered text', async () => {
    const result = await resultFor('express-vulnerable');
    const parsed = JSON.parse(renderJson(result, 'en'));

    expect(parsed.schemaVersion).toBe(1);
    const finding = parsed.findings[0];
    expect(finding.i18n.title.key).toBe(`${finding.id}.title`);
    expect(finding.title).not.toBe(finding.i18n.title.key); // it really rendered
  });

  it('uses POSIX paths so CI output is stable across platforms', async () => {
    const result = await resultFor('express-vulnerable');
    const parsed = JSON.parse(renderJson(result, 'en'));

    for (const finding of parsed.findings) {
      if (finding.evidence.kind === 'file') expect(finding.evidence.path).not.toContain('\\');
    }
  });
});

describe('exit codes', () => {
  it('is 0 with no gate, however many findings there are', async () => {
    const result = await resultFor('express-vulnerable');
    expect(result.findings.length).toBeGreaterThan(0);
    expect(exitCodeFor(result, undefined)).toBe(0);
  });

  it('is 1 when a finding meets the gate', async () => {
    const result = await resultFor('express-vulnerable');
    expect(exitCodeFor(result, 'high')).toBe(1);
  });

  it('is 0 when the gate is above everything found', async () => {
    const result = await resultFor('next-clean');
    expect(exitCodeFor(result, 'critical')).toBe(0);
  });
});
