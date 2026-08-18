import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EMPTY_CONFIG, type TrussaryConfig } from '../../src/engine/config.js';
import { buildScanContext } from '../../src/engine/context.js';
import { runScan, type ScanRunResult } from '../../src/engine/scan.js';
import { rules as allRules } from '../../src/rules/registry.js';
import type { Finding, Rule } from '../../src/rules/types.js';

const here = path.dirname(fileURLToPath(import.meta.url));

export const FIXTURES = path.join(here, '..', 'fixtures');
export const FALSE_POSITIVES = path.join(here, '..', 'false-positives');

export interface ScanOptions {
  /** Restrict to these rule ids; default is the whole registry. */
  only?: string[];
  config?: TrussaryConfig;
  offline?: boolean;
}

/**
 * Scan a directory the way the CLI does, minus flag parsing and rc discovery —
 * tests must never pick up a .trussaryrc from a parent of the repo.
 */
export async function scanDir(dir: string, opts: ScanOptions = {}): Promise<ScanRunResult> {
  const rules: Rule[] = opts.only ? allRules.filter((r) => opts.only?.includes(r.id)) : allRules;

  const ctx = buildScanContext({
    root: dir,
    locale: 'en',
    offline: opts.offline ?? true, // tests never touch the network unless they say so
  });

  return runScan({ ctx, rules, config: opts.config ?? EMPTY_CONFIG });
}

export function scanFixture(name: string, opts?: ScanOptions): Promise<ScanRunResult> {
  return scanDir(path.join(FIXTURES, name), opts);
}

export function idsOf(findings: Finding[]): string[] {
  return findings.map((f) => f.id).sort();
}

export function findingsFor(findings: Finding[], id: string): Finding[] {
  return findings.filter((f) => f.id === id);
}

/** file:line of a finding, for readable assertions. */
export function at(f: Finding): string {
  return f.evidence.kind === 'file' ? `${f.evidence.path}:${f.evidence.line}` : f.evidence.kind;
}
