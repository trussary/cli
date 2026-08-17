import type { Finding, Severity, Stack } from '../rules/types.js';
import type { Locale } from '../i18n/types.js';

export const JSON_SCHEMA_VERSION = 1;

export interface LiveCheckReceipt {
  url: string;
  ownershipAsserted: true;
  assertedAt: string;
  userAgent: string;
  requestsMade: number;
  pathsProbed: string[];
  robotsRespected: boolean;
}

export interface ScanResult {
  schemaVersion: number;
  tool: { name: 'trussary'; version: string };
  scannedAt: string;
  /** POSIX-style for JSON stability; renderers display native separators. */
  root: string;
  target?: { url: string; ownershipAsserted: true };
  stacks: Stack[];
  locale: Locale;
  findings: Finding[];
  counts: Record<Severity, number>;
  suppressedCount: number;
  liveCheck: LiveCheckReceipt | null;
  ruleErrors: { ruleId: string; message: string }[];
  configWarnings: string[];
}

export function countBySeverity(findings: Finding[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) {
    if (!f.suppressed) counts[f.severity]++;
  }
  return counts;
}
