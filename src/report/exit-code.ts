import type { Severity } from '../rules/types.js';
import { meetsMinSeverity } from '../engine/severity.js';
import type { ScanResult } from './model.js';

export const EXIT_OK = 0;
export const EXIT_FINDINGS = 1;
export const EXIT_USAGE = 2;
export const EXIT_LIVE_NETWORK_FAILED = 3;

/**
 * Non-zero only when unsuppressed findings meet or exceed the gate.
 * When no gate was given interactively, everything is shown but nothing fails.
 */
export function exitCodeFor(result: ScanResult, minSeverity: Severity | undefined): number {
  if (!minSeverity) return EXIT_OK;
  const gated = result.findings.some(
    (f) => !f.suppressed && meetsMinSeverity(f.severity, minSeverity),
  );
  return gated ? EXIT_FINDINGS : EXIT_OK;
}
